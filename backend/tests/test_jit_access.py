"""Tests for JIT Access Control state machine, policy engine, approvals, audit chain, and enforcement."""

import json
import pytest

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from api.access_routes import access_router
from database import Base, get_db
from access_control.audit import verify_audit_chain
from models.db_models import AccessRequest, AuditRecord, Entity
from seed.scenarios import run_seed


KEYS = {
    "analyst-key": {"subject": "analyst-1", "role": "analyst", "tenant_id": "tenant-test"},
    "reviewer-key": {"subject": "reviewer-1", "role": "reviewer", "tenant_id": "tenant-test"},
    "admin-key": {"subject": "admin-1", "role": "admin", "tenant_id": "tenant-test"},
}


def _auth(key):
    return {"Authorization": f"Bearer {key}"}


def _client(monkeypatch):
    monkeypatch.setenv("FABLE_API_KEYS", json.dumps(KEYS))
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    run_seed(session)
    
    app = FastAPI()
    app.include_router(access_router)

    def override_db():
        yield session

    app.dependency_overrides[get_db] = override_db
    return TestClient(app), session


def test_jit_access_full_lifecycle(monkeypatch):
    client, session = _client(monkeypatch)
    headers_analyst = {**_auth("analyst-key"), "Idempotency-Key": "key-create-001"}
    headers_reviewer = {**_auth("reviewer-key"), "Idempotency-Key": "key-approve-001"}

    with client:
        # 1. Create Access Request (Workflow state: PAUSED)
        create_resp = client.post(
            "/api/v1/access-requests",
            headers=headers_analyst,
            json={
                "subject_identity": "usr-arjun-107",
                "resource_id": "res-db-prod-finance",
                "resource_sensitivity": "internal",
                "requested_action": "query",
                "requested_permission": "read_only",
                "business_justification": "FIN-AUDIT-2026 Q3 audit compliance verification",
                "requested_duration_seconds": 3600,
                "device_trust": "trusted",
                "authentication_strength": "mfa",
            },
        )
        assert create_resp.status_code == 201
        req_data = create_resp.json()
        request_id = req_data["id"]
        assert req_data["workflow_state"] == "PAUSED"

        # 2. Attach Verified Evidence (Transitions PAUSED -> EVIDENCE_READY)
        ev_resp = client.post(
            f"/api/v1/access-requests/{request_id}/evidence",
            headers={**_auth("reviewer-key"), "Idempotency-Key": "key-evidence-001"},
            json={
                "evidence_type": "ticket",
                "source": "Jira",
                "external_reference": "FIN-AUDIT-2026",
                "source_created_at": "2026-09-01T00:00:00Z",
                "effective_from": "2026-09-01T00:00:00Z",
                "effective_until": "2026-10-01T00:00:00Z",
                "identity_scope": ["usr-arjun-107"],
                "resource_scope": ["res-db-prod-finance"],
                "action_scope": ["query"],
                "verification_status": "verified",
            },
        )
        assert ev_resp.status_code == 201

        # 3. Evaluate Policy Engine (State: EVIDENCE_READY)
        eval_resp = client.post(
            f"/api/v1/access-requests/{request_id}/evaluate",
            headers={**_auth("analyst-key"), "Idempotency-Key": "key-eval-001"},
        )
        assert eval_resp.status_code == 200
        eval_data = eval_resp.json()
        assert "policy_decision" in eval_data

        # 4. Fetch updated request to get version after evaluation
        updated_req = client.get(
            f"/api/v1/access-requests/{request_id}",
            headers=_auth("analyst-key"),
        ).json()
        assert updated_req["workflow_state"] in {"EVIDENCE_READY", "AWAITING_APPROVAL"}

        # 5. Approve Access Request (Reviewer) -> Transitions to ENFORCING / ACTIVE
        app_resp = client.post(
            f"/api/v1/access-requests/{request_id}/approve",
            headers=headers_reviewer,
            json={
                "decision": "approve",
                "note": "Verified ticket FIN-AUDIT-2026 and compliance scope.",
                "expected_version": updated_req["version"],
            },
        )
        assert app_resp.status_code == 200
        approved_data = app_resp.json()
        assert approved_data["workflow_state"] in {"ENFORCING", "ACTIVE"}

        # 6. Fetch Active Grant
        grant_resp = client.get(
            f"/api/v1/access-requests/{request_id}/grant",
            headers=_auth("reviewer-key"),
        )
        assert grant_resp.status_code == 200
        grant_data = grant_resp.json()
        assert grant_data["request_id"] == request_id
        assert grant_data["exact_resource"] == "res-db-prod-finance"

        # 7. Audit History & SHA-256 Hash Chain Verification
        hist_resp = client.get(
            f"/api/v1/access-requests/{request_id}/history",
            headers=_auth("reviewer-key"),
        )
        assert hist_resp.status_code == 200
        hist_data = hist_resp.json()
        assert hist_data["audit_chain_valid"] is True
        assert len(hist_data["transitions"]) > 0

    session.close()


