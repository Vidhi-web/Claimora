# Claimora 🛡️
> **Evidence-Centric Warranty Claims Investigation & Fraud-Risk Analysis Platform**
> 
> *"Every alert has evidence. Every correction has a history. Every resolution has a reason."*

---

Claimora is an enterprise-grade forensic investigation platform engineered to automate warranty fraud detection, accelerate claim triage, and enforce an immutable, append-only chain of custody. By pairing cryptographic document fingerprinting (SHA-256), automated OCR extraction (Apache PDFBox & Tess4J), a pluggable multi-heuristic fraud risk engine, and an interactive Visual Evidence Graph, Claimora empowers risk teams to uncover sophisticated cross-claim warranty abuse before payout.

---

## 📑 Table of Contents
1. [Core Architectural Highlights](#-core-architectural-highlights)
2. [Technology Stack](#-technology-stack)
3. [Quickstart: Running Locally](#-quickstart-running-locally)
4. [Seed Accounts & Role-Based Access Control (RBAC)](#-seed-accounts--role-based-access-control-rbac)
5. [Pluggable Fraud Detection Rules Engine](#-pluggable-fraud-detection-rules-engine)
6. [Investigation Lifecycle & Append-Only Audit Trail](#-investigation-lifecycle--append-only-audit-trail)
7. [Visual Evidence Graph & Digital Forensics](#-visual-evidence-graph--digital-forensics)
8. [Automated Test Suite & Verification](#-automated-test-suite--verification)
9. [Step-by-Step Evaluator Demo Walkthrough](#-step-by-step-evaluator-demo-walkthrough)
10. [Repository Structure](#-repository-structure)

---

## 🏛️ Core Architectural Highlights

- **Digital Fingerprinting & Deduplication**: Every evidence document (invoice, repair report, photo) is hashed using SHA-256 upon ingestion to detect cross-claim re-use and digital tampering across unrelated warranty claims.
- **Automated OCR & Data Ingestion**: Tess4J and Apache PDFBox extract serial numbers, purchase dates, invoice numbers, and line items into structured JSON payloads.
- **Pluggable Analysis Engine**: A modular Java rule engine evaluates claims against 6 forensic heuristics, computes a composite risk score (0–100), and creates idempotent findings with directional evidence links (`CONFLICTING_VALUE`, `DUPLICATE_OF`, `SUPPORTING_EVIDENCE`).
- **Claim Auto-Flagging (No Auto-Rejection)**: Claims triggering high-risk findings are updated to `FLAGGED` status for human investigator review—never auto-rejected.
- **Append-Only Investigation Trail**: Strict state machine transitions (`OPEN` &rarr; `UNDER_INVESTIGATION` &rarr; `RESOLVED` / `DISMISSED`) require mandatory explanations. Any attempt to update (`PUT`, `PATCH`) or delete (`DELETE`) historical audit records is strictly rejected with **HTTP 405 Method Not Allowed**.
- **Visual Evidence Graph**: Standalone Angular component rendering interactive relational node diagrams connecting fraud findings to conflicting documents.

---

## 🛠️ Technology Stack

| Layer | Technologies | Highlights |
| :--- | :--- | :--- |
| **Frontend** | Angular (Latest, Standalone), TypeScript, Modern Vanilla CSS | Zero third-party UI bloat, Plus Jakarta Sans typography, dark-mode glassmorphic aesthetics, reactive signals, dev proxy. |
| **Backend** | Java 17+, Spring Boot 4.x, Spring Data JPA, Spring Security | Method-level `@PreAuthorize` RBAC, BCrypt password hashing, stateless JWT authentication, HikariCP. |
| **Document OCR** | Apache PDFBox, Tess4J (Tesseract OCR) | Automated text and field extraction from invoices and receipts. |
| **Database** | PostgreSQL 16+ (Production) / H2 In-Memory (Dev/Test) | Relational constraints, indexed SHA-256 digests, JSON field persistence. |
| **Build Tools** | Maven Wrapper (`./mvnw`), Angular CLI (`ng`), Postman/Newman | Automated CI test suites, Postman collection v2.1. |

---

## 🚀 Quickstart: Running Locally

### Prerequisites
- **Java 17 JDK** or higher installed (`java -version`)
- **Node.js 18+** and **npm** installed (`node -v`)
- *(Optional)* **PostgreSQL 16+** (by default, the backend runs in zero-config `dev` mode with in-memory H2)

---

### Step 1: Start the Spring Boot Backend (Port 8080)

Open a terminal in the project directory:

```bash
cd backend

# Option A: Zero-config Dev Mode (Uses H2 in-memory with automatic schema & seed data)
# Windows PowerShell:
$env:SPRING_PROFILES_ACTIVE = "dev"; .\mvnw.cmd spring-boot:run

# Linux / macOS:
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

```bash
# Option B: Production PostgreSQL Mode
# 1. Initialize database:
psql -U postgres -c "CREATE DATABASE claimora;"
psql -U postgres -d claimora -f ../database/schema.sql
psql -U postgres -d claimora -f ../database/seed.sql

# 2. Run with PostgreSQL:
.\mvnw.cmd spring-boot:run
```

The backend server starts on **`http://localhost:8080`**.
- Health Check: `http://localhost:8080/api/health`
- REST Base Path: `http://localhost:8080/api`

---

### Step 2: Start the Angular Frontend (Port 4200)

Open a second terminal:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server with proxy to backend
npm start
```

Open your browser at **[http://localhost:4200](http://localhost:4200)**. The dev server includes an automated proxy configured in `proxy.conf.json` that routes all `/api/*` calls directly to `http://localhost:8080`.

---

## 👥 Seed Accounts & Role-Based Access Control (RBAC)

Claimora comes pre-configured with three role tiers for immediate evaluation:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@claimora.internal` | `AdminPass123!` | Full system access: user provisioning, role assignments, finding assignments, system-wide metrics. |
| **INVESTIGATOR** | `alex.investigator@claimora.internal` | `InvestigatorPass123!` | Forensic analysis, evidence review, finding resolution/dismissal, audit state transitions. |
| **STAFF** | `staff@claimora.internal` | `StaffPass123!` | Intake operations: submit claims, register products, upload evidence documents. |

---

## 🧠 Pluggable Fraud Detection Rules Engine

When an investigator clicks **"⚡ Run Fraud Analysis"** (`POST /api/claims/{id}/analyze`), Claimora's rule engine evaluates the claim against modular implementations of the `AnalysisRule` interface:

| Rule Code | Severity | Weight | Heuristic & Detection Logic | Evidence Role Assigned |
| :--- | :---: | :---: | :--- | :--- |
| **`DUPLICATE_INVOICE`** | **HIGH** | 50 | Detects identical invoice numbers or duplicate SHA-256 file hashes across distinct warranty claims. | `CONFLICTING_VALUE`, `DUPLICATE_OF` |
| **`SERIAL_REUSE`** | **HIGH** | 45 | Flags repeat warranty claims filed on the same serial number within a 90-day threshold. | `SUPPORTING_EVIDENCE` |
| **`DATE_CONFLICT`** | **HIGH** | 50 | Identifies claims filed outside product warranty validity or where invoice dates post-date claim dates. | `CONFLICTING_VALUE` |
| **`INVOICE_MISMATCH`** | **MEDIUM** | 30 | Flags discrepancies between invoice OCR extracted serial/model and registered product catalog data. | `CONFLICTING_VALUE` |
| **`DUPLICATE_PHOTO`** | **HIGH** | 40 | Uncovers identical digital image fingerprints (damage photos) submitted across multiple claims. | `DUPLICATE_OF` |
| **`REPAIR_PARTS_MISMATCH`**| **MEDIUM** | 25 | Discovers conflicting part descriptions between technician repair reports and parts invoices. | `CONFLICTING_VALUE` |

### Composite Risk Scoring
$$\text{Score} = \min\left(100, \sum_{\text{rule } r} \text{Weight}(r)\right)$$
- **`CRITICAL` Risk**: Score $\ge 80$
- **`HIGH` Risk**: Score $\ge 50$
- **`MEDIUM` Risk**: Score $\ge 25$
- **`LOW` Risk**: Score $< 25$

---

## 🔒 Investigation Lifecycle & Append-Only Audit Trail

Claimora guarantees complete accountability:

```
                  ┌──────────────────────┐
                  │         OPEN         │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ UNDER_INVESTIGATION  │
                  └──────┬────────┬──────┘
                         │        │
             ┌───────────┘        └───────────┐
             ▼                                ▼
  ┌──────────────────────┐        ┌──────────────────────┐
  │       RESOLVED       │        │      DISMISSED       │
  └──────────┬───────────┘        └───────────┬──────────┘
             │                                │
             └───────────► REOPEN ◄───────────┘
```

1. **State Invariants**:
   - `OPEN` &rarr; `UNDER_INVESTIGATION` or `DISMISSED`
   - `UNDER_INVESTIGATION` &rarr; `RESOLVED` or `DISMISSED`
   - `RESOLVED` &rarr; `OPEN` (Reopen)
   - `DISMISSED` &rarr; `OPEN` (Reopen)
2. **Mandatory Explanations**: A substantive explanation is strictly required before a finding can be resolved, dismissed, or reopened.
3. **HTTP 405 Method Not Allowed**: Investigation actions are append-only. Any attempt to update (`PUT`, `PATCH`) or delete (`DELETE`) via `/api/investigations/{id}` returns `405 Method Not Allowed`.

---

## 🔍 Visual Evidence Graph & Digital Forensics

The Findings module provides an interactive relational node view:
- **Central Node**: The flagged Finding (Rule Code, Severity, Claim ID).
- **Directional Links**: Colored relationship branches showing:
  - `CONFLICTING_VALUE` (Rose badge): Contradictory invoice numbers, mismatched serial numbers.
  - `DUPLICATE_OF` (Purple badge): Identical SHA-256 digital file digests across different claims.
  - `SUPPORTING_EVIDENCE` (Blue badge): Prior claims on the same serial, technician diagnostic logs.
- **Evidence Node**: Document type, filename, SHA-256 hash snippet, and OCR status.

---

## 🧪 Automated Test Suite & Verification

The project includes an exhaustive suite of unit and integration tests.

### Running Backend Tests (JUnit 5 + Spring Security Test)
```bash
cd backend
.\mvnw.cmd test
```
**Results: 61 tests run, 0 failures, 0 errors, 100% passing.**
- `AnalysisRulesTest`: Validates all 6 fraud detection heuristics with edge cases.
- `AnalysisServiceTest`: Verifies idempotent finding creation and claim auto-flagging.
- `EvidenceDocumentServiceTest`: Tests SHA-256 hashing, protected storage, and OCR correction.
- `InvestigationActionControllerTest`: Confirms HTTP 405 Method Not Allowed on audit modification.
- `InvestigationActionServiceTest`: Validates state machine rules and mandatory explanations.
- `DashboardServiceTest`: Verifies platform KPI metrics and executive reporting.
- `UserControllerIntegrationTest` & `UserServiceTest`: Verifies RBAC and user lifecycle.

### Running Frontend Compilation (`ng build`)
```bash
cd frontend
npm run build
```
**Results: Clean production build with 0 errors and 0 warnings across all 10 feature chunks.**

### Running Postman API Collection
A comprehensive Postman Collection v2.1 is located at:
`docs-and-tests/Claimora_API_Collection.postman_collection.json`

Execute with Newman:
```bash
npx newman run docs-and-tests/Claimora_API_Collection.postman_collection.json --env-var "baseUrl=http://localhost:8080/api"
```

---

## 🎯 Step-by-Step Evaluator Demo Walkthrough

Follow this scripted 5-minute walkthrough to experience Claimora's complete end-to-end workflow:

### Step 1: Sign In & Explore Executive Dashboard
1. Navigate to `http://localhost:4200` (auto-redirects to `/auth/login`).
2. Log in as Administrator:
   - **Email**: `admin@claimora.internal`
   - **Password**: `AdminPass123!`
3. You are redirected to `/dashboard`. Observe the live KPI metrics:
   - Total Claims, Flagged Claims, Active Findings, and Fraud Exposure Rate %.
   - Top Triggered Fraud Rules chart.
   - Recent Investigation Actions audit timeline.

### Step 2: Inspect Covered Products Catalog
1. Click **Products** in the top navigation bar (`/products`).
2. View registered products (Dell XPS 15, MacBook Pro 16, Sony WH-1000XM5).
3. Search for `XPS 15` or filter by serial number.
4. Note the automatic **ACTIVE** / **EXPIRED** warranty status badges computed against warranty start and end dates.

### Step 3: Trigger Automated Fraud Risk Analysis on Claims
1. Click **Claims** in the top navigation bar (`/claims`).
2. Filter claims by status: click the **Flagged** tab.
3. Locate claim `CLM-2026-000101` and click **"⚡ Analyze"**.
4. The system executes all 6 fraud detection rules:
   - Evaluates OCR text against registered product records.
   - Computes SHA-256 cross-claim hash collisions.
   - Checks serial reuse and warranty validity dates.
5. In the drawer that appears, observe:
   - **Risk Score: 50 (HIGH RISK)**.
   - Triggered Rule: `DUPLICATE_INVOICE`.
   - Associated evidence documents and auto-flagged claim status.

### Step 4: Explore the Interactive Visual Evidence Graph
1. Click **Findings** in the top navigation bar (`/findings`).
2. Select Finding `#1` (`DUPLICATE_INVOICE`) and click **"🔍 Evidence Graph"**.
3. Inspect the forensic diagram:
   - Central node: `DUPLICATE_INVOICE` (High Severity).
   - Directional link `CONFLICTING_VALUE` pointing to the claim's invoice document.
   - Directional link `DUPLICATE_OF` pointing to the duplicate invoice from another claim.
   - Complete SHA-256 hash comparison proving exact digital duplicate.

### Step 5: Assign Finding to Investigator
1. On the same finding card, click **"✎ Assign"**.
2. Select `Alex Investigator (alex.investigator@claimora.internal)`.
3. Click **"Confirm Assignment"**. The finding updates with the assigned investigator.

### Step 6: Evidence Document Explorer & Manual OCR Field Correction
1. Click **Evidence Explorer** in the top navigation (`/evidence`).
2. Filter documents or copy a SHA-256 hash with 1 click.
3. Click **"⚙ OCR Data"** on any invoice document.
4. Review the extracted JSON fields (`invoiceNumber`, `serialNumber`, `totalAmount`).
5. Update a field and enter a mandatory reason (e.g. *"Corrected OCR digit recognition for invoice serial"*).
6. Click **"Save Correction"**. The document status updates to `MANUAL` and an append-only `CORRECT_VALUE` action is automatically committed to the investigation audit log!

### Step 7: Record State Transition & Mandatory Justification
1. Return to **Findings** (`/findings`).
2. Click **"⚡ Action & Transition"** on an open finding.
3. Select Action Type: **RESOLVE** (or **DISMISS**).
4. Enter an explanation (e.g. *"Contacted authorized retail center; confirmed customer provided legitimate replacement receipt from store manager."*).
5. Click **"Commit Action"**. The finding transitions to `RESOLVED` and the claim status updates in real time.

### Step 8: Verify Tamper-Proof Audit Integrity
1. Click **Investigations** (`/investigations`).
2. View the complete chronological audit feed showing the action you just committed, complete with investigator timestamp and state transition badges.
3. Attempting to modify or delete this record via `PUT /api/investigations/1` or `DELETE /api/investigations/1` in Postman will immediately return:
   ```json
   {
     "status": 405,
     "error": "Method Not Allowed",
     "message": "Investigation actions are strictly append-only audit records and cannot be modified."
   }
   ```

### Step 9: View and Export Executive Forensic Report
1. Click **Reports** in the top navigation (`/reports`).
2. Review the consolidated executive intelligence summary:
   - Unique Report ID and generation timestamp.
   - High-Risk Flagged Claims roster.
   - Top Fraud Rules distribution bars.
   - Full audit trail history.
3. Click **"🖨️ Print / Export PDF"** to preview the clean, print-optimized report layout.

---

## 📁 Repository Structure

```text
claimora/
├── README.md                      # Complete project documentation & quickstart
├── CONTRIBUTING.md                # Engineering conventions & workflow standards
├── .gitignore                     # Git ignore rules for Java, Node, Angular, and IDEs
│
├── frontend/                      # Angular 17+ Standalone Frontend Application
│   ├── package.json
│   ├── angular.json               # Angular CLI configuration
│   ├── proxy.conf.json            # Dev server proxy routing /api -> http://localhost:8080
│   └── src/
│       ├── styles.css             # Global dark-mode design system & animations
│       └── app/
│           ├── app.routes.ts      # Lazy-loaded feature routes with guards
│           ├── core/              # AuthService, JWT storage, authGuard, roleGuard
│           ├── models/            # DTO models (User, Claim, Finding, Evidence, ...)
│           ├── services/          # HTTP API client services
│           └── features/
│               ├── auth/          # Login & authentication view
│               ├── dashboard/     # Live KPI widgets, fraud rate, rule bars
│               ├── claims/        # Claim intake, filters, analyze drawer
│               ├── products/      # Warranty registry & active/expired status
│               ├── evidence/      # Evidence Explorer, SHA-256 copy, OCR editor
│               ├── findings/      # Findings grid & Visual Evidence Graph modal
│               ├── investigations/# Chronological append-only audit trail
│               ├── reports/       # Executive forensic summary & print view
│               ├── users/         # Admin user administration & role editor
│               └── profile/       # User profile & password changer
│
├── backend/                       # Java 17 + Spring Boot Backend Application
│   ├── pom.xml                    # Maven build with JPA, Web, Security, PDFBox, Tess4J
│   ├── mvnw, mvnw.cmd             # Maven Wrapper
│   └── src/
│       ├── main/java/com/claimora/
│       │   ├── BackendApplication.java
│       │   ├── analysis/          # AnalysisRule engine & 6 fraud detection rules
│       │   ├── config/            # CorsConfig, JacksonConfig, DataInitializer
│       │   ├── controller/        # REST controllers (Claims, Findings, Docs, ...)
│       │   ├── dto/               # Strict Request & Response DTOs
│       │   ├── entity/            # JPA entities with relational constraints
│       │   ├── exception/         # GlobalExceptionHandler (standard error payloads)
│       │   ├── ocr/               # Tess4J & PDFBox text & field extractor
│       │   ├── repository/        # Spring Data JPA repositories
│       │   ├── security/          # SecurityConfig, JwtAuthenticationFilter, RBAC
│       │   ├── service/           # Business services enforcing invariants
│       │   └── storage/           # Protected disk storage & SHA-256 fingerprinting
│       └── test/java/com/claimora/# 61 automated unit and integration tests
│
├── database/                      # Relational Database Source of Truth
│   ├── schema.sql                 # 7 tables with PKs, FKs, constraints, and indexes
│   ├── seed.sql                   # Realistic warranty claims & fraud scenario data
│   └── README.md                  # Database execution instructions
│
└── docs-and-tests/                # Documentation & Verification Artifacts
    ├── Claimora_API_Collection.postman_collection.json # Complete Postman collection
    ├── api-documentation.md       # Comprehensive REST API specifications
    ├── api-test-cases.md          # Functional & edge case test matrices
    └── README.md                  # Instructions for Postman & Newman
```

---

## 📜 License & Compliance
This software is developed strictly for enterprise warranty claims investigation, fraud-risk mitigation, and regulatory compliance audit logging. All sample records and claimant identities are strictly fictional.
