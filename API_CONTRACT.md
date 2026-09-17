# Fable API contract & Just-In-Time (JIT) Access Control Specification

This contract describes the complete FABLE API including behavioral anomaly detection routes (`/api/...`) and Just-In-Time access control routes (`/api/v1/...`). OpenAPI documentation at `/docs` contains generated JSON schemas.

---

## Authentication & Authorization

Every route requires `Authorization: Bearer <key>`. Missing or invalid keys return `401`; a valid key without the required scope returns `403`; a server with no `FABLE_API_KEYS` configuration returns `503`. `/health` is the sole public route.

Idempotency is enforced on all mutation routes using the mandatory `Idempotency-Key` header (8 to 128 characters).

---

## Behavioral Risk & Cases API (`/api/...`)

| Method | Route | Scope | Description |
|---|---|---|---|
| `GET` | `/api/entities` | `read` | List all pseudonymous entities. |
| `GET` | `/api/entities/{entity_ref}` | `read` | Get specific entity details. |
| `GET` | `/api/entities/{entity_ref}/events` | `read` | List historical events for an entity. |
| `POST` | `/api/entities/{entity_ref}/events` | `events:write` | Ingest telemetry event and trigger risk recomputation. |
| `GET` | `/api/entities/{entity_ref}/context` | `read` | List context ledger entries for entity. |
| `POST` | `/api/entities/{entity_ref}/context` | `context:propose` | Propose new context ledger entry (Pending review). |
| `POST` | `/api/context/{entry_id}/review` | `context:approve` | Approve or reject proposed context revision. |
| `GET` | `/api/cases` | `read` | List ranked threat cases by priority score. |
| `GET` | `/api/cases/{case_id}` | `read` | Get case detail with 7-constituent breakdown. |
| `GET` | `/api/cases/{case_id}/counterfactual` | `read` | Calculate counterfactual waterfall deltas. |
| `POST` | `/api/cases/{case_id}/feedback` | `feedback:write` | Submit analyst feedback on case verdict. |
| `GET` | `/api/cases/{case_id}/shift-map-data` | `read` | Fetch baseline shift map graph data. |
| `GET` | `/api/cases/{case_id}/response-actions` | `read` | List response action plans for a case. |
| `POST` | `/api/cases/{case_id}/response-actions/preview` | `response:preview` | Preview containment action scope & blast radius. |
| `POST` | `/api/cases/{case_id}/response-actions` | `response:request` | Request targeted response action execution. |
| `POST` | `/api/response-actions/{action_id}/approve` | `response:approve` | Authorize requested containment action. |
| `POST` | `/api/response-actions/{action_id}/reject` | `response:approve` | Reject proposed containment action. |
| `POST` | `/api/response-actions/{action_id}/execute` | `response:execute` | Execute containment action via enforcement provider. |
| `POST` | `/api/response-actions/{action_id}/rollback` | `response:rollback` | Roll back an active containment action. |
| `GET` | `/api/cases/{case_id}/evidence-graph` | `read` | Fetch NetworkX evidence graph topology. |

---

## Just-In-Time (JIT) Access Control API (`/api/v1/...`)

| Method | Route | Scope | Description |
|---|---|---|---|
| `POST` | `/api/v1/access-requests` | `access:create` | Create a new JIT access request. |
| `GET` | `/api/v1/access-requests` | `access:read` | List access requests filtered by state or resource. |
| `GET` | `/api/v1/access-requests/{id}` | `access:read` | Get JIT access request detail and current state. |
| `GET` | `/api/v1/access-requests/{id}/history` | `access:read` | Retrieve transition history and audit hash chain status. |
| `POST` | `/api/v1/access-requests/{id}/evidence` | `access:evidence` | Attach justification evidence or ticket links. |
| `POST` | `/api/v1/access-requests/{id}/evaluate` | `access:evaluate` | Evaluate policy engine rules deterministically. |
| `POST` | `/api/v1/access-requests/{id}/ai-review` | `access:ai_review` | Queue Groq AI advisory review. |
| `POST` | `/api/v1/access-requests/{id}/request-context` | `access:request_context` | Flag request as needing additional context. |
| `POST` | `/api/v1/access-requests/{id}/approve` | `access:approve` | Approve JIT request and issue grant. |
| `POST` | `/api/v1/access-requests/{id}/deny` | `access:deny` | Deny JIT access request. |
| `POST` | `/api/v1/access-requests/{id}/revoke` | `access:revoke` | Revoke active access grant before TTL expiry. |
| `GET` | `/api/v1/access-requests/{id}/grant` | `access:read` | Fetch active access grant enforcement details. |
| `GET` | `/api/v1/notifications` | `access:read` | Fetch pending access notifications. |
| `POST` | `/api/v1/notifications/{id}/acknowledge` | `access:read` | Acknowledge a notification item. |
| `GET` | `/api/v1/admin/access-policy` | `access:admin` | View configured maximum TTLs and policy info. |
| `GET` | `/api/v1/admin/access-health` | `access:admin` | Check outbox lag, database, and enforcement health. |

---

## 14-State State Machine Transitions

```
DRAFT -> PAUSED -> EVIDENCE_READY -> EVALUATED -> AI_REVIEWED -> AWAITING_APPROVAL -> APPROVED -> ENFORCING -> ACTIVE -> EXPIRED
  |         |             |             |             |                  |                 |            |           |
  v         v             v             v             v                  v                 v            v           v
DENIED   CANCELLED    CANCELLED     CANCELLED     CANCELLED            DENIED           FAILED       FAILED      REVOKED
```

Optimistic locking is enforced via incremental `version` numbers. Mismatched version headers on state transitions yield `409 Conflict`.
