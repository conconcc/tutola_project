# SECURITY_OWASP_CHECKLIST.md

## Scope
- Target: `POST /api/interpret`
- Related modules:
  - `src/app/api/interpret/route.ts`
  - `src/server/services/commandInterpreter.ts`
  - `src/server/services/aiAdapter.ts`
  - `src/features/scenario-engine/domain/schemas.ts`

## OWASP Top 10 Review (2021)

### A01 Broken Access Control
- Status: **Partially Addressed**
- Current:
  - Session-based auth guard added (`x-session-id`)
  - Bootstrap session issuing endpoint: `POST /api/auth/session` (API key required)
- Risk:
  - Any client can invoke interpret API
- Action:
  - Add auth middleware/session validation before production
  - Add per-user authorization policy for scenario access

### A02 Cryptographic Failures
- Status: **Not Applicable (Current Scope)**
- Current:
  - No credential storage or sensitive crypto operation in this API flow
- Action:
  - If PII/token handling is added, enforce encryption-at-rest/in-transit policy

### A03 Injection
- Status: **Addressed (Current Scope)**
- Current hardening:
  - JSON-only content type check
  - Zod schema validation for all request body fields
  - Deterministic rule-based interpreter (no eval/dynamic execution)
- Remaining:
  - If DB/LLM prompt chaining is introduced, add explicit sanitization/allow-list

### A04 Insecure Design
- Status: **Partially Addressed**
- Current:
  - Fallback-first deterministic behavior
  - Input length/key-count limits
  - Basic request throttling (in-memory, per client key)
- Remaining:
  - Add threat model and abuse-case tests (spam/replay/high-volume payloads)

### A05 Security Misconfiguration
- Status: **Partially Addressed**
- Current:
  - Standardized error response and HTTP status code usage
  - Raw request reflection removed from error body
- Remaining:
  - Add security headers/rate limiting/WAF policy at deployment layer

### A06 Vulnerable and Outdated Components
- Status: **To Be Tracked**
- Current:
  - Dependencies are newly installed
- Action:
  - Run periodic `npm audit` and patch cadence policy

### A07 Identification and Authentication Failures
- Status: **Partially Addressed**
- Current:
  - Session issuance + session validation flow implemented
- Action:
  - Replace in-memory session store with Redis/Postgres-backed store before production

### A08 Software and Data Integrity Failures
- Status: **Partially Addressed**
- Current:
  - AI output is schema validated before use
- Remaining:
  - Add signed CI artifacts/dependency lock verification in pipeline

### A09 Security Logging and Monitoring Failures
- Status: **Partially Addressed**
- Current:
  - Structured security logs added (`requestId`, event, statusCode)
- Action:
  - Add request-id + structured logging for errorCode/status/source

### A10 Server-Side Request Forgery (SSRF)
- Status: **Not Applicable (Current Scope)**
- Current:
  - No outbound URL fetch in interpret path
- Action:
  - If external fetch is added, allow-list host + block private ranges

## API/Data Connection Checklist

### API Connection Flow
1. `route.ts` parses and validates request (`interpretRequestSchema`)
0. `guardSession` validates `x-session-id`
2. `commandInterpreter.ts` calls `AIAdapter`
3. `aiAdapter.ts` returns deterministic command
4. `commandSchema` validates command before response

Status: **Connected and verified by tests**

### Data Validation Coverage
- Request DTO validation: yes (`interpretRequestSchema`)
- Command DTO validation: yes (`commandSchema`)
- Length/shape constraints:
  - `naturalLanguageInput` max 500 chars
  - `currentState` max 100 keys

Status: **Baseline complete**

## Error Code System

Defined in `src/server/errors/errorCodes.ts`:
- `INVALID_JSON` → malformed JSON body
- `UNSUPPORTED_MEDIA_TYPE` → non-JSON content type
- `INVALID_REQUEST_SCHEMA` → schema validation failure
- `INTERNAL_ERROR` → unexpected server failure
- `AUTH_REQUIRED` → missing auth header when API key required
- `INVALID_API_KEY` → invalid bearer token
- `RATE_LIMITED` → too many requests

Status: **Implemented**

## Next Hardening Backlog
1. Add authentication/authorization policy (A01/A07)
2. Add rate limiting and abuse throttling (A04/A05)
3. Add structured security logging and request tracing (A09)
4. Add dependency security checks in CI (A06/A08)
