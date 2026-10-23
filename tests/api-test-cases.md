# Claimora API Test Cases

This document defines the automated and manual test cases covering functional, security, and edge-case requirements for the Claimora platform.

---

## 1. Authentication & User Management (Owner: Vidhi)

| Test ID | Endpoint / Action | Input Payload / Precondition | Expected Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-AUTH-001` | `POST /api/auth/login` | Valid credentials (`vidhi.admin@claimora.internal` / valid password) | `200 OK` | Returns JWT token, user object with role `ADMIN`. |
| `TC-AUTH-002` | `POST /api/auth/login` | Invalid password or unregistered email | `401 Unauthorized` | Standard JSON error: `{status: 401, error: "Unauthorized"}`. |
| `TC-USR-001` | `GET /api/users` | Valid Admin Bearer token | `200 OK` | Paginated array of users without exposing `password_hash`. |
| `TC-USR-002` | `POST /api/users` | Duplicate email address | `400 Bad Request` | Fails unique email constraint; returns validation message. |

---

## 2. Product & Warranty Validation (Owner: Shaili)

| Test ID | Endpoint / Action | Input Payload / Precondition | Expected Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-PROD-001` | `POST /api/products` | Valid serial number, `warrantyEnd >= warrantyStart` | `201 Created` | Product persisted with identity PK. |
| `TC-PROD-002` | `POST /api/products` | Invalid dates (`warrantyEnd < warrantyStart`) | `400 Bad Request` | Fails `chk_warranty_end_ge_start` validation constraint. |
| `TC-PROD-003` | `POST /api/products` | Existing `serial_number` | `409 Conflict` | Unique constraint violation handled cleanly. |

---

## 3. Claims Lifecycle (Owner: Tanishka)

| Test ID | Endpoint / Action | Input Payload / Precondition | Expected Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-CLM-001` | `POST /api/claims` | Valid `productId`, `userId`, `claimNumber`, description | `201 Created` | Default status initialized to `SUBMITTED`. |
| `TC-CLM-002` | `POST /api/claims` | Non-existent `productId` (foreign key failure) | `404 Not Found` | Friendly error: `Product not found`. |
| `TC-CLM-003` | `POST /api/claims` | Duplicate `claimNumber` | `409 Conflict` | Unique constraint violation detected. |
| `TC-CLM-004` | `GET /api/claims/{id}` | Valid `claimId` | `200 OK` | Returns claim details with associated product, claimant, and status. |

---

## 4. Evidence Documents & File Deduplication (Owner: Kalp)

| Test ID | Endpoint / Action | Input Payload / Precondition | Expected Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-EVD-001` | `POST /api/evidence-documents` | Valid PDF invoice, claim exists | `201 Created` | Calculates SHA-256 hash, stores file path, returns DTO. |
| `TC-EVD-002` | `POST /api/evidence-documents` | Duplicate file hash submitted across two different claims | `201 Created` | File accepted, but triggers cross-claim duplicate receipt finding. |
| `TC-EVD-003` | `POST /api/evidence-documents` | Unsupported file extension / MIME type | `400 Bad Request` | Storage validation rejects unallowed binary format. |

---

## 5. Fraud Findings & Risk Engine (Owner: Chinmay)

| Test ID | Endpoint / Action | Input Payload / Precondition | Expected Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-FND-001` | `POST /api/claims/{id}/analyze` | Claim date outside warranty window | `200 OK` | Automated finding `RULE_WARRANTY_EXPIRED` generated (Severity: HIGH). |
| `TC-FND-002` | `POST /api/claims/{id}/analyze` | Evidence document flagged with altered metadata | `200 OK` | Automated finding `RULE_IMAGE_TAMPER_DETECTED` created (Severity: CRITICAL). |
| `TC-FND-003` | `GET /api/claims/{id}/findings` | Claim with 2 findings | `200 OK` | Returns array of findings matching rule codes and severities. |

---

## 6. Investigation Action Timeline (Owner: Anuj)

| Test ID | Endpoint / Action | Input Payload / Precondition | Expected Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-INV-001` | `POST /api/findings/{id}/actions` | Valid action type, investigator notes, state transition | `201 Created` | Append-only record inserted with timestamp; finding status updated. |
| `TC-INV-002` | `PUT/DELETE /api/investigations/{id}` | Attempt to modify or delete historical audit log entry | `405 Method Not Allowed` | Investigation log is strictly append-only; tampering blocked. |
| `TC-INV-003` | `GET /api/findings/{id}/actions` | Finding with multiple timeline actions | `200 OK` | Returns chronologically ordered audit events. |
