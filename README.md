# Claimora 🛡️
> Enterprise Warranty Claims Investigation & Fraud-Risk Analysis Platform

Claimora is an enterprise-grade platform designed to streamline warranty claims intake, accelerate fraud detection through automated risk scoring, and enforce a tamper-proof investigation audit trail. By combining OCR document verification, digital file hash deduplication, automated anomaly detection, and append-only investigator actions, Claimora helps organizations identify fraudulent claims, reduce investigation cycle times, and safeguard warranty reserves.

---

## 🛠️ Technology Stack

| Layer | Technologies | Key Highlights |
| :--- | :--- | :--- |
| **Frontend** | Angular (Latest), TypeScript, Modern Vanilla CSS | Standalone components, lazy loading, reactive signals, HTTP interceptors |
| **Backend** | Java 17, Spring Boot 3.x, Maven | Spring Data JPA, Spring Security, Spring Validation, HikariCP |
| **Database** | PostgreSQL 16+ | Strict relational constraints, JSONB extractions, SHA-256 non-unique index |
| **Testing** | JUnit 5, H2 In-Memory (Test Scope), Angular CLI | Automated CI-compatible unit tests, offline test suite |

---

## 👥 Module & Entity Ownership

Each functional module, database table, backend service, and frontend feature is assigned a dedicated team owner. `EvidenceLink` and shared configuration are cross-cutting integration work, not a separate entity.

| Team Member | Entity / Feature | Scope & Responsibilities |
| :--- | :--- | :--- |
| **Vidhi** | **User + Authentication** | `users` table, Spring Security, JWT sessions, route guards, login, and user management UI |
| **Shaili** | **Product** | `product` table, serial number validation, warranty window checks, product catalog UI |
| **Tanishka** | **Claim** | `claim` table, claim intake workflow, claims status lifecycle, claims management UI |
| **Kalp** | **EvidenceDocument** | `evidence_document` table, file storage service, SHA-256 file hash deduplication, evidence viewer UI |
| **Chinmay** | **Finding + Analysis** | `finding` table, automated fraud risk engine, image tampering detection, findings review UI |
| **Anuj** | **InvestigationAction** | `investigation_action` table, append-only investigator action log, timeline viewer UI |
| *Integration* | **EvidenceLink & Shared** | Join entity (`evidence_link`), shared dashboard, shared DTOs, CORS, error handling |

---

## 🚀 Phased Integration Sequence

To avoid merge conflicts and manage dependencies effectively, the team will integrate modules in this strict sequence:

```
[Phase 1: User & Product] ──► [Phase 2: Claim] ──► [Phase 3: Evidence & Finding] ──► [Phase 4: InvestigationAction] ──► [Phase 5: End-to-End Testing]
```

1. **Phase 1: User & Product Foundations**
   - **Vidhi**: Authentication baseline, user accounts, and token validation.
   - **Shaili**: Product catalog and warranty coverage date checks.
2. **Phase 2: Claim Intake**
   - **Tanishka**: Connects User and Product to implement warranty claim submission and status workflow.
3. **Phase 3: Evidence Documents & Fraud Risk Findings**
   - **Kalp**: Evidence uploads and SHA-256 digital fingerprinting.
   - **Chinmay**: Automated fraud rule evaluation and anomaly detection findings.
4. **Phase 4: Investigation Action Audit Trail**
   - **Anuj**: Append-only investigator action log, allowing status transitions and rationale tracking.
5. **Phase 5: End-to-End System Testing**
   - Full regression across frontend and backend flows.

---

## 📁 Repository Folder Map

