# Contributing to Claimora

Thank you for contributing to the Claimora Warranty Claims & Fraud-Risk Analysis Platform. To ensure code quality, architectural consistency, and seamless integration, all contributors must adhere to the standards outlined below.

---

## 1. Team Ownership & Responsibilities

Each core domain entity, database table, backend service, and frontend feature folder is assigned an owner:

| Contributor | Domain Area | Responsibilities |
| :--- | :--- | :--- |
| **Vidhi** | **User + Authentication** | `users` table, Spring Security JWT/auth, user management, login UI, guards & interceptors |
| **Shaili** | **Product** | `product` table, serial number validation, warranty window checks, product catalog UI |
| **Tanishka** | **Claim** | `claim` table, claim submission workflow, claim status lifecycle, claim management UI |
| **Kalp** | **EvidenceDocument** | `evidence_document` table, file storage service, SHA-256 deduplication, evidence viewer UI |
| **Chinmay** | **Finding + Analysis** | `finding` table, fraud risk rule evaluation engine, automated anomaly detection, findings review UI |
| **Anuj** | **InvestigationAction** | `investigation_action` table, append-only audit trail, investigator timeline, action log UI |
| *Integration* | **EvidenceLink & Shared** | Shared integration work (connecting findings to evidence, shared dashboard, shared DTOs) |

> **Note**: `evidence_link` and shared configuration are cross-cutting integration responsibilities and not a separate entity owner.

---

## 2. Integration Order

To minimize cross-blocking and merge conflicts, features must be delivered following the phased integration sequence:

1. **Phase 1: User & Product Foundations** (Vidhi & Shaili)
   - Establish baseline user accounts, role definitions, and covered product serial numbers.
2. **Phase 2: Claims Intake** (Tanishka)
   - Build claims submission workflow linking products to claimants.
3. **Phase 3: Evidence & Findings** (Kalp & Chinmay)
   - Implement document uploads, SHA-256 hashing, and automated fraud rule detection.
4. **Phase 4: Investigation Action Audit Trail** (Anuj)
   - Construct the immutable append-only timeline allowing investigators to log actions and transition claim statuses.
5. **Phase 5: End-to-End System Testing & Hardening**
   - Execute full regression across frontend and backend flows.

---

## 3. Branching Strategy

- **Direct commits to `main` are strictly forbidden.**
- Always branch off the latest `main` using descriptive branch names:
  - `feature/user` (Vidhi)
  - `feature/product` (Shaili)
  - `feature/claim` (Tanishka)
  - `feature/evidence` (Kalp)
  - `feature/finding` (Chinmay)
  - `feature/investigation` (Anuj)
  - `bugfix/<description>` (for defect remediation)

---

## 4. Pull Request (PR) Review Workflow

Before merging any PR to `main`:
1. **Automated Verification**:
   - Backend build and tests must succeed: `./mvnw clean test`
   - Frontend build must pass: `npm run build`
2. **Peer Review**:
   - Every PR requires at least one approving review from a peer.
3. **Architectural Checks**:
   - No JPA entities exposed in controllers (use DTOs).
   - Endpoints must follow plural naming conventions under `/api/` (e.g. `/api/claims`).
   - Exception handling conforms to standardized `{timestamp, status, error, message, path}` JSON.
   - `schema.sql` matches any entity changes (Hibernate `ddl-auto=validate`).

---

## 5. Security & Credentials Policy

- **NEVER commit credentials, passwords, or secret keys to git.**
- Use environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) with safe development fallbacks.
- Keep sensitive local values in `.env` files (which are ignored by `.gitignore`).
- Any detected secret will require an immediate git commit history purge.

---

## 6. Commit Message Guidelines

Follow conventional commit formats:
- `feat: add claim submission intake form`
- `fix: correct warranty date comparison logic`
- `test: add unit tests for fraud rule evaluator`
- `docs: update api documentation for evidence uploads`
- `chore: initialize repository structure`
