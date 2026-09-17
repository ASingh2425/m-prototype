# FABLE Operational & Incident Response Runbook

## Overview

This runbook outlines operational procedures, incident response steps, emergency break-glass protocols, and maintenance operations for security operations center (SOC) analysts and site reliability engineers (SREs).

---

## Quick Reference Commands

### Check System & Database Health
```bash
curl -s http://localhost:8000/health
curl -s -H "Authorization: Bearer admin-key" http://localhost:8000/api/v1/admin/access-health
```

### Run Full Pytest Test Suite
```bash
cd backend
python -m pytest tests/ -v
```

### Spin Up Full Local Stack via Docker
```bash
docker-compose up --build -d
docker-compose ps
```

---

## Operational Procedures

### Incident Procedure 1: Emergency Access Revocation

When an account is determined to be compromised or performing unauthorized data exfiltration:

1. **Locate Active Access Grant**:
   ```bash
   curl -X GET "http://localhost:8000/api/v1/access-requests?state=ACTIVE" \
     -H "Authorization: Bearer reviewer-key"
   ```
2. **Execute Revocation**:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/access-requests/{request_id}/revoke" \
     -H "Authorization: Bearer reviewer-key" \
     -H "Idempotency-Key: emergency-revoke-$(date +%s)" \
     -H "Content-Type: application/json" \
     -d '{"note": "Emergency security containment triggered", "expected_version": 2}'
   ```
3. **Verify Outbox Dispatch**:
   Check outbox queue for webhook execution logs:
   ```bash
   docker-compose logs --tail=50 worker
   ```

### Incident Procedure 2: Investigating Audit Hash Chain Breakage

If audit integrity validation fails:
1. Fetch history for the target request:
   ```bash
   curl -s -H "Authorization: Bearer reviewer-key" \
     "http://localhost:8000/api/v1/access-requests/{request_id}/history"
   ```
2. Check `audit_chain_valid` boolean. If `false`, extract `audit_records` array and isolate the index where `record_hash` diverges from `previous_record_hash`.
3. Escalate immediately to Security Engineering and flag database read-only maintenance mode.

---

## Database Migration & Maintenance

### Running Alembic Database Migrations
```bash
cd backend
alembic upgrade head
```

### Reseed Seed Scenarios (Development Only)
```bash
curl -X POST "http://localhost:8000/admin/reseed" \
  -H "Authorization: Bearer admin-key"
```
*(Requires `FABLE_ENABLE_RESEED=1` environment variable set).*
