# Claimora API Testing & Verification

This directory contains comprehensive specifications, test matrices, and automated verification suites for the Claimora platform.

## Files & Artifacts

- **[Claimora_API_Collection.postman_collection.json](./Claimora_API_Collection.postman_collection.json)**: Full Postman Collection v2.1 covering all endpoints (Authentication, RBAC, Claims, Products, Evidence, OCR Corrections, Fraud Analysis, Visual Evidence Graph, Investigation State Transitions, HTTP 405 Immutability Tests, Dashboard KPIs, and Executive Reports).
- **[api-documentation.md](./api-documentation.md)**: Architectural standards, REST API specifications, role requirements, request/response DTO schemas, and error definitions.
- **[api-test-cases.md](./api-test-cases.md)**: Exhaustive manual and automated test matrices for all roles and scenarios.

## Running with Postman or Newman

### Option 1: Import into Postman App
1. Open Postman.
2. Click **Import** in the upper left corner.
3. Select `docs-and-tests/Claimora_API_Collection.postman_collection.json`.
4. Run the **1. Authentication > Login as Admin** request; the script automatically extracts the JWT token and saves it to collection variables.
5. Execute requests across the collection.

### Option 2: Run via CLI (Newman)
```bash
npx newman run docs-and-tests/Claimora_API_Collection.postman_collection.json --env-var "baseUrl=http://localhost:8080/api"
```
