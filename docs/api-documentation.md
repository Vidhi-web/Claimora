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
