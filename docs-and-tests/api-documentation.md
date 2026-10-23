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

### 2.1 Role-Based Access Control (RBAC) Architecture
Claimora enforces method-level security via Spring Security `@EnableMethodSecurity`.
All incoming requests bearing a `Bearer <token>` header are intercepted by `JwtAuthenticationFilter`, which parses claims and populates the `SecurityContextHolder` with `ROLE_<ROLE>` authorities (`ROLE_ADMIN`, `ROLE_INVESTIGATOR`, `ROLE_STAFF`).

#### Guidelines for Team Members Protecting Their Endpoints:
To secure your controllers/endpoints, annotate the class or method with Spring Security's `@PreAuthorize`:
- **Restricted to Administrators only**:
  ```java
  @PreAuthorize("hasRole('ADMIN')")
  ```
- **Accessible to Investigators and Administrators**:
  ```java
  @PreAuthorize("hasAnyRole('ADMIN', 'INVESTIGATOR')")
  ```
- **Accessible to any authenticated user**:
  ```java
  @PreAuthorize("isAuthenticated()")
  ```
- **Accessing the authenticated user's details**:
  ```java
  @GetMapping("/my-claims")
  public ResponseEntity<List<ClaimResponse>> getMyClaims(@AuthenticationPrincipal CustomUserDetails userDetails) {
      Long currentUserId = userDetails.getUserId();
      // ...
  }
  ```
- **Unauthorized / Forbidden Error Responses**:
  - Unauthenticated requests (missing/expired/invalid token) receive `401 Unauthorized`:
    ```json
    {
      "timestamp": "2026-10-23T15:30:00.000Z",
      "status": 401,
      "error": "Unauthorized",
      "message": "Full authentication is required to access this resource",
      "path": "/api/claims"
    }
    ```
  - Authenticated users lacking required role receive `403 Forbidden`:
    ```json
    {
      "timestamp": "2026-10-23T15:30:00.000Z",
      "status": 403,
      "error": "Forbidden",
      "message": "You do not have permission to access this resource",
      "path": "/api/users"
    }
    ```

---

### 2.2 Endpoints Specification

#### `POST /api/auth/login`
Authenticates a user and returns a signed JWT token with user summary details.
- **Access**: Public
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
      "name": "System Administrator",
      "email": "vidhi.admin@claimora.internal",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Invalid credentials (`{"status": 401, "message": "Invalid email or password"}`).
  - `403 Forbidden`: Inactive account (`{"status": 403, "message": "Account is inactive. Please contact your system administrator."}`).

---