```text
claimora/
├── README.md                      # Project documentation and quickstart
├── CONTRIBUTING.md                # Team collaboration rules, branch naming & PR guidelines
├── .gitignore                     # Java, Node, Angular, IDEs & secret exclusion rules
│
├── frontend/                      # Angular + TypeScript Frontend Application
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.css             # Global dark mode reset and styling
│       └── app/
│           ├── app.ts             # Shell layout component
│           ├── app.html           # Sticky top navbar and router outlet
│           ├── app.css
│           ├── app.config.ts      # Application config with HTTP interceptors
│           ├── app.routes.ts      # Lazy-loaded feature routes
│           ├── core/              # Singleton core infrastructure (Owner: Vidhi)
│           │   ├── auth/          # AuthService, token management
│           │   ├── guards/        # authGuard, roleGuard
│           │   └── interceptors/  # apiInterceptor, errorInterceptor
│           ├── shared/            # Reusable UI components and widgets
│           ├── models/            # TypeScript interfaces matching API DTOs
│           │   ├── user.model.ts
│           │   ├── product.model.ts
│           │   ├── claim.model.ts
│           │   ├── evidence.model.ts
│           │   ├── finding.model.ts
│           │   ├── investigation.model.ts
│           │   └── api-response.model.ts
│           ├── services/          # Angular API service wrappers
│           │   ├── api.service.ts
│           │   └── claim.service.ts
│           └── features/          # Modular feature domains (with ownership READMEs)
│               ├── auth/          # Owner: Vidhi
│               ├── dashboard/     # Shared / Integration
│               ├── users/         # Owner: Vidhi
│               ├── products/      # Owner: Shaili
│               ├── claims/        # Owner: Tanishka
│               ├── evidence/      # Owner: Kalp
│               ├── findings/      # Owner: Chinmay
│               ├── investigations/# Owner: Anuj
│               └── reports/       # Shared / Integration
│
├── backend/                       # Java 17 + Spring Boot Backend Application
│   ├── pom.xml                    # Maven build with JPA, Web, Security, Validation, PostgreSQL
│   ├── mvnw, mvnw.cmd             # Maven Wrapper
│   └── src/
│       ├── main/
│       │   ├── java/com/claimora/
│       │   │   ├── BackendApplication.java
│       │   │   ├── config/        # CorsConfig (CORS enabled for http://localhost:4200)
│       │   │   ├── security/      # SecurityConfig, PasswordEncoder (Owner: Vidhi)
│       │   │   ├── entity/        # JPA Entities (users, product, claim, evidence_document, finding, ...)
│       │   │   ├── repository/    # Spring Data JPA repositories
│       │   │   ├── dto/           # Request & Response DTOs, ErrorResponse
│       │   │   ├── controller/    # REST Controllers (/api/claims, /api/health)
│       │   │   ├── service/       # Business services (ClaimService)
│       │   │   ├── exception/     # GlobalExceptionHandler returning standardized JSON
│       │   │   ├── analysis/      # Fraud risk rule evaluator (Owner: Chinmay)
│       │   │   ├── audit/         # Append-only audit logger (Owner: Anuj)
│       │   │   └── storage/       # File storage & SHA-256 hashing (Owner: Kalp)
│       │   └── resources/
│       │       └── application.properties # PostgreSQL via env vars with safe defaults
│       └── test/
│           ├── java/com/claimora/
│           │   └── BackendApplicationTests.java
│           └── resources/
│               └── application.properties # H2 test-scope configuration
│
├── database/                      # PostgreSQL Source of Truth
│   ├── schema.sql                 # 7 tables with PKs, FKs, constraints, and indexes
│   ├── seed.sql                   # Fictional realistic warranty and fraud records
│   └── README.md                  # Database execution instructions
│
├── docs/                          # Project Documentation
│   ├── project-proposal.pdf       # Project proposal document (placeholder)
│   ├── ER-diagram.png             # Entity relationship diagram (placeholder)
│   ├── api-documentation.md       # Comprehensive REST API specifications
│   └── meeting-notes.md           # Architecture decisions & team agreements
│
└── tests/                         # Testing Artifacts & Sample Data
    ├── api-test-cases.md          # Functional & edge case test matrix
    └── sample-claims/             # Realistic JSON fixtures for testing
        ├── sample-claim-tampered-receipt.json
        ├── sample-claim-expired-warranty.json
        ├── sample-claim-legitimate.json
        └── .gitkeep
```

---

## ⚙️ Running Locally

### 1. Database Setup (PostgreSQL)
Ensure PostgreSQL is running locally on port `5432`:
```bash
# Create database
psql -U postgres -c "CREATE DATABASE claimora;"

# Apply schema (Source of Truth)
psql -U postgres -d claimora -f database/schema.sql

# Load fictional seed records
psql -U postgres -d claimora -f database/seed.sql
```

### 2. Backend Setup (Spring Boot)
The backend reads database credentials from environment variables with safe defaults:
- `DB_URL` (default: `jdbc:postgresql://localhost:5432/claimora`)
- `DB_USERNAME` (default: `postgres`)
- `DB_PASSWORD` (default: `postgres`)

Build and launch the backend:
```bash
cd backend

# Run build and test suite
./mvnw clean test

# Run Spring Boot dev server (listening on port 8080)
./mvnw spring-boot:run
```
Verify the backend is running by visiting: [http://localhost:8080/api/health](http://localhost:8080/api/health)

### 3. Frontend Setup (Angular)
Launch the Angular development server:
```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm start
# or: ng serve
```
Open your browser at: [http://localhost:4200](http://localhost:4200)

---

## 🔒 Security & Credential Rules
- **ZERO CREDENTIALS IN GIT**: Never commit real database passwords, secret keys, or cloud access tokens.
- All secrets must be passed via environment variables or local `.env` files (which are strictly ignored by `.gitignore`).
- `application.properties` uses placeholder defaults (`${DB_PASSWORD:postgres}`) for development.

---

## 🌿 Branching & Pull Request Rules
- Never commit directly to `main`.
- All feature work must be performed on dedicated branches named after the module:
  - `feature/user` (Vidhi)
  - `feature/product` (Shaili)
  - `feature/claim` (Tanishka)
  - `feature/evidence` (Kalp)
  - `feature/finding` (Chinmay)
  - `feature/investigation` (Anuj)
- **Pull Request Requirements**:
  1. Every PR requires at least one peer review approval before merging to `main`.
  2. All automated tests (`./mvnw test` and `ng build`) must pass without errors.
  3. PRs must adhere to DTO isolation (no entities exposed) and REST API conventions (`/api/<plural-noun>`).