def test_idempotency_replay(monkeypatch):
    client, session = _client(monkeypatch)
    headers = {**_auth("analyst-key"), "Idempotency-Key": "key-idempotency-test"}

    body = {
        "subject_identity": "usr-neha-112",
        "resource_id": "res-gcs-dev-sandbox",
        "resource_sensitivity": "internal",
        "requested_action": "read",
        "requested_permission": "read_only",
        "business_justification": "Onboarding sandbox setup",
        "requested_duration_seconds": 1800,
    }

    with client:
        first = client.post("/api/v1/access-requests", headers=headers, json=body)
        assert first.status_code == 201

        replay = client.post("/api/v1/access-requests", headers=headers, json=body)
        assert replay.status_code == 200
        assert replay.json()["id"] == first.json()["id"]

    session.close()


def test_optimistic_lock_conflict_on_revoke(monkeypatch):
    client, session = _client(monkeypatch)
    headers_admin = {**_auth("admin-key"), "Idempotency-Key": "key-admin-001"}

    with client:
        req = client.post(
            "/api/v1/access-requests",
            headers=headers_admin,
            json={
                "subject_identity": "usr-priya-101",
                "resource_id": "res-k8s-prod-cluster",
                "resource_sensitivity": "internal",
                "requested_action": "read",
                "requested_permission": "read_only",
                "business_justification": "Emergency triage hotfix",
                "requested_duration_seconds": 900,
                "device_trust": "trusted",
                "authentication_strength": "mfa",
            },
        ).json()

        # Attach evidence
        client.post(
            f"/api/v1/access-requests/{req['id']}/evidence",
            headers={**_auth("admin-key"), "Idempotency-Key": "key-admin-ev"},
            json={
                "evidence_type": "ticket",
                "source": "PagerDuty",
                "external_reference": "INC-88219",
                "source_created_at": "2026-09-01T00:00:00Z",
                "effective_from": "2026-09-01T00:00:00Z",
                "effective_until": "2026-10-01T00:00:00Z",
                "verification_status": "verified",
            },
        )

        # Evaluate
        eval_data = client.post(
            f"/api/v1/access-requests/{req['id']}/evaluate",
            headers={**_auth("admin-key"), "Idempotency-Key": "key-admin-eval"},
        ).json()

        # Approve
        app_data = client.post(
            f"/api/v1/access-requests/{req['id']}/approve",
            headers={**_auth("admin-key"), "Idempotency-Key": "key-admin-app"},
            json={"decision": "approve", "note": "Emergency approved", "expected_version": eval_data["request"]["version"]},
        ).json()

        # Try revoking with wrong version
        bad_revoke = client.post(
            f"/api/v1/access-requests/{req['id']}/revoke",
            headers={**_auth("admin-key"), "Idempotency-Key": "key-admin-rev-bad"},
            json={"note": "Wrong version", "expected_version": 99999},
        )
        assert bad_revoke.status_code == 409

    session.close()