#### `POST /api/auth/register`
Self-service user registration. Automatically assigns role `STAFF` and status `ACTIVE`.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Investigator",
    "email": "jane.investigator@claimora.internal",
    "password": "SecurePassword123!"
  }
  ```
- **Validation**:
  - `name`: Not blank.
  - `email`: Valid format.
  - `password`: Minimum 8 characters, containing at least one letter and one number.
- **Response 201 Created**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 2,
      "name": "Jane Investigator",
      "email": "jane.investigator@claimora.internal",
      "role": "STAFF",
      "status": "ACTIVE"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure or duplicate email (`Email already in use`).

---

#### `GET /api/auth/me`
Retrieves current authenticated user's profile summary.
- **Access**: Authenticated (`@PreAuthorize("isAuthenticated()")`)
- **Headers**: `Authorization: Bearer <token>`
- **Response 200 OK**:
  ```json
  {
    "userId": 1,
    "name": "System Administrator",
    "email": "vidhi.admin@claimora.internal",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
  ```

---

#### `GET /api/users`
Lists users with case-insensitive search and pagination.
- **Access**: Admin only (`@PreAuthorize("hasRole('ADMIN')")`)
- **Query Parameters**:
  - `search` *(optional)*: Matches against user name or email (e.g. `?search=vidhi`).
  - `page` *(optional, default 0)*: Zero-indexed page number.
  - `size` *(optional, default 10)*: Page size (max 50).
- **Response 200 OK**:
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

---

#### `GET /api/users/{id}`
Retrieves details for a specific user.
- **Access**: Admin only (`@PreAuthorize("hasRole('ADMIN')")`)
- **Response 200 OK**: `UserResponse`
- **Error Responses**:
  - `404 Not Found`: User does not exist (`User not found with id: 99`).

---

#### `POST /api/users`
Creates a new user with custom role and status (Admin provisioning).
- **Access**: Admin only (`@PreAuthorize("hasRole('ADMIN')")`)
- **Request Body**:
  ```json
  {
    "name": "Alex Investigator",
    "email": "alex.investigator@claimora.internal",
    "password": "InvestigatorPass123!",
    "role": "INVESTIGATOR",
    "status": "ACTIVE"
  }
  ```
- **Response 201 Created**: `UserResponse`

---

#### `PUT /api/users/{id}`
Updates a user's name and email address.
- **Access**: Admin only (`@PreAuthorize("hasRole('ADMIN')")`)
- **Request Body**:
  ```json
  {
    "name": "Alex Vance",
    "email": "alex.vance@claimora.internal"
  }
  ```
- **Response 200 OK**: `UserResponse`

---

#### `PATCH /api/users/{id}/status`
Activates or deactivates a user account.
- **Access**: Admin only (`@PreAuthorize("hasRole('ADMIN')")`)
- **Request Body**:
  ```json
  {
    "status": "INACTIVE"
  }
  ```
- **Response 200 OK**: `UserResponse`

---

#### `PATCH /api/users/{id}/role`
Updates a user's role assignment.
- **Access**: Admin only (`@PreAuthorize("hasRole('ADMIN')")`)
- **Request Body**:
  ```json
  {
    "role": "INVESTIGATOR"
  }
  ```
- **Response 200 OK**: `UserResponse`

---

#### `PUT /api/users/me/password`
Allows the currently authenticated user to change their password after verifying their current password.
- **Access**: Authenticated (`@PreAuthorize("isAuthenticated()")`)
- **Request Body**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewSecurePassword456!"
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Current password incorrect or new password validation failed.

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

## 5. Evidence Documents (`/api/documents`, `/api/claims/{id}/documents`)
*Owner: Kalp*

### `GET /api/documents`
Retrieves evidence documents across claims.
- **Access**: Authenticated (`ADMIN` and `INVESTIGATOR` can view all documents; `STAFF` view documents associated with their claims).
- **Query Params**: `claimId` *(optional)*: Filter by claim.
- **Response 200 OK**: `List<EvidenceDocumentResponse>`

### `GET /api/documents/{id}`
Retrieves document metadata, SHA-256 fingerprint, and OCR extracted fields.
- **Access**: Authenticated
- **Response 200 OK**: `EvidenceDocumentResponse`

### `GET /api/documents/{id}/file`
Downloads the original evidence file binary from protected storage.
- **Access**: Authenticated
- **Response 200 OK**: Binary file stream with `Content-Disposition: inline; filename="..."`

### `POST /api/claims/{id}/documents`
Uploads a supporting evidence document for a claim (multipart/form-data).
- **Access**: `@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")`
- **Form Data**: `file` (Multipart file), `documentType` (`INVOICE`, `PHOTO`, `REPAIR_REPORT`, `PARTS_INVOICE`)
- **Processing**: Automatically computes SHA-256 digital digest, writes to protected storage, and triggers OCR field extraction.
- **Response 201 Created**: `EvidenceDocumentResponse`

### `PUT /api/documents/{id}/extracted-data`
Manually updates OCR extracted data fields and automatically appends a `CORRECT_VALUE` action in the investigation audit trail.
- **Access**: `@PreAuthorize("hasAnyRole('ADMIN', 'INVESTIGATOR', 'STAFF')")`
- **Request Body**:
  ```json
  {
    "extractedData": "{\"invoiceNumber\": \"INV-2025-00101\", \"serialNumber\": \"SN-XPS15-9520-4821\", \"totalAmount\": 1899.99}",
    "reason": "Corrected misrecognized character in invoice serial number."
  }
  ```
- **Response 200 OK**: `EvidenceDocumentResponse` (with `ocrStatus: "MANUAL"`)

---

## 6. Findings & Fraud Risk Analysis (`/api/findings`, `/api/claims/{id}/analyze`)
*Owner: Chinmay*

### 6.1 Automated Fraud Analysis Rules
Claimora implements a modular rule engine behind the `AnalysisRule` interface:
1. **`DUPLICATE_INVOICE`** (HIGH, Weight: 50): Detects identical invoice numbers or duplicate digital hashes across different claims. Links documents with `CONFLICTING_VALUE` and `DUPLICATE_OF`.
2. **`SERIAL_REUSE`** (HIGH, Weight: 45): Detects repeat or overlapping warranty claims on the same product serial number within a short timeframe. Links prior claim documents as `SUPPORTING_EVIDENCE`.
3. **`DATE_CONFLICT`** (HIGH, Weight: 50): Identifies claims filed outside warranty coverage windows or where invoice/repair dates contradict claim submission dates.
4. **`INVOICE_MISMATCH`** (MEDIUM, Weight: 30): Flags discrepancies between invoice OCR extracted serial number/model and registered product catalog records.
5. **`DUPLICATE_PHOTO`** (HIGH, Weight: 40): Flags identical SHA-256 damage photograph hashes submitted across different claims.
6. **`REPAIR_PARTS_MISMATCH`** (MEDIUM, Weight: 25): Flags conflicting component descriptions between technician repair reports and parts invoices.

### 6.2 Trigger Claim Analysis
#### `POST /api/claims/{claimId}/analyze`
Executes fraud risk rule evaluation against the claim and its evidence documents.
- **Access**: Authenticated (`@PreAuthorize("isAuthenticated()")`)
- **Idempotence**: Preserves existing `RESOLVED` and `DISMISSED` findings; does not generate duplicate open findings.
- **Auto-Flagging**: If open findings exist, claim status is updated to `FLAGGED` (claims are never automatically rejected).
- **Response 200 OK**:
  ```json
  {
    "claimId": 2,
    "claimNumber": "CLM-2026-002",
    "claimStatus": "FLAGGED",
    "score": 50,
    "riskLevel": "HIGH",
    "findingsCreated": 1,
    "activeFindingsCount": 1,
    "triggeredRuleCodes": [
      "DUPLICATE_INVOICE"
    ],
    "findings": [
      {
        "findingId": 1,
        "claimId": 2,
        "claimNumber": "CLM-2026-002",
        "claimStatus": "FLAGGED",
        "productModel": "Dell XPS 15 9530",
        "productSerialNumber": "SN-DELL-XPS15-001",
        "assignedTo": null,
        "ruleCode": "DUPLICATE_INVOICE",
        "severity": "HIGH",
        "status": "OPEN",
        "description": "Invoice number INV-DUP-99201 and file hash a1b2c3d4... submitted in Claim CLM-2026-002 also appears in Claim CLM-2026-003.",
        "createdAt": "2026-10-24T00:50:00Z",
        "linkedDocuments": [
          {
            "findingId": 1,
            "documentId": 2,
            "documentType": "INVOICE",
            "originalFilename": "invoice_dell_99201.pdf",
            "fileHash": "a1b2c3d4...",
            "evidenceRole": "CONFLICTING_VALUE"
          },
          {
            "findingId": 1,
            "documentId": 3,
            "documentType": "INVOICE",
            "originalFilename": "invoice_macbook_reused.pdf",
            "fileHash": "a1b2c3d4...",
            "evidenceRole": "DUPLICATE_OF"
          }
        ],
        "actionsCount": 0
      }
    ]
  }
  ```

### 6.3 Query Findings
#### `GET /api/findings`
Retrieves paginated findings with optional filters (`status`, `severity`, `assignedTo`, `claimId`).
- **Access**: Authenticated. INVESTIGATORs are automatically scoped to findings assigned to them.
- **Response 200 OK**: `Page<FindingResponse>`

#### `GET /api/findings/{id}`
Retrieves a specific finding by ID including all linked evidence documents and actions count.

#### `PUT /api/findings/{id}/assign`
Assigns a finding to an investigator.
- **Access**: `@PreAuthorize("hasRole('ADMIN')")`
- **Request Body**: `{"assignedToUserId": 2}`
- **Response 200 OK**: `FindingResponse`

---

## 7. Investigation Actions (`/api/findings/{id}/actions`, `/api/investigations`)
*Owner: Anuj*

### 7.1 State Machine & Append-Only Invariants
1. **Allowed Transitions**:
   - `OPEN` -> `UNDER_INVESTIGATION` or `DISMISSED`
   - `UNDER_INVESTIGATION` -> `RESOLVED` or `DISMISSED`
   - `RESOLVED` -> `OPEN` (Reopen)
   - `DISMISSED` -> `OPEN` (Reopen)
2. **Mandatory Explanations**: A non-empty justification is strictly required for `RESOLVE`, `DISMISS`, and `REOPEN` actions.
3. **Strictly Append-Only**: HTTP `PUT`, `PATCH`, and `DELETE` requests to `/api/investigations/{id}` return `405 Method Not Allowed`.

### 7.2 Endpoints
#### `GET /api/investigations`
Returns recent global investigation actions across all findings (chronological audit feed).
- **Access**: Authenticated

#### `GET /api/findings/{findingId}/actions`
Returns the append-only chronological audit log of actions taken on a specific finding.
- **Access**: Authenticated

#### `POST /api/findings/{findingId}/actions`
Appends a new investigation action and transitions finding/claim status.
- **Access**: `@PreAuthorize("hasAnyRole('ADMIN', 'INVESTIGATOR')")`
- **Request Body**:
  ```json
  {
    "actionType": "STATUS_CHANGE",
    "explanation": "Starting formal review of duplicate invoice.",
    "newStatus": "UNDER_INVESTIGATION"
  }
  ```
- **Response 201 Created**: `InvestigationActionResponse`

#### `PUT|DELETE|PATCH /api/investigations/{id}`
- **Response 405 Method Not Allowed**: Rejects any attempt to tamper with historical audit actions.

---

## 8. Dashboard & Summary Reports (`/api/dashboard`, `/api/reports`)

### `GET /api/dashboard/stats`
Retrieves aggregated platform KPI metrics:
- **Claim Metrics**: Total claims, submitted, under review, flagged, resolved, and fraud rate percentage.
- **Finding Metrics**: Total findings, open, under investigation, resolved, dismissed, and severity counts (HIGH, MEDIUM, LOW).
- **Rule Trigger Frequency**: Top triggered fraud rules with counts.
- **Recent Activities**: Chronological timeline of the latest 10 investigation actions.
- **System Metrics**: Total registered products, stored documents, and manual OCR corrections.
- **Access**: Authenticated (`ADMIN` and `INVESTIGATOR` receive platform-wide metrics; `STAFF` receive metrics scoped to their own claims).
- **Response 200 OK**: `DashboardStatsResponse`

### `GET /api/reports/summary`
Generates an executive forensic summary report including high-risk claims overview, rule breakdown, and audit activity.
- **Access**: `@PreAuthorize("hasAnyRole('ADMIN', 'INVESTIGATOR')")`
- **Response 200 OK**: `ReportSummaryResponse`
