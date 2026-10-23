# Claimora REST API Documentation

## 1. Architectural Standards & Conventions

All backend services follow standardized RESTful guidelines:
- **Base URI Path**: All endpoints reside under the `/api` prefix.
- **Resource Naming**: Plural nouns for collections (e.g. `/api/users`, `/api/products`, `/api/claims`, `/api/findings`).
- **DTO Encapsulation**: Domain entities (`@Entity`) are **never exposed** directly over the network. Every request and response uses dedicated Data Transfer Objects (DTOs).
- **HTTP Methods**:
  - `GET`: Retrieve resource or collection.
  - `POST`: Create resource or execute non-idempotent action.
  - `PUT`: Complete update of an existing resource.
  - `PATCH`: Partial modification of a resource.
  - `DELETE`: Remove a resource or mark as inactive.
- **Standard Error Payload**: Every error response from the server conforms to:
  ```json
  {
    "timestamp": "2026-10-23T15:30:00.000Z",
    "status": 404,
    "error": "Not Found",
    "message": "Claim with ID 99 not found",
    "path": "/api/claims/99"
  }
  ```

---

## 2. Authentication & Users (`/api/auth`, `/api/users`)
*Owner: Vidhi*

### `POST /api/auth/login`
Authenticates a user and returns a session/bearer token with role permissions.
- **Request Body**:
  ```json
  {
    "email": "vidhi.admin@claimora.internal",
    "password": "Password123!"
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 1,
      "name": "Vidhi Lead",
      "email": "vidhi.admin@claimora.internal",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  }
  ```

### `GET /api/users`
Lists system users with pagination and role filtering.
- **Query Params**: `page` (int), `size` (int), `role` (ADMIN|INVESTIGATOR|STAFF), `status` (ACTIVE|INACTIVE)
- **Response 200 OK**: Array of `UserResponseDto`.

### `POST /api/users`
Creates a new system user (Admin only).

---

## 3. Products (`/api/products`)
*Owner: Shaili*

### `GET /api/products`
Retrieves products in warranty catalog.
- **Query Params**: `serialNumber` (string), `model` (string)
- **Response 200 OK**: Array of `ProductResponseDto`.

### `POST /api/products`
Registers a new product with warranty terms.
- **Request Body**:
  ```json
  {
    "serialNumber": "SN-XPS15-9520-4821",
    "model": "Dell XPS 15 9520",
    "purchaseDate": "2025-01-15",
    "warrantyStart": "2025-01-15",
    "warrantyEnd": "2027-01-15"
  }
  ```
- **Response 201 Created**: `ProductResponseDto`.

---

## 4. Claims (`/api/claims`)
*Owner: Tanishka*

### `GET /api/claims`
Retrieves claims with optional filtering by status, product, or claimant.
- **Query Params**: `status` (SUBMITTED|UNDER_REVIEW|APPROVED|REJECTED|FLAGGED), `page`, `size`
- **Response 200 OK**: Array of `ClaimSummaryResponse`.

### `POST /api/claims`
Submits a new warranty claim.
- **Request Body**:
  ```json
  {
    "productId": 1,
    "claimNumber": "CLM-2026-000105",
    "issueDescription": "Display flickering intermittently under load.",
    "claimDate": "2026-10-23"
  }
  ```
- **Response 201 Created**: `ClaimDetailResponse`.

### `GET /api/claims/{claimId}`
Retrieves comprehensive details for a single claim including associated evidence documents and findings.

---

## 5. Evidence Documents (`/api/evidence-documents`)
*Owner: Kalp*

### `POST /api/evidence-documents/upload`
Uploads evidence document for a claim (multipart/form-data).
- **Form Data**: `claimId` (long), `documentType` (INVOICE|PHOTO_DAMAGE|RECEIPT|SERVICE_ESTIMATE), `file` (binary)
- **Response 201 Created**:
  ```json
  {
    "documentId": 12,
    "claimId": 1,
    "documentType": "PHOTO_DAMAGE",
    "filePath": "/storage/evidence/2026/10/damage_screen_12.jpg",
    "fileHash": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    "uploadDate": "2026-10-23T15:30:00Z"
  }
  ```

---

## 6. Findings & Fraud Risk Analysis (`/api/findings`, `/api/analysis`)
*Owner: Chinmay*

### `GET /api/claims/{claimId}/findings`
Retrieves all automated and forensic findings for a claim.

### `POST /api/claims/{claimId}/analyze`
Triggers fraud risk rule evaluation engine against claim and submitted evidence.
- **Response 200 OK**:
  ```json
  {
    "claimId": 1,
    "overallRiskScore": 87,
    "riskLevel": "HIGH",
    "findings": [
      {
        "findingId": 4,
        "ruleCode": "RULE_IMAGE_TAMPER_DETECTED",
        "severity": "CRITICAL",
        "status": "OPEN",
        "description": "Pixel alteration detected in receipt purchase date."
      }
    ]
  }
  ```

---

## 7. Investigation Actions (`/api/investigations`)
*Owner: Anuj*

### `GET /api/findings/{findingId}/actions`
Returns the append-only chronological audit log of actions taken on a finding.

### `POST /api/findings/{findingId}/actions`
Appends a new investigation action and transitions finding/claim status.
- **Request Body**:
  ```json
  {
    "actionType": "FLAG_FOR_FORENSICS",
    "explanation": "Image submitted has EXIF tags showing Photoshop editing.",
    "newStatus": "INVESTIGATING"
  }
  ```
- **Response 201 Created**: `InvestigationActionResponse`.
