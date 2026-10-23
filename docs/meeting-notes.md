# Claimora - Architecture & Team Meeting Notes

## Sprint 0: Kickoff & Repository Initialization
**Date**: October 23, 2026  
**Attendees**: Vidhi (Team Lead), Shaili, Tanishka, Kalp, Chinmay, Anuj  
**Agenda**: Repository initialization, technical baseline, entity ownership, database schema sign-off, and integration sequence.

---

### 1. Key Architectural Decisions
- **Frontend**: Angular standalone architecture, TypeScript, CSS styling, responsive layout with modular feature structuring.
- **Backend**: Java 17, Spring Boot 3.x, Spring Data JPA, PostgreSQL Driver, Spring Validation, Spring Security.
- **Database**: PostgreSQL 16+ as the single source of truth.
  - Hibernate `ddl-auto` is set to `validate`. Hibernate will **not** alter tables automatically.
  - Every schema modification must be tracked in `database/schema.sql`.
- **Security & Secrets**:
  - Zero credentials in git.
  - Spring Boot `application.properties` reads connection credentials via environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) with safe defaults for local development.
- **API Standards**:
  - All endpoints prefixed with `/api`.
  - Plural resource nouns (e.g., `/api/claims`).
  - DTOs for requests and responses; domain entities must never cross controller boundaries.
  - Global standardized exception handling returning `{timestamp, status, error, message, path}`.

---

### 2. Module & Entity Ownership Matrix
Each team member owns their entity, corresponding database table, backend service/controller/repository, and frontend feature modules:

| Team Member | Entity / Area | Responsibilities |
| :--- | :--- | :--- |
| **Vidhi** | **User + Authentication** | `users` table, Spring Security JWT/auth, user management, login UI, guards & interceptors |
| **Shaili** | **Product** | `product` table, serial number validation, warranty window checks, catalog UI |
| **Tanishka** | **Claim** | `claim` table, claim submission workflow, claim status lifecycle, claim management UI |
| **Kalp** | **EvidenceDocument** | `evidence_document` table, file storage service, file hash uniqueness checks, evidence viewer UI |
| **Chinmay** | **Finding + Analysis** | `finding` table, fraud risk rule evaluation engine, automated anomaly detection, findings review UI |
| **Anuj** | **InvestigationAction** | `investigation_action` table, append-only audit trail, investigator timeline, action log UI |
| *Integration* | **EvidenceLink & Shared** | Shared integration work (connecting findings to evidence, shared dashboard, shared DTOs) |

---

### 3. Phased Integration Sequence
To prevent merge conflicts and dependency blocking, development will proceed in the following order:
1. **Phase 1: User & Product Foundations**
   - Vidhi implements User authentication, login, and token generation.
   - Shaili implements Product registration and warranty period validation.
2. **Phase 2: Claim Intake**
   - Tanishka integrates with User and Product to implement Claim intake and lifecycle state transitions.
3. **Phase 3: Evidence & Fraud Findings**
   - Kalp integrates EvidenceDocument upload and SHA-256 digital fingerprinting.
   - Chinmay implements Finding creation and automated fraud rule detection.
4. **Phase 4: Investigation Audit Trail**
   - Anuj builds the append-only InvestigationAction timeline, allowing investigators to resolve findings and update claim statuses.
5. **Phase 5: End-to-End System Integration & Testing**
   - Full regression testing across Angular frontend and Spring Boot backend.
