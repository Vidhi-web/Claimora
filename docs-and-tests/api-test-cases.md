# Claimora API Test Cases

This document defines the automated and manual test cases covering functional, security, and edge-case requirements for the Claimora platform.

---

## 1. Authentication & User Management (Owner: Vidhi)

### 1.1 Test Case Matrix

| Test ID | Endpoint / Action | Input Payload / Precondition | Expected Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-AUTH-001` | `POST /api/auth/login` | Valid credentials (`admin@claimora.internal` / `AdminPass123!`) | `200 OK` | Returns JWT token, user object with role `ADMIN`. |
| `TC-AUTH-002` | `POST /api/auth/login` | Invalid password or unregistered email | `401 Unauthorized` | Generic JSON error: `{"status": 401, "message": "Invalid email or password"}`. |
| `TC-AUTH-003` | `POST /api/auth/login` | Valid credentials for INACTIVE account | `403 Forbidden` | Rejection with message: `"Account is inactive. Please contact your system administrator."`. |
| `TC-AUTH-004` | `POST /api/auth/register` | Valid registration payload (`name`, `email`, `password`) | `201 Created` | Automatically assigns `role: "STAFF"`, `status: "ACTIVE"`, returns JWT token and user summary. |
| `TC-AUTH-005` | `POST /api/auth/register` | Duplicate email address | `400 Bad Request` | Fails unique constraint: `{"status": 400, "message": "Email already in use"}`. |
| `TC-AUTH-006` | `POST /api/auth/register` | Weak password (< 8 chars, no letters or numbers) | `400 Bad Request` | Bean validation errors on password criteria. |
| `TC-AUTH-007` | `GET /api/auth/me` | Valid Bearer token in `Authorization` header | `200 OK` | Returns current user profile (ID, name, email, role, status). |
| `TC-AUTH-008` | `GET /api/auth/me` | Missing or invalid Bearer token | `401 Unauthorized` | Rejection with standard 401 JSON error. |
| `TC-USR-001` | `GET /api/users` | Valid Admin Bearer token (`page=0&size=10&search=`) | `200 OK` | Paginated JSON of users without exposing `password_hash`. |
| `TC-USR-002` | `GET /api/users` | Investigator or Staff Bearer token | `403 Forbidden` | Access denied JSON: `{"status": 403, "message": "You do not have permission to access this resource"}`. |
| `TC-USR-003` | `POST /api/users` | Admin token + payload with custom role (`INVESTIGATOR`) | `201 Created` | User created with specified role and status; returns `UserResponse`. |
| `TC-USR-004` | `GET /api/users/{id}` | Admin token + non-existent user ID | `404 Not Found` | Friendly error: `{"status": 404, "message": "User not found with id: ..."}`. |
| `TC-USR-005` | `PUT /api/users/{id}` | Admin token + updated name/email | `200 OK` | User record updated and returned. |
| `TC-USR-006` | `PATCH /api/users/{id}/status` | Admin token + `{"status": "INACTIVE"}` | `200 OK` | Account deactivated immediately; subsequent login blocked. |
| `TC-USR-007` | `PATCH /api/users/{id}/role` | Admin token + `{"role": "INVESTIGATOR"}` | `200 OK` | Role updated; subsequent tokens reflect new role. |
| `TC-USR-008` | `PUT /api/users/me/password` | Valid Bearer token + correct `currentPassword` & valid `newPassword` | `200 OK` | Password hash updated via BCrypt; returns success message. |
| `TC-USR-009` | `PUT /api/users/me/password` | Incorrect `currentPassword` | `400 Bad Request` | Rejection: `{"status": 400, "message": "Current password does not match"}`. |

---

### 1.2 Postman & cURL Test Examples

#### Example 1: User Login (`TC-AUTH-001`)
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "admin@claimora.internal",
    "password": "AdminPassword123!"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBjbGFpbW9yYS5pbnRlcm5hbCIsInVzZXJJZCI6MSwicm9sZSI6IkFETUlOIiwic3RhdHVzIjoiQUNUSVZFIiwiaWF0IjoxNzI5Njk5MjAwLCJleHAiOjE3Mjk3ODU2MDB9...",
    "user": {
      "userId": 1,
      "name": "System Administrator",
      "email": "admin@claimora.internal",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  }
  ```

#### Example 2: Self-Service Registration (`TC-AUTH-004`)
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "Sarah Connor",
    "email": "sarah.connor@claimora.internal",
    "password": "StrongPassword2026!"
  }
  ```
- **Expected Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 2,
      "name": "Sarah Connor",
      "email": "sarah.connor@claimora.internal",
      "role": "STAFF",
      "status": "ACTIVE"
    }
  }
  ```

