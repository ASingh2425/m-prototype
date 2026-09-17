# Threat Model & Security Architecture

## Executive Summary

FABLE is built to operate in high-consequence environments where accounts may be compromised by sophisticated malicious insiders or external threat actors possessing valid credentials. This document defines the STRIDE threat model, security invariants, and technical countermeasures.

---

## STRIDE Threat Matrix

| Threat Category | Threat Description | Attack Vector | Countermeasure & Verification |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Adversary impersonates a SOC Analyst or Approver to issue JIT grants. | Stolen API tokens, forged headers. | Bearer token scope enforcement (`security.py`) and OIDC RS256 token verification. |
| **Tampering** | Adversary modifies audit logs or risk history to cover malicious activity. | Direct database modification or API state tampering. | SHA-256 append-only cryptographic hash chain (`verify_audit_chain()`). Immutable database constraints on `ContextLedgerEntry`. |
| **Repudiation** | Approver denies approving an elevated privilege grant. | Unauthenticated or ambiguous approvals. | Idempotency key mapping, principal subject binding in `ApprovalDecision`, signed audit records. |
| **Information Disclosure** | Unauthorized user views sensitive employee PII or internal resource paths. | REST API parameter tampering. | Pseudonymous ID representation (`usr-xxxx`), RBAC tenant isolation (`tenant_id` scoping). |
| **Denial of Service** | Replay of expensive risk recomputations or AI review flooding. | Replaying creation requests or API spam. | Mandatory 8–128 character `Idempotency-Key` headers, circuit breaker pattern on Groq API (`ai_review.py`). |
| **Elevation of Privilege** | Proposer approves their own context grant or JIT access request. | Self-approval attempt via API. | **Separation of Duties**: Proposer subject check (`entry.proposed_by != principal.subject`) enforces mandatory reviewer sign-off. |

---

## AI Review Safeguards & Circuit Breaker

The system integrates Groq LLM advisory reviews for JIT access requests. To prevent LLM vulnerabilities:
1. **Advisory Only Constraint**: AI recommendations (`ai_review_status`) are strictly advisory and can NEVER automatically authorize high-risk grants or override policy rules (`ai_advisory_only = True`).
2. **Prompt Injection Mitigation**: Business justifications and input telemetry are sanitized and passed in structured JSON blocks.
3. **Circuit Breaker**: When Groq rate limits, timeouts, or API errors occur, the circuit breaker opens, falling back safely to deterministic policy decisions without stalling approval queues.
