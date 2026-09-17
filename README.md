# FABLE: Insider Threat Detection & Just-In-Time Access Control System

FABLE is an enterprise behavioral security platform designed to identify subtle behavioral transitions before security incidents occur. By establishing statistical user baselines, incorporating contextual justifications, and providing transparent explainability, FABLE enables early detection of potentially dangerous account shifts while minimizing false positives.

---

## Key Features & Architecture

- **7-Constituent Risk Detection Pipeline**: Combines self-baseline deviation, peer-cohort deviation (k-means), privilege escalation, asset sensitivity, temporal sequence strength, unsupervised Isolation Forest anomaly scoring, and login risk.
- **Noisy-OR Risk Fusion**: Fuses constituent signal probabilities with context attenuation credits while enforcing non-suppressible floor boundaries (25.0% floor per critical event).
- **14-State JIT Access Control Engine**: Manages Just-In-Time access request lifecycles with deterministic policy evaluation, Groq AI advisory reviews, separation of duties, and optimistic concurrency locking.
- **Append-Only SHA-256 Audit Chain**: Every state transition appends a cryptographically linked `AuditRecord` hash chain guaranteeing tamper-evident audit history.
- **Transactional Outbox Worker Pattern**: Asynchronous HMAC-signed webhook execution preventing dual-write failures between database state and external enforcement points.
- **Role-Based Access Control (RBAC)**: Strict tenant isolation (`tenant_id`) and scope enforcement (`security.py`).

---

## Benchmark Evaluation & Ablation Study

FABLE was benchmarked across **30 synthetic user organizations and 12 behavioral scenario classes** (normal work, role changes, incident spikes, slow exfiltration, privilege escalation, credential compromise, new-device usage, remote travel, holidays, project migrations, sparse new hires, and baseline poisoning).

| System Architecture | Precision | Recall | F1 Score | False Positive Rate | Alert Reduction % | Context Acc. % | Lead Time |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **FABLE (Full Pipeline)** | **100.0%** | **100.0%** | **100.0%** | **0.0%** | **+100.0%** | **100.0%** | **0.5h** |
| **Baseline 1: Simple Threshold** | `57.9%` | `100.0%` | `73.3%` | `38.1%` | `+0.0%` | `42.9%` | `0.0h` |
| **Baseline 2: Z-Score Only** | `39.3%` | `100.0%` | `56.4%` | `81.0%` | `-112.5%` | `0.0%` | `0.0h` |
| **Baseline 3: Isolation Forest Only** | `84.6%` | `100.0%` | `91.7%` | `9.5%` | `+75.0%` | `85.7%` | `0.0h` |
| **Baseline 4: FABLE No-Context (Ablation)** | `78.6%` | `100.0%` | `88.0%` | `14.3%` | `+62.5%` | `78.6%` | `0.0h` |
| **Baseline 5: FABLE No-Changepoint (Ablation)** | `100.0%` | `72.7%` | `84.2%` | `0.0%` | `+100.0%` | `100.0%` | `0.5h` |

Detailed ablation breakdown: [BENCHMARK.md](BENCHMARK.md).

---

## Locked Demonstration Scenarios

FABLE comes pre-loaded with four locked seed scenarios representing distinct behavioral profiles:

| Scenario | Actor | Raw Deviation | Context Coverage | Residual Risk | Risk Level | Primary Disposition |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Priya Ramesh** | SRE Lead | `100.0` | `1.000` | `25.0` | Resolved | Emergency bastion access during Sev-1 outage; fully covered by PagerDuty shift #88219. |
| **Devraj Malhotra** | Senior Engineer | `100.0` | `0.000` | `100.0` | Escalated | Unapproved Vault master secret read from foreign ASN followed by 4.8 GB database export. |
| **Arjun Patel** | Data Engineer | `100.0` | `0.5905` | `100.0` | Reviewing | KMS key rotation (explained by RFC-3982) with 1.2 GB finance export requiring late context review (`FIN-AUDIT-2026`). |
| **Neha Sharma** | New Hire | `25.0` | `0.000` | `25.0` | Sparse | Onboarding developer (Day 3); sparse baseline defers covariance calculation without triggering containment. |

---

## Quickstart & Installation

### Option 1: Running with Docker Compose (Recommended)

To launch the complete platform including API, React UI, PostgreSQL 16, Redis, and Outbox Worker:

```bash
docker-compose up --build -d
```

- **Frontend Dashboard**: http://localhost:3000
- **FastAPI OpenAPI Documentation**: http://localhost:8000/docs
- **API Health Endpoint**: http://localhost:8000/health

### Option 2: Running Locally

#### Backend Setup:
```bash
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

---

## Running Automated Tests & Benchmark Evaluation

Run the full pytest suite across behavioral threat models, case building, and JIT access control:

```bash
cd backend
python -m pytest tests/ -v
```

Execute the 30-organization comparative benchmark harness & ablation study:

```bash
cd backend
python -m eval.benchmark
```

---

## System Documentation

- [BENCHMARK.md](BENCHMARK.md): Empirical benchmark evaluation matrix comparing FABLE against 5 detection baselines & ablations.
- [ARCHITECTURE.md](ARCHITECTURE.md): System architecture, 7-constituent engine details, state machine diagram, and outbox worker specification.
- [THREAT_MODEL.md](THREAT_MODEL.md): STRIDE threat matrix, AI circuit breaker mitigation, and separation of duties enforcement.
- [RUNBOOK.md](RUNBOOK.md): Operational guide, emergency break-glass revocation procedures, and audit chain verification steps.
- [API_CONTRACT.md](API_CONTRACT.md): Complete REST endpoint contract for behavioral cases and JIT access requests.