#### Example 3: Admin List Users (`TC-USR-001`)
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/users?search=&page=0&size=10`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Expected Response (200 OK)**:
  ```json
  {
    "content": [
      {
        "userId": 1,
        "name": "System Administrator",
        "email": "admin@claimora.internal",
        "role": "ADMIN",
        "status": "ACTIVE"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
  ```

#### Example 4: Admin Create User with Custom Role (`TC-USR-003`)
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/users`
- **Headers**:
  - `Authorization: Bearer {{admin_token}}`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "Marcus Wright",
    "email": "marcus.wright@claimora.internal",
    "password": "InvestigatorPass123!",
    "role": "INVESTIGATOR",
    "status": "ACTIVE"
  }
  ```
- **Expected Response (201 Created)**:
  ```json
  {
    "userId": 3,
    "name": "Marcus Wright",
    "email": "marcus.wright@claimora.internal",
    "role": "INVESTIGATOR",
    "status": "ACTIVE"
  }
  ```

#### Example 5: Admin Toggle Status (`TC-USR-006`)
- **Method**: `PATCH`
- **URL**: `http://localhost:8080/api/users/3/status`
- **Headers**:
  - `Authorization: Bearer {{admin_token}}`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "status": "INACTIVE"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "userId": 3,
    "name": "Marcus Wright",
    "email": "marcus.wright@claimora.internal",
    "role": "INVESTIGATOR",
    "status": "INACTIVE"
  }
  ```

#### Example 6: Self Password Change (`TC-USR-008`)
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/users/me/password`
- **Headers**:
  - `Authorization: Bearer {{user_token}}`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "BrandNewPassword2026!"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

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
| `TC-FND-001` | `POST /api/claims/{id}/analyze` | Cross-claim duplicate invoice number or file hash | `200 OK` | `DUPLICATE_INVOICE` generated (HIGH severity), documents linked with `CONFLICTING_VALUE` & `DUPLICATE_OF`. |
| `TC-FND-002` | `POST /api/claims/{id}/analyze` | Repeat claim on same product serial number | `200 OK` | `SERIAL_REUSE` generated (HIGH severity), links current doc as `CONFLICTING_VALUE` and prior doc as `SUPPORTING_EVIDENCE`. |
| `TC-FND-003` | `POST /api/claims/{id}/analyze` | Claim date outside warranty window (`claimDate > warrantyEnd`) | `200 OK` | `DATE_CONFLICT` generated (HIGH severity), claim status flagged to `FLAGGED`. |
| `TC-FND-004` | `POST /api/claims/{id}/analyze` | Invoice OCR serial number or model contradicts registered product | `200 OK` | `INVOICE_MISMATCH` generated (MEDIUM severity), invoice linked as `CONFLICTING_VALUE`. |
| `TC-FND-005` | `POST /api/claims/{id}/analyze` | Identical photo SHA-256 hash across two claims | `200 OK` | `DUPLICATE_PHOTO` generated (HIGH severity), photos linked across claims. |
| `TC-FND-006` | `POST /api/claims/{id}/analyze` | Technician repair report part contradicts parts invoice billed part | `200 OK` | `REPAIR_PARTS_MISMATCH` generated (MEDIUM severity), both documents linked. |
| `TC-FND-007` | `POST /api/claims/{id}/analyze` | Re-run analysis on claim with existing `RESOLVED` finding | `200 OK` | Idempotent execution: does NOT overwrite or revert status from `RESOLVED`, `findingsCreated = 0`. |
| `TC-FND-008` | `POST /api/claims/{id}/analyze` | STAFF user calls analyze on another user's claim | `403 Forbidden` | Access denied: `"You do not have permission to analyze claims belonging to other claimants"`. |

---

## 6. Investigation Action Timeline (Owner: Anuj)

| Test ID | Endpoint / Action | Input Payload / Precondition | Expected Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `TC-INV-001` | `POST /api/findings/{id}/actions` | Valid action type, investigator notes, state transition | `201 Created` | Append-only record inserted with timestamp; finding status updated. |
| `TC-INV-002` | `PUT/DELETE /api/investigations/{id}` | Attempt to modify or delete historical audit log entry | `405 Method Not Allowed` | Investigation log is strictly append-only; tampering blocked. |
| `TC-INV-003` | `GET /api/findings/{id}/actions` | Finding with multiple timeline actions | `200 OK` | Returns chronologically ordered audit events. |
