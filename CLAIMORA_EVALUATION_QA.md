# Claimora: Comprehensive Evaluator Q&A Handbook & Viva Defense Guide
> **Evidence-Centric Warranty Claims Investigation & Fraud-Risk Analysis Platform**  
> *"Every alert has evidence. Every correction has a history. Every resolution has a reason."*

---

## 📑 Master Table of Contents
1. [Master Defense Strategy & Viva Presentation Framework](#1-master-defense-strategy--viva-presentation-framework)
2. [Category 1: Problem Statement, Business Value & Domain Questions](#2-category-1-problem-statement-business-value--domain-questions)
3. [Category 2: System Architecture & Technical Design Decisions](#3-category-2-system-architecture--technical-design-decisions)
4. [Category 3: Frontend Architecture — Angular Deep Dive & Angular vs React](#4-category-3-frontend-architecture--angular-deep-dive--angular-vs-react)
5. [Category 4: Backend Architecture — Java 17, Spring Boot & OOP Patterns](#5-category-4-backend-architecture--java-17-spring-boot--oop-patterns)
6. [Category 5: Database Architecture, PostgreSQL, JPA & Hibernate ORM](#6-category-5-database-architecture-postgresql-jpa--hibernate-orm)
7. [Category 6: Security, JWT Authentication, BCrypt & RBAC](#7-category-6-security-jwt-authentication-bcrypt--rbac)
8. [Category 7: Fraud Detection Rules Engine & Composite Scoring Algorithms](#8-category-7-fraud-detection-rules-engine--composite-scoring-algorithms)
9. [Category 8: Digital Forensics, Document Storage & OCR Pipeline](#9-category-8-digital-forensics-document-storage--ocr-pipeline)
10. [Category 9: Append-Only Audit Trail & State Machine Immutability](#10-category-9-append-only-audit-trail--state-machine-immutability)
11. [Category 10: Performance Optimization, Database Tuning & Scalability](#11-category-10-performance-optimization-database-tuning--scalability)
12. [Category 11: AI Integration Reality, Explainability & Future Roadmap](#12-category-11-ai-integration-reality-explainability--future-roadmap)
13. [Category 12: Individual Team Member Ownership & Contribution Defense](#13-category-12-individual-team-member-ownership--contribution-defense)
14. [Step-by-Step Live Demonstration Script (UI, Swagger & Postman)](#14-step-by-step-live-demonstration-script-ui-swagger--postman)
15. [Evaluator "Gotcha" Questions & Bulletproof Answers](#15-evaluator-gotcha-questions--bulletproof-answers)

---

## 1. Master Defense Strategy & Viva Presentation Framework

### 1.1 The 30-Second Elevator Pitch
> *"Claimora is an enterprise forensic investigation platform engineered to uncover warranty fraud across consumer electronics. Rather than relying on opaque AI scores that cannot be defended legally, Claimora connects digital document fingerprinting (SHA-256), automated OCR extraction, a pluggable 6-rule heuristic engine, and an interactive Visual Evidence Graph. It automatically flags suspicious claims for human review while enforcing a strictly append-only, tamper-proof audit trail where historical actions cannot be edited or erased."*

### 1.2 Core Architectural Principles to Emphasize
1. **The No Auto-Rejection Principle**: Claimora automates detection, not decision-making. High-risk claims are transitioned to `FLAGGED` status for forensic triage—never auto-rejected. Final payout or rejection decisions remain strictly with authorized human investigators.
2. **Deterministic Evidence Traceability**: Every alert raised links directly to physical supporting documents with explicit directional roles (`CONFLICTING_VALUE`, `DUPLICATE_OF`, `SUPPORTING_EVIDENCE`).
3. **Immutable Chain of Custody**: Reviewer notes, status changes, and resolution justifications are append-only. Modifying or deleting audit records returns **HTTP 405 Method Not Allowed**.

---

## 2. Category 1: Problem Statement, Business Value & Domain Questions

### Q1.1 (Basic): What specific problem does Claimora solve?
**Answer**:
In the consumer electronics warranty sector, manufacturers lose between **10% and 15% of annual warranty payouts** to fraudulent, inflated, or erroneous claims. Traditional claims management tools inspect claims in isolation. This allows fraud rings to:
- Reuse the same purchase invoice across different claims under distinct customer names.
- Submit repeat warranty claims on the same product serial number within weeks.
- Post-date invoices or submit claims for devices whose warranty has expired.
- Recyle stock damage photos across multiple unrelated claims.
Claimora solves this by indexing document cryptographic fingerprints (SHA-256) and OCR fields across the entire repository, performing automated cross-claim consistency checks.

### Q1.2 (Intermediate): What are the key fraud patterns detected by Claimora?
**Answer**:
Claimora implements six modular forensic rules in `com.claimora.analysis.rules.*`:
1. `DUPLICATE_INVOICE`: Detects identical invoice numbers or identical SHA-256 file hashes across different claims.
2. `SERIAL_REUSE`: Flags repeat warranty claims filed on the same product serial number within a 90-day window.
3. `DATE_CONFLICT`: Identifies claims submitted after the product's warranty expiration date or where the purchase invoice date post-dates the claim submission.
4. `INVOICE_MISMATCH`: Discovers discrepancies between invoice OCR extracted data (model/serial) and product catalog data.
5. `DUPLICATE_PHOTO`: Flags identical digital image file hashes submitted in different claims.
6. `REPAIR_PARTS_MISMATCH`: Discovers conflicts between technician diagnostic logs and replacement parts invoices.

### Q1.3 (Advanced): How does Claimora deliver financial Return on Investment (ROI)?
**Answer**:
For an enterprise processing 100,000 claims annually with an average repair/payout cost of \$250, warranty expenses reach \$25M, with roughly \$2.5M lost to fraud or errors. By catching 60% of duplicate invoices, serial recycling, and expired warranties during initial intake, Claimora recovers approximately **\$1.5M annually**. Crucially, it cuts investigator triage time by up to 70% by presenting an interactive Visual Evidence Graph rather than requiring manual cross-document searching.

---

## 3. Category 2: System Architecture & Technical Design Decisions

### Q2.1 (Basic): Walk us through the high-level architecture of Claimora.
**Answer**:
Claimora is designed as a decoupled, multi-tier enterprise application:
1. **Presentation Tier**: Angular 22 Single Page Application (SPA) using standalone components and responsive glassmorphic styling, served via Nginx in production or Angular dev server with a reverse proxy (`proxy.conf.json`).
2. **Application Tier**: Java 17 and Spring Boot 4.1.2 REST API engine packaged as an executable WAR. Handles stateless JWT authentication, RBAC, business workflows, document storage, and OCR extraction.
3. **Persistence Tier**: PostgreSQL 16 (production) with relational integrity constraints, foreign keys, B-tree indexes on file hashes, and JSONB fields for OCR data; zero-config H2 in-memory database for rapid local development and automated testing.
4. **File Storage**: Protected local disk filesystem (`./storage/uploads`) isolated from public web access with path traversal prevention.

### Q2.2 (Intermediate): Why choose a decoupled SPA + Headless REST API instead of a server-rendered monolith (JSP / Thymeleaf)?
**Answer**:
1. **Separation of Concerns**: The backend focuses purely on business logic, rule evaluation, transaction management, and data integrity, exposing clean REST contracts.
2. **Interactive Forensic Visualizations**: Dynamic user interfaces like the Visual Evidence Graph require rich client-side DOM manipulation and reactive state updates that are cumbersome and slow to render with server-side templates.
3. **Multi-Client Readiness**: The headless REST API can serve mobile field technician apps, third-party service centre integrations, and automated ingestion pipelines without altering backend code.

### Q2.3 (Advanced): Trace the end-to-end execution flow when an investigator clicks "Run Fraud Analysis".
**Answer**:
1. **Frontend Trigger**: The investigator clicks the "⚡ Run Fraud Analysis" button in `ClaimsComponent` or `FindingsComponent`.
2. **HTTP Request**: Angular's `HttpClient` issues `POST /api/claims/{id}/analyze`.
3. **Interceptor**: `authInterceptor` intercepts the request, retrieves the JWT token from `AuthService`, and injects `Authorization: Bearer <token>`.
4. **Security Filter**: `JwtAuthenticationFilter` intercepts the request, verifies the HMAC-SHA256 signature using `JwtService`, extracts user claims, loads `CustomUserDetails`, and sets the `SecurityContextHolder`.
5. **Controller**: `ClaimController.analyzeClaim(id, userDetails)` receives the call and delegates to `AnalysisService.analyzeClaim(id, userDetails)`.
6. **Context Construction**: `AnalysisService` loads the `Claim` and its `EvidenceDocument`s, instantiating an `AnalysisContext`.
7. **Rule Execution**: `AnalysisService` iterates through all registered `AnalysisRule` beans (`DuplicateInvoiceRule`, `SerialReuseRule`, etc.), calling `rule.evaluate(context)`.
8. **Idempotent Persistence**: Discovered drafts are checked against existing findings. New findings are saved immediately via `findingRepository.saveAndFlush()`. Evidence documents are linked via `evidenceLinkRepository.saveAndFlush()`.
9. **Claim Auto-Flagging**: If active findings exist, the claim's status is updated to `FLAGGED` (`claimRepository.save(claim)`).
10. **Response Serialization**: An `AnalysisResultResponse` containing composite score (0–100), risk level, and findings is serialized to JSON and returned with **HTTP 200 OK**.
11. **UI Update**: Angular receives the response and dynamically updates the claim risk badge and findings list.

---

## 4. Category 3: Frontend Architecture — Angular Deep Dive & Angular vs React

### Q3.1 (Basic): What version of Angular is used, and what does "Standalone Components" mean?
**Answer**:
Claimora uses **Angular 22.2.0**. Modern Angular applications use **Standalone Components** (`standalone: true`), which eliminate the need for `NgModule`. Each component directly declares its necessary dependencies in its `imports: [CommonModule, FormsModule]` array. This results in cleaner modularity, faster build compilation, and smaller bundle sizes due to better tree-shaking.

### Q3.2 (Intermediate): Why did you choose Angular over React for Claimora?
**Answer**:
| Criteria | Angular 22 (Chosen) | React |
| :--- | :--- | :--- |
| **Architectural Standard** | Complete opinionated framework with built-in routing, HTTP client, interceptors, and form validation. | Library only; requires assembling separate libraries (Axios, React Router, Redux, Formik). |
| **Team Consistency** | Enforces a unified project structure, vital for six developers working on different domain entities. | High architectural divergence; each developer often writes state and API calls differently. |
| **Type Safety** | Native, deep TypeScript integration across templates and services. | TypeScript is optional and requires extra configuration. |
| **Interceptors & Guards** | Native functional interceptors (`HttpInterceptorFn`) and route guards (`CanActivateFn`). | Requires custom Axios interceptors and wrapper components. |

### Q3.3 (Advanced): How does the functional `authInterceptor` handle transient backend cold-start errors?
**Answer**:
In `frontend/src/app/core/interceptors/auth.interceptor.ts`, we implement an RxJS pipeline using the `retry` operator:
```typescript
retry({
  count: 2,
  delay: (error: HttpErrorResponse, attempt) => {
    const retryable = error.status === 0    // Network drop / ECONNREFUSED
                   || error.status === 502  // Bad Gateway
                   || error.status === 503  // Service Unavailable
                   || error.status === 504; // Gateway Timeout
    if (!retryable) throw error;            // Do not retry 401, 403, 400
    return timer(attempt * 2000);           // Exponential delay: 2s, then 4s
  }
})
```
This handles backend container restarts or database connection pool warm-ups gracefully without displaying immediate error banners to the user.

---

## 5. Category 4: Backend Architecture — Java 17, Spring Boot & OOP Patterns

### Q5.1 (Basic): What Java version and Spring Boot version are used?
**Answer**:
- **Java**: Java 17 (LTS), leveraging modern language features such as records, text blocks, enhanced switch expressions, and pattern matching.
- **Spring Boot**: Spring Boot 4.1.2, paired with Spring Framework 7.0.10 and Hibernate ORM 7.4.13.

### Q5.2 (Intermediate): How are Object-Oriented Programming (OOP) concepts demonstrated in Claimora?
**Answer**:
1. **Encapsulation**: Domain entities (`Claim`, `Finding`, `EvidenceDocument`) encapsulate private fields with public accessors and domain methods, shielding state from unauthorized mutation.
2. **Abstraction**: The `AnalysisRule` interface abstracts the detection logic. `AnalysisService` interacts purely with this abstraction without coupling to specific rule logic.
3. **Inheritance**: Exception hierarchy where `ResourceNotFoundException` and `ValidationException` extend `RuntimeException`, handled polymorphically by `GlobalExceptionHandler`.
4. **Polymorphism**: Spring auto-injects all beans implementing `AnalysisRule` into `List<AnalysisRule>`. During analysis, each rule's `evaluate(context)` method executes its unique forensic logic through runtime polymorphism.

### Q5.3 (Advanced): What design patterns are implemented in Claimora?
**Answer**:
1. **Strategy Pattern**: The fraud detection rules engine. Each rule (`DuplicateInvoiceRule`, `SerialReuseRule`, etc.) is an interchangeable strategy implementing `AnalysisRule`.
2. **Repository Pattern**: Spring Data JPA repositories (`ClaimRepository`, `FindingRepository`) decouple business services from SQL persistence mechanics.
3. **Data Transfer Object (DTO) Pattern**: DTOs (`ClaimRequest`, `ClaimResponse`, `FindingResponse`) isolate database entities from public REST contracts, preventing mass-assignment vulnerabilities.
4. **Chain of Responsibility Pattern**: Spring Security's `SecurityFilterChain`, where incoming requests pass through `JwtAuthenticationFilter`, `UsernamePasswordAuthenticationFilter`, and exception translation filters.
5. **Static Factory Pattern**: Used in standardized response generation, such as `OcrResult.empty("FAILED")`.

### Q5.4 (Advanced): Why is the backend packaged as a WAR instead of a JAR, and how does `spring-boot-starter-tomcat` with scope `provided` work?
**Answer**:
In `pom.xml`, `<packaging>war</packaging>` is configured. The dependency `spring-boot-starter-tomcat` is marked with `<scope>provided</scope>`. This dual-mode design provides maximum deployment flexibility:
1. **Standalone Execution**: The Spring Boot Maven plugin bundles Tomcat within the WAR archive's `WEB-INF/lib-provided/` directory, allowing standalone execution via `java -jar claimora.war`.
2. **Servlet Container Deployment**: When deployed into an external Apache Tomcat 11 application server, the container provides its own servlet engine, and the WAR does not bundle conflicting servlet libraries. `BackendApplication` extends `SpringBootServletInitializer` to configure the servlet context upon deployment.

---

## 6. Category 5: Database Architecture, PostgreSQL, JPA & Hibernate ORM

### Q6.1 (Basic): What database engine does Claimora use, and what are the main tables?
**Answer**:
- **Database**: PostgreSQL 16+ in production; H2 in-memory database in development mode.
- **Seven Core Tables**:
  1. `users` (User accounts, roles, statuses, password hashes)
  2. `product` (Product models, serial numbers, warranty start/end dates)
  3. `claim` (Claims, claim numbers, issue descriptions, statuses)
  4. `evidence_document` (File paths, SHA-256 hashes, OCR extracted JSON)
  5. `finding` (Flagged rule violations, severities, assigned investigators)
  6. `investigation_action` (Append-only audit actions, explanations, status transitions)
  7. `evidence_link` (Many-to-many relationship linking findings to supporting documents)

### Q6.2 (Intermediate): Explain the composite primary key in `evidence_link`.
**Answer**:
The `evidence_link` table resolves the many-to-many relationship between `finding` and `evidence_document`. It uses a composite primary key consisting of `(finding_id, document_id)`.
In Java, this is mapped using an `@Embeddable` class `EvidenceLinkId` containing `findingId` and `documentId`, referenced in the `EvidenceLink` entity using `@EmbeddedId`. This guarantees that a document can never be linked to the same finding twice, preventing duplicate relationship records.

### Q6.3 (Advanced): Explain the foreign key cascading rules in Claimora's schema.
**Answer**:
- `claim` &rarr; `product`: `ON DELETE RESTRICT`. A product cannot be deleted if warranty claims exist against it, preserving legal claim histories.
- `claim` &rarr; `users`: `ON DELETE RESTRICT`. A user who submitted claims cannot be deleted from the system.
- `evidence_document` &rarr; `claim`: `ON DELETE CASCADE`. If a test claim is removed, its document metadata is cleaned up automatically.
- `finding` &rarr; `users` (`assigned_to`): `ON DELETE SET NULL`. If an investigator account is removed, the finding remains active and reverts to unassigned status.
- `investigation_action` &rarr; `users`: `ON DELETE RESTRICT`. A user who performed investigation actions cannot be deleted, ensuring forensic audit accountability.

### Q6.4 (Advanced): What caused the Hibernate error `Entry for instance of 'com.claimora.entity.Finding' has a null identifier`, and how was it resolved?
**Answer**:
- **Root Cause**: In `AnalysisService`, new `Finding` entities were saved using `findingRepository.save()`. Because Hibernate performs write-behind caching (lazy flushing), the generated primary key `findingId` remained `null` in memory. When the code immediately constructed `new EvidenceLinkId(targetFinding.getFindingId(), doc.getDocumentId())`, it passed a `null` finding ID. When subsequent repository queries triggered an auto-flush, Hibernate failed assertion checks because an entity with a null identity was referenced in a composite relationship.
- **The Solution**:
  1. Replaced `findingRepository.save()` with `findingRepository.saveAndFlush()`, forcing immediate SQL insert execution and identity generation.
  2. Replaced `evidenceLinkRepository.save()` with `evidenceLinkRepository.saveAndFlush()`.
  3. Added null safety guards checking `targetFinding != null && targetFinding.getFindingId() != null`.
  4. Appended `DB_CLOSE_ON_EXIT=FALSE;DB_CLOSE_DELAY=-1` to the H2 connection URL to prevent connection poolers from closing in-memory comparator sessions.

---

## 7. Category 6: Security, JWT Authentication, BCrypt & RBAC

### Q7.1 (Basic): How is user authentication implemented in Claimora?
**Answer**:
Claimora implements **stateless JSON Web Token (JWT)** authentication. When a user submits valid email and password credentials to `POST /api/auth/login`, `AuthService` verifies the BCrypt password hash. Upon successful verification, `JwtService` issues a cryptographically signed HMAC-SHA256 JWT containing user claims (`userId`, `email`, `role`, `status`). The client stores this token in `localStorage` and transmits it in the `Authorization: Bearer <token>` header for all subsequent API requests.

### Q7.2 (Intermediate): How does BCrypt protect user passwords?
**Answer**:
Passwords are never stored in plaintext. `BCryptPasswordEncoder` hashes passwords using an adaptive salt and key derivation function. It generates a random 128-bit salt for each password and performs $2^{10}$ (1,024) hashing iterations. Because the salt is unique per password, two users with identical passwords will have completely different stored hashes, rendering precomputed rainbow table attacks impossible.

### Q7.3 (Advanced): How does `JwtAuthenticationFilter` validate requests statelessly?
**Answer**:
Located at `com.claimora.security.JwtAuthenticationFilter`:
1. Intercepts incoming requests via `doFilterInternal()`.
2. Inspects the `Authorization` header for prefix `Bearer `.
3. Uses `JwtService` to parse the token using the secret key (`Keys.hmacShaKeyFor(secretBytes)`). If the signature is invalid or the token has expired, it allows the filter chain to proceed without populating the security context, resulting in a **401 Unauthorized** response from `RestAuthenticationEntryPoint`.
4. If valid, extracts the username and loads `CustomUserDetails` via `CustomUserDetailsService`.
5. Instantiates a `UsernamePasswordAuthenticationToken` containing authorities (`ROLE_ADMIN`, `ROLE_INVESTIGATOR`, `ROLE_STAFF`) and places it in `SecurityContextHolder.getContext().setAuthentication(auth)`.
6. Downstream controllers can immediately inspect the user principal via `@AuthenticationPrincipal CustomUserDetails`.

### Q7.4 (Advanced): How does Claimora enforce Role-Based Access Control (RBAC)?
**Answer**:
RBAC is enforced declaratively using Spring Security's `@EnableMethodSecurity(prePostEnabled = true)` and method annotations:
- `@PreAuthorize("hasRole('ADMIN')")`: Restricted to administrators (e.g., creating users in `UserController`, assigning investigators in `FindingController`).
- `@PreAuthorize("hasAnyRole('ADMIN', 'INVESTIGATOR')")`: Restricted to forensic staff (e.g., resolving findings, recording investigation actions).
- `@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")`: Restricted to claims staff (e.g., submitting new claims, uploading evidence).
- Inactive users are blocked at login: if `user.getStatus() == UserStatus.INACTIVE`, the login returns **HTTP 403 Forbidden** with `"Account is inactive. Please contact your system administrator."`.

---

## 8. Category 7: Fraud Detection Rules Engine & Composite Scoring Algorithms

### Q8.1 (Basic): How is the fraud risk score calculated?
**Answer**:
The composite score is calculated as the sum of severity weights of all active findings associated with a claim, bounded between 0 and 100:

$$\text{Composite Score} = \min\left(100, \sum_{r \in \text{Active Findings}} \text{Weight}(r)\right)$$

The numerical score maps to four qualitative risk tiers:
- **`CRITICAL` Risk**: $\text{Score} \ge 80$
- **`HIGH` Risk**: $50 \le \text{Score} < 80$
- **`MEDIUM` Risk**: $25 \le \text{Score} < 50$
- **`LOW` Risk**: $\text{Score} < 25$

### Q8.2 (Intermediate): What are the severity weights of the six rules?
**Answer**:
1. `DUPLICATE_INVOICE`: Weight **50** (Severity: `HIGH`)
2. `DATE_CONFLICT`: Weight **50** (Severity: `HIGH`)
3. `SERIAL_REUSE`: Weight **45** (Severity: `HIGH`)
4. `DUPLICATE_PHOTO`: Weight **40** (Severity: `HIGH`)
5. `INVOICE_MISMATCH`: Weight **30** (Severity: `MEDIUM`)
6. `REPAIR_PARTS_MISMATCH`: Weight **25** (Severity: `MEDIUM`)

### Q8.3 (Advanced): How does the rules engine guarantee idempotency?
**Answer**:
If an investigator clicks "Run Fraud Analysis" multiple times on the same claim, Claimora must not create duplicate findings. In `AnalysisService.java`:
```java
Optional<Finding> existingFindingOpt = findingRepository.findByClaim_ClaimId(claimId).stream()
        .filter(f -> f.getRuleCode().equals(draft.getRuleCode()))
        .findFirst();

if (existingFindingOpt.isPresent()) {
    targetFinding = existingFindingOpt.get();
    log.info("Finding for rule {} already exists on claim {} with status {}. Preserving state.",
            draft.getRuleCode(), claimId, targetFinding.getStatus());
} else {
    // Create new finding
    targetFinding = findingRepository.saveAndFlush(newFinding);
}
```
If a finding already exists—even if an investigator previously marked it `UNDER_INVESTIGATION`, `RESOLVED`, or `DISMISSED`—the service preserves the human decision and does not overwrite or duplicate the finding.

---

## 9. Category 8: Digital Forensics, Document Storage & OCR Pipeline

### Q9.1 (Basic): How are files stored, and why are they not stored directly in the database?
**Answer**:
Files are stored on the local protected filesystem in `./storage/uploads`. Only metadata (filename, MIME type, file size, SHA-256 hash, and OCR JSON) is stored in the PostgreSQL `evidence_document` table. Storing large binary BLOBs inside PostgreSQL leads to database bloat, degrades buffer cache performance, and complicates database backups.

### Q9.2 (Intermediate): How does SHA-256 hashing uncover warranty fraud?
**Answer**:
When an evidence document (invoice, repair report, or photo) is uploaded, `DocumentStorageService` calculates its 256-bit cryptographic digest. If a fraudster renames a receipt file (e.g., from `invoice_dell.pdf` to `my_receipt.pdf`) and submits it in an unrelated claim, the file contents remain identical. Because SHA-256 is deterministic and collision-resistant, the computed digest matches the existing database record. `DuplicateInvoiceRule` or `DuplicatePhotoRule` immediately flags the duplicate file across distinct claims.

### Q9.3 (Advanced): Explain the OCR extraction architecture and fallback mechanisms.
**Answer**:
In `com.claimora.ocr.OcrServiceImpl`:
1. **PDF Text Stripping**: For PDF files, Apache PDFBox (`PDFTextStripper`) extracts embedded vector text streams quickly without OCR overhead.
2. **Image OCR**: For image files (PNG, JPG, TIFF), Tess4J initializes Tesseract OCR to perform optical character recognition.
3. **Structured Field Parsing**: Regular expressions extract invoice numbers (`INV-...`), serial numbers (`SN-...`), purchase dates, and monetary amounts into a JSON payload stored in `evidence_document.extracted_data`.
4. **Resilience & Fallback**: If native Tesseract C++ binaries are missing on the host or a scanned image is illegible, `OcrServiceImpl` catches the exception gracefully, logs a warning, and returns `OcrResult.empty("FAILED")`. The file upload and SHA-256 hashing succeed without crashing the application. Reviewers can later manually input extracted values via `PUT /api/documents/{id}/extracted-data`.

---

## 10. Category 9: Append-Only Audit Trail & State Machine Immutability

### Q10.1 (Basic): What is an append-only audit trail?
**Answer**:
An append-only audit trail is a historical logging system where records can only be created—never updated or deleted. Every change in status, investigator note, or data correction is recorded as a new chronological entry in `investigation_action`. This guarantees a legally defensible chain of custody.

### Q10.2 (Intermediate): What are the valid state machine transitions for a finding?
**Answer**:
- `OPEN` &rarr; `UNDER_INVESTIGATION` (Investigator begins inquiry)
- `OPEN` &rarr; `DISMISSED` (False positive identified during initial triage)
- `UNDER_INVESTIGATION` &rarr; `RESOLVED` (Confirmed fraud resolved / payment stopped)
- `UNDER_INVESTIGATION` &rarr; `DISMISSED` (Inconsistency resolved with valid claimant explanation)
- `RESOLVED` &rarr; `OPEN` (Reopened due to new incoming evidence)
- `DISMISSED` &rarr; `OPEN` (Reopened due to new conflicting evidence)

### Q10.3 (Advanced): How does Claimora technically enforce that audit records cannot be modified or deleted?
**Answer**:
1. **Controller Layer Rejection**: In `com.claimora.controller.InvestigationActionController`:
   ```java
   @PutMapping("/{id}")
   public ResponseEntity<Void> updateActionForbidden(@PathVariable("id") Long id) {
       throw new ResponseStatusException(
               HttpStatus.METHOD_NOT_ALLOWED,
               "Investigation actions are strictly append-only audit records and cannot be modified."
       );
   }

   @DeleteMapping("/{id}")
   public ResponseEntity<Void> deleteActionForbidden(@PathVariable("id") Long id) {
       throw new ResponseStatusException(
               HttpStatus.METHOD_NOT_ALLOWED,
               "Investigation actions are strictly append-only audit records and cannot be deleted."
       );
   }
   ```
2. **Database Integrity**: Foreign key constraints enforce `ON DELETE RESTRICT` on user references.
3. **Mandatory Explanations**: In `InvestigationActionService.java`, any action submitted without a substantive justification throws a `ValidationException` (HTTP 400).

---

## 11. Category 10: Performance Optimization, Database Tuning & Scalability

### Q11.1 (Basic): How is database connection pooling configured?
**Answer**:
Claimora uses **HikariCP**, the high-performance JDBC connection pool. In `application.properties`:
- `maximum-pool-size=10`: Caps active database connections to avoid exhausting PostgreSQL server memory.
- `minimum-idle=2`: Keeps 2 warm connections available for immediate query execution.
- `max-lifetime=240000` (4 minutes): Recycles idle connections before cloud firewalls or session poolers drop them.
- `connection-timeout=30000` (30 seconds): Fails gracefully if no connections are available.

### Q11.2 (Intermediate): What database indexes were created, and what queries do they optimize?
**Answer**:
- `idx_evidence_file_hash` on `evidence_document(file_hash)`: Optimizes cross-claim duplicate checking from an $O(N)$ full table scan to an $O(\log N)$ index lookup.
- `idx_product_serial` on `product(serial_number)`: Optimizes product lookup during claim registration.
- `idx_claim_number` on `claim(claim_number)`: Optimizes business claim number lookups.
- `idx_finding_claim_id` on `finding(claim_id)`: Speeds up finding retrieval during claim analysis.
- `idx_action_finding_id` on `investigation_action(finding_id)`: Accelerates chronological audit trail loading.

### Q11.3 (Advanced): How does Claimora prevent the JPA N+1 query problem?
**Answer**:
The N+1 problem occurs when querying parent entities executes 1 query for the parents followed by $N$ separate queries to fetch lazily loaded child entities. Claimora prevents this by:
1. Setting `spring.jpa.open-in-view=false` to prevent hidden database calls in the presentation layer.
2. Using custom JPQL queries with `JOIN FETCH` (e.g., fetching a claim together with its product and user).
3. Utilizing DTO projections so only required fields are retrieved from the database.

---

## 12. Category 11: AI Integration Reality, Explainability & Future Roadmap

### Q12.1 (Basic): Does Claimora use an AI or Machine Learning model in v1?
**Answer**:
**No, Claimora v1 deliberately does not use a black-box machine learning model.** It uses deterministic, rule-based forensic heuristics combined with optical character recognition (OCR) and cryptographic hashing.

### Q12.2 (Intermediate): Why are deterministic rules superior to black-box AI for fraud adjudication?
**Answer**:
1. **Legal Defensibility**: When a warranty claim is denied or investigated for fraud, the manufacturer must provide verifiable evidentiary proof (e.g., *"Invoice INV-101 was already claimed on January 10 for serial SN-001"*). A statistical probability from a neural network (e.g., *"87.4% fraud probability"*) is legally indefensible in court or customer arbitration.
2. **Zero Hallucinations**: Rule engines evaluate deterministic logic against ground-truth data, eliminating the risk of generative hallucinations.
3. **Audit Reproducibility**: Given identical input data, a deterministic rule engine produces identical findings every single time.

### Q12.3 (Advanced): What is perceptual hashing, and what is the v2 AI roadmap?
**Answer**:
- **Limitation of SHA-256**: SHA-256 detects exact byte-for-byte duplicates. If a fraudster crops, resizes, or recompresses an image, the SHA-256 hash changes completely.
- **Planned v2 Perceptual Hashing (pHash)**: Converts images into frequency representations (Discrete Cosine Transform). Images that look visually similar have low Hamming distances between their perceptual hashes, allowing near-duplicate detection.
- **Planned v2 LLM Summarization**: Utilizing Large Language Models via API to generate natural language investigation executive summaries for enterprise risk directors based on the structured audit trail.

---

## 13. Category 12: Individual Team Member Ownership & Contribution Defense

Each team member must be prepared to defend their specific entity and full-stack contributions:

### 13.1 Vidhi – User Entity, Authentication & Spring Security
- **Assigned Entity**: `User` (Table: `users`)
- **Key Files**: `User.java`, `UserRepository.java`, `UserService.java`, `UserController.java`, `SecurityConfig.java`, `JwtService.java`, `CustomUserDetails.java`.
- **Expected Evaluator Questions for Vidhi**:
  - *Q: Why is the table named `users` instead of `user`?*  
    **A**: In PostgreSQL, `USER` is a reserved SQL keyword. Naming the table `users` avoids SQL syntax collisions.
  - *Q: How do you prevent an inactive user from logging in?*  
    **A**: In `AuthService.login()`, after validating the password hash, we check `user.getStatus() == UserStatus.INACTIVE`. If inactive, we throw a `ResponseStatusException(HttpStatus.FORBIDDEN)` with an explicit message.
  - *Q: How does the admin user get created initially?*  
    **A**: In `DataInitializer.java`, the system checks `userRepository.findByRole(Role.ADMIN)`. If no admin exists, it seeds `admin@claimora.internal` using BCrypt password hashing.

### 13.2 Shaili – Product Entity & Warranty Catalog
- **Assigned Entity**: `Product` (Table: `product`)
- **Key Files**: `Product.java`, `ProductRepository.java`, `ProductService.java`, `ProductController.java`.
- **Expected Evaluator Questions for Shaili**:
  - *Q: How do you enforce that a product's warranty end date is after its start date?*  
    **A**: At the database level, `schema.sql` defines `CONSTRAINT chk_warranty_end_ge_start CHECK (warranty_end >= warranty_start)`. At the application level, `ProductService.java` verifies that `warrantyEnd` is not before `warrantyStart` and throws a `ValidationException` (HTTP 400).
  - *Q: What happens if someone tries to register a product with a duplicate serial number?*  
    **A**: `product.serial_number` has a unique constraint. `ProductService` checks `productRepository.existsBySerialNumber(serial)` before saving. If it exists, it throws a `ValidationException("Serial number already registered")`.

### 13.3 Tanishka – Claim Entity & Claims Intake
- **Assigned Entity**: `Claim` (Table: `claim`)
- **Key Files**: `Claim.java`, `ClaimRepository.java`, `ClaimService.java`, `ClaimController.java`.
- **Expected Evaluator Questions for Tanishka**:
  - *Q: How are claim numbers generated?*  
    **A**: In `ClaimService.java`, claim numbers are generated using the business pattern `CLM-YYYY-XXXXXX` (e.g., `CLM-2026-000102`), where `YYYY` is the current calendar year and `XXXXXX` is a zero-padded sequential or unique ID.
  - *Q: What are the valid claim statuses, and how does a claim become FLAGGED?*  
    **A**: Claim statuses are `SUBMITTED`, `UNDER_REVIEW`, `FLAGGED`, and `RESOLVED`. When `AnalysisService` runs and identifies active findings, it automatically updates the claim status to `FLAGGED`.

### 13.4 Kalp – EvidenceDocument Entity, Storage & OCR
- **Assigned Entity**: `EvidenceDocument` (Table: `evidence_document`)
- **Key Files**: `EvidenceDocument.java`, `EvidenceDocumentRepository.java`, `EvidenceDocumentService.java`, `DocumentStorageService.java`, `OcrServiceImpl.java`.
- **Expected Evaluator Questions for Kalp**:
  - *Q: How do you protect against path traversal attacks during file uploads?*  
    **A**: In `DocumentStorageService.resolvePath()`, we strip leading slashes and redundant prefixes, resolve against `this.rootStoragePath`, and call `.normalize()`. We then verify `resolved.startsWith(this.rootStoragePath)`. If someone uploads a filename containing `../../etc/passwd`, it throws a `SecurityException`.
  - *Q: What happens if OCR fails on a blurry photo?*  
    **A**: `OcrServiceImpl` catches any extraction exception, logs a warning, and returns `OcrResult.empty("FAILED")`. The upload succeeds with `ocr_status = 'FAILED'`, and the reviewer can manually enter extracted data later.

### 13.5 Chinmay – Finding Entity, Rules Engine & Scoring
- **Assigned Entity**: `Finding` (Table: `finding`)
- **Key Files**: `Finding.java`, `FindingRepository.java`, `FindingService.java`, `FindingController.java`, `AnalysisService.java`, `AnalysisRule.java`, all rules in `rules/*`.
- **Expected Evaluator Questions for Chinmay**:
  - *Q: How does `AnalysisService` discover new rules without code changes?*  
    **A**: By implementing the `AnalysisRule` interface and annotating rule classes with `@Component`. Spring automatically detects all implementations and injects them into `AnalysisService(List<AnalysisRule> rules)`.
  - *Q: How does the Visual Evidence Graph receive its data?*  
    **A**: `FindingResponse` includes a nested list `linkedDocuments` of type `EvidenceLinkResponse`. Each item contains the document ID, filename, SHA-256 hash, and the directional `evidenceRole` (`CONFLICTING_VALUE`, `DUPLICATE_OF`, `SUPPORTING_EVIDENCE`).

### 13.6 Anuj – InvestigationAction Entity & Audit Trail
- **Assigned Entity**: `InvestigationAction` (Table: `investigation_action`)
- **Key Files**: `InvestigationAction.java`, `InvestigationActionRepository.java`, `InvestigationActionService.java`, `InvestigationActionController.java`.
- **Expected Evaluator Questions for Anuj**:
  - *Q: Why does modifying an investigation action return HTTP 405 Method Not Allowed?*  
    **A**: Investigation actions form a legal chain of custody. Allowing `PUT`, `PATCH`, or `DELETE` would allow corrupt reviewers to alter audit history. In `InvestigationActionController`, these methods are mapped to throw `ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED)`.
  - *Q: Can a resolved finding be reopened?*  
    **A**: Yes. An investigator can submit an action with `actionType: "REOPEN"`, which transitions the finding back to `OPEN`. However, the earlier `RESOLVED` action and its explanation remain permanently in the history.

---

## 14. Step-by-Step Live Demonstration Script (UI, Swagger & Postman)

Follow this exact demonstration script during your evaluation:

```
[Demo Step 1: Health Check] 
         │
         ▼
[Demo Step 2: Login as Admin]
         │
         ▼
[Demo Step 3: Product Catalog & Warranty Validation]
         │
         ▼
[Demo Step 4: Claim Intake & Evidence Ingestion]
         │
         ▼
[Demo Step 5: Run Fraud Analysis (Dell XPS 15)]
         │
         ▼
[Demo Step 6: Interactive Visual Evidence Graph]
         │
         ▼
[Demo Step 7: Append-Only Audit Action & HTTP 405 Proof]
         │
         ▼
[Demo Step 8: Swagger UI & Automated Postman Tests]
```

### Step 1: Health Check & System Verification
1. Open your browser to `http://localhost:8080/api/health`.
2. Show the evaluator the live health check response:
   ```json
   {
     "status": "UP",
     "timestamp": "...",
     "service": "Claimora Backend",
     "database": "CONNECTED"
   }
   ```

### Step 2: Secure Authentication & RBAC Demonstration
1. Open the Angular Web App at `http://localhost:4200` (or `http://localhost`).
2. Demonstrate logging in with the pre-seeded credentials:
   - **Admin**: `admin@claimora.internal` / `AdminPass123!`
   - **Investigator**: `alex.investigator@claimora.internal` / `InvestigatorPass123!`
   - **Staff**: `staff@claimora.internal` / `StaffPass123!`
3. Show that logging in as Staff hides the "User Management" navigation item, demonstrating client-side route guards (`roleGuard`) and backend `@PreAuthorize("hasRole('ADMIN')")`.

### Step 3: Product Catalog & Warranty Constraints
1. Navigate to **Products**.
2. Show registered electronics:
   - *Dell XPS 15 9530* (`SN-DELL-XPS15-001`, Purchase: `2025-01-10`, Warranty: `2025-01-10` to `2026-01-10`).
   - *iPhone 15 Pro* (`SN-APPLE-IPHONE15-001`, Purchase: `2024-06-01`, Warranty: `2024-06-01` to `2025-06-01` &rarr; Expired).
3. Attempt to register a product where `warranty_end` is before `warranty_start`. Show the validation error.

### Step 4: Claims Intake & Evidence Ingestion
1. Navigate to **All Claims**.
2. Show Claim **#2** (`CLM-2026-000102`) for the Dell XPS 15 9530.
3. Open **Evidence Explorer** and show the uploaded document `invoice_duplicate_scan.pdf`.
4. Point out the computed **SHA-256 hash** (`e3b0c442...`) and the extracted JSON fields (`INV-2025-00101`, amount `$1899.99`).

### Step 5: Triggering Fraud Analysis (The Core Feature)
1. In the Claims list, locate Claim **#2** (*Dell XPS 15 9530*).
2. Click the **"⚡ Run Fraud Analysis"** button.
3. Point out the instantaneous analysis result:
   - **Claim Status**: Automatically transitioned to **`FLAGGED`**.
   - **Risk Score**: **`80`** (**`CRITICAL`**).
   - **Triggered Rules**: `DUPLICATE_INVOICE` and `SERIAL_REUSE`.

### Step 6: Interactive Visual Evidence Graph Walkthrough
1. Navigate to **Findings** and click on Finding **#5** (`DUPLICATE_INVOICE`).
2. Click **"View Evidence Graph"**.
3. Point out the interactive visual nodes:
   - **Central Node**: Finding #5 (`DUPLICATE_INVOICE`, High Severity).
   - **Branch 1 (Rose Badge)**: `CONFLICTING_VALUE` linked to Document #2 (`invoice_duplicate_scan.pdf` in Claim #2).
   - **Branch 2 (Purple Badge)**: `DUPLICATE_OF` linked to Document #1 (`invoice_dell_official.pdf` in Claim #1).
4. Explain to the evaluator: *"The graph proves immediately that Claim #2 submitted the exact same invoice number and SHA-256 file hash that was already submitted in Claim #1."*

### Step 7: Append-Only Audit Trail & HTTP 405 Immutability Proof
1. In the Finding modal, click **"Record Action & Transition Status"**.
2. Select **`STATUS_CHANGE`** &rarr; Target: **`UNDER_INVESTIGATION`**.
3. Enter the explanation: *"Claimant contacted regarding duplicate invoice. Awaiting physical store receipt."*
4. Click **Commit Action**. Show that the action immediately appears in the chronological timeline.
5. **The Immutability Proof**: Open terminal or Postman and execute a `PUT` or `DELETE` request against that action:
   ```bash
   curl -X DELETE http://localhost:8080/api/investigations/1 -H "Authorization: Bearer <token>"
   ```
6. Show the response: **`405 Method Not Allowed`** with message:  
   *"Investigation actions are strictly append-only audit records and cannot be deleted."*

### Step 8: Swagger UI & Automated Postman Verification
1. Navigate to `http://localhost:8080/swagger-ui.html`.
2. Demonstrate the interactive OpenAPI 3.0 documentation. Click on `POST /api/auth/login`, click "Try It Out", execute, and show the returned JWT.
3. Highlight that all 61 automated JUnit 5 tests pass with 0 failures (`.\mvnw.cmd test`).

---

## 15. Evaluator "Gotcha" Questions & Bulletproof Answers

### Q15.1: "What if a user simply takes a screenshot or slightly crops a duplicate invoice? Your SHA-256 hash won't match!"
**Bulletproof Answer**:
> *"You are completely correct regarding the SHA-256 hash alone. However, Claimora uses a multi-layered defense. While a cropped image changes the binary SHA-256 hash, our OCR pipeline still extracts the textual invoice number (`INV-2025-00101`). `DuplicateInvoiceRule` checks both criteria: it flags a duplicate if either the file hash matches OR the extracted invoice number matches an existing claim. Furthermore, perceptual image hashing (pHash) for near-duplicate image detection is already designed and slated for our v2 roadmap."*

### Q15.2: "Can an Admin delete a finding that was raised in error?"
**Bulletproof Answer**:
> *"No, by design. Even an Admin cannot delete a finding. If a finding is determined to be a false positive, the investigator or admin must record a `DISMISS` action with a mandatory written justification explaining why it was dismissed. The finding status changes to `DISMISSED`, but the history remains permanently in the database. This ensures complete transparency and prevents insider fraud."*

### Q15.3: "Why not use a dedicated graph database like Neo4j if you have an Evidence Graph?"
**Bulletproof Answer**:
> *"We evaluated Neo4j during system design. For our enterprise scope, introducing a separate graph database cluster would introduce substantial operational complexity, dual-write synchronization issues, and increased hosting overhead. By modeling the graph relationally using our `evidence_link` join table with directional roles (`CONFLICTING_VALUE`, `DUPLICATE_OF`, `SUPPORTING_EVIDENCE`), we achieve graph-like traversals with sub-millisecond SQL performance within PostgreSQL, keeping our architecture cohesive and maintainable."*

### Q15.4: "Why does the backend use `saveAndFlush()` instead of standard Spring Data `save()` in `AnalysisService`?"
**Bulletproof Answer**:
> *"Standard Spring Data `save()` delegates to Hibernate's lazy flush mechanism, deferring database inserts until transaction commit time. However, in our analysis workflow, we construct composite primary keys (`EvidenceLinkId`) that immediately require the generated `findingId`. Calling `saveAndFlush()` forces Hibernate to execute the SQL insert immediately and populate the entity ID before we construct downstream relationships, preventing Hibernate dirty-session assertion failures."*

### Q15.5: "What prevents a malicious user from guessing claim IDs and viewing other people's evidence?"
**Bulletproof Answer**:
> *"Claimora implements two layers of authorization: first, URL endpoints require valid JWT authentication. Second, in `AnalysisService` and `EvidenceDocumentService`, we enforce principal ownership validation: if the authenticated user has role `STAFF`, the service verifies that `claim.getUser().getUserId().equals(userDetails.getUserId())`. Any attempt to access another user's claim throws a Spring Security `AccessDeniedException` (HTTP 403 Forbidden)."*

---
*End of Evaluator Q&A Handbook. All team members should study their respective sections and rehearse the live demonstration script.*

