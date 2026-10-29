## Claimora

Project Proposal & System Design An Evidence-Centric Warranty Claims Investigation

and Fraud-Risk Analysis Platform

## “Every alert has evidence. Every correction has a history. Every resolution has a reason.”

| Document type | Team reference document: project proposal, system design and development plan |
| --- | --- |
| Project name | Claimora (earlier working names: ClaimTrace, Proofline) |
| Stack | Angular + TypeScript, Java Spring Boot, PostgreSQL, OCR, image hashing, rule-based analysis |
| Audience | Project team members, mentors and viva reviewers |


## Contents

How to use this document. Sections 1-8 explain what Claimora is and how the whole system fits together. Sections 9-11 are the database and analysis design (the part everyone must agree on before coding). Sections 12-15 cover the folder structure, modules, team work division and proposed APIs. Sections 16-20 cover case studies, evaluation, development order and testing. Section 21 lists open decisions the team still has to settle. Items marked (suggested) are proposals to discuss, not final decisions.


## 1. Project overview

Claimora is a web-based platform that helps electronics manufacturers and warranty investigation teams identify suspicious warranty claims by connecting information from invoices, product serial numbers, repair records, parts invoices, and photographs. The platform lets company users log in, manage warranty claims, upload evidence, investigate potential inconsistencies, and record final decisions.

Instead of simply displaying a fraud-risk score, Claimora explains what appears inconsistent, which documents support the finding, and how the reviewer can investigate and resolve it.

| Item | Detail |
| --- | --- |
| Domain | Electronics warranty management and fraud-risk analysis |
| Target users | Warranty reviewers, service-centre auditors, and investigation managers |
| Frontend | Angular + TypeScript |
| Backend | Java + Spring Boot REST APIs |
| Database | PostgreSQL, accessed through Spring Data JPA + Hibernate |
| Supporting technology | OCR, image hashing, rule-based analysis, and an evidence relationship graph |

Important principle. A finding indicates something worth investigating; it does not automatically prove fraud. Claimora supports human investigation. It never automatically declares a customer fraudulent or rejects a claim. Final decisions always stay with a human reviewer.

## 1.1 What the website does, in one view

- Lets company users log in securely with role-based access (Admin / Manager, Investigator, Claims Staff).

- Lets staff register and manage warranty claims against products identified by serial number.

- Lets staff upload evidence (invoices, repair reports, product photographs) and view the fields extracted from them.

- Runs consistency checks across documents and across related claims and raises findings.

- Shows each finding with its reason, the supporting documents, and the rule that triggered it.

- Lets reviewers investigate, add explanations, correct data, and record a resolution without losing history.

- Provides a dashboard, investigation history, and summary reports.


## 2. Problem statement

Warranty claims often contain information spread across invoices, product records, service reports, repair histories, and photographs. Reviewing each document separately can make it difficult to identify:

- duplicate invoices,

- reused photographs,

- conflicting dates,

- repeated serial numbers, or

- inconsistencies between requested repairs and parts records.

Although existing systems provide claim processing and fraud-detection capabilities, investigators still need reliable ways to verify alerts, connect supporting evidence, correct extraction errors, and record why a finding was resolved.

Proposed solution. Claimora will provide cross-document consistency checks, evidence-linked explanations, relationships between claims, and a resolution-aware audit history. It will support human investigation rather than automatically declaring a customer fraudulent or rejecting a claim.

## 3. Core features and proposed innovation

## 3.1 Evidence relationship graph

Connect claims, products, invoices, service centres, repair records, and photographs. Show how different records are related and why an alert was generated. For example, two claims that share an invoice reference are drawn as two claim nodes joined to one invoice node, so the reviewer sees the connection immediately instead of searching for it.

## 3.2 Explainable inconsistency detection

Identify duplicate invoice references, serial-number reuse, conflicting repair dates, and similar photographs. Every finding should link to its source evidence and the rule that triggered it. A reviewer should never see an unexplained score; they should see the rule, the conflicting values, and the documents.

## 3.3 Resolution-aware evidence history

Preserve original extracted values, reviewer corrections, new evidence, and earlier findings. Show how the investigation changes when new information arrives. Nothing is silently overwritten: a correction adds a record and keeps the earlier one.

These are our proposed differentiators as a combined workflow, not claims that competing products lack these individual capabilities. Avoid claiming that no existing platform performs fraud detection.

## 3.4 The three technical contributions


| Contribution | Meaning |
| --- | --- |
| Cross-document consistency | Compares invoice details, serial numbers, amounts, and dates across related |
| checking | claims. |
| Evidence traceability | Each finding links directly to the documents and fields that triggered it. |
| Correction-aware audit history | Preserves reviewer explanations and status changes rather than silently |
|   | overwriting investigation decisions. |

Together these form Claimora's proposed contribution.

## 4. USP – Unique Selling Proposition

## “Every alert has evidence. Every correction has a history. Every resolution has a reason.”

Claimora's USP is that it connects three stages into one investigation workflow:

| Stage | What Claimora provides |
| --- | --- |
| Detection | Finds possible inconsistencies across multiple records |
| Explanation | Shows conflicting values, source documents, and validation rules |
| Resolution | Tracks new evidence, corrections, reviewer decisions, and outcomes |

## Worked example

If two claims use the same invoice reference, Claimora highlights both records, shows the invoice evidence, and lets the reviewer investigate whether the reuse is legitimate. If new evidence explains the match, the finding can be resolved without deleting its history.

This is more specific and defensible than claiming that Claimora detects fraud better than every existing product. In the viva, position it as a focused, explainable, traceable workflow.

## 5. How the whole website will look (user journey)

The user journey runs through six areas. Each is described with what it contains.

| # | Page | What the user sees and does |
| --- | --- | --- |
| 1 | Login page | Email and password fields, forgot password, and secure login. Inactive accounts |
|   |   | cannot sign in. |
| 2 | Dashboard | Total claims, pending reviews, open findings, and resolved claims. Content depends |
|   |   | on role (see section 6). |
| 3 | Claims management | Search claims, register a new claim, filter by status, and open the claim details page. |
| 4 | Evidence Explorer | Upload invoices, repair reports, and product photographs; view the fields extracted |
|   |   | from each document. |
| 5 | Findings and investigation | Shows the inconsistency, its reason, the supporting documents, and the reviewer |
|   |   | actions taken. |
| 6 | Investigation history and | Tracks status changes, explanations, final decisions, and summary reports. |
|   | reports |   |


## 5.1 Suggested navigation menu

| Menu item | Purpose |
| --- | --- |
| Dashboard | Landing page with counters and recent activity |
| Products | Register and view electronic products with serial numbers and warranty dates |
| All Claims | Claim list, search, filters, create claim, claim details |
| Evidence Explorer | Browse uploaded documents, view extracted fields and file details |
| Findings | List of findings with severity and status; open one to investigate |
| Investigation History | Timeline of reviewer actions and status changes |
| Reports | Summary reports (company-wide or assigned cases, depending on role) |
| User Management (Admin only) | Create users, assign roles, activate or deactivate accounts |
| Profile & Settings | Own profile, password change and preferences |

## 5.2 Recommended dashboard pages

Overview, All Claims, Claim Details, Evidence Explorer, Findings, Investigation History, and Reports.

## 6. What each role sees

| Feature | Admin / Manager | Investigator | Claims Staff |
| --- | --- | --- | --- |
| Dashboard | All-company overview | Assigned investigations | Claims they manage |
| Create claims | Yes | If permitted | Yes |
| Upload evidence | Yes | Yes | Yes |
| Review findings | All findings | Assigned findings | Limited or view-only |
| Resolve findings | Yes, by permission | Yes, by permission | Usually no |
| Manage users | Yes | No | No |
| Reports | All-company reports | Assigned cases | Limited reports |

These are proposed permissions. Enforce them in Spring Boot, not just in the user interface.

## 6.1 How to enforce roles properly (suggested)

- Store the role on the user and load it into Spring Security at login; protect each endpoint with role checks (for example method-level security annotations such as @PreAuthorize).

- Hide menu items in Angular for usability, and also use Angular route guards, but treat these only as convenience. The backend must reject forbidden calls even if someone crafts the request manually.

- Apply data-level filtering in queries: an Investigator should only receive findings assigned to them; Claims Staff should only receive claims they manage.

- Hash passwords with a strong algorithm (for example BCrypt); never store or log plain passwords. The password_hash field is the only password field in the database.

- Return the same generic error for a wrong email or wrong password, and block inactive accounts.

- Record who did what: every reviewer action stores the acting user.


Design gap to decide (see section 21). The permission table talks about assigned investigations and findings, but the current ER diagram has no assignment field. To support “assigned to me” filtering we need something like an assigned_to (user_id foreign key) on Finding or Claim.

## 7. Proposed system architecture

Claimora is a layered full-stack application. Each layer has one responsibility.

Uploaded files live in protected file/object storage. PostgreSQL stores only their paths and metadata (path, hash, type, extracted fields), never the file bytes.

## 7.1 How it works (end to end)

- 1 The reviewer uploads a claim and supporting documents through Angular.

- 2 Angular sends the data to Spring Boot using HTTP REST APIs.

- 3 Spring Boot stores claim information and document metadata in PostgreSQL.

- 4 OCR extracts text and fields from supported documents.

- 5 The analysis engine checks for inconsistencies and creates evidence-linked findings.

- 6 The reviewer investigates the findings and records a resolution.

- 7 The system saves the changes and audit history for future review.

Angular provides the frontend HTTP client, while Spring supports REST services and database integration.


## 8. Technology stack

| Technology | Purpose in Claimora |
| --- | --- |
| Angular + TypeScript | Responsive dashboard, forms, tables, file-upload interface, evidence viewer, timeline, |
|   | navigation. Sends HTTP requests to backend APIs. |
| HTML + CSS | Page structure and visual styling |
| Java + Spring Boot | Login, business logic, REST APIs, validation, file uploads, claim management, findings, |
|   | security |
| Spring Security | Protects restricted operations; role-based permissions |
| Spring Data JPA + Hibernate | Database entities, repositories and queries |
| PostgreSQL | Structured claim data, document metadata, findings, evidence links and audit records |
| OCR library/service | Extract dates, invoice numbers, serial numbers, and amounts from documents |
| Image hashing | Identify exact duplicate photographs and files (image similarity can be added later) |
| Git + GitHub | Version control and collaboration |
| Postman | Test APIs during development |

For the first version, use a rule-based engine rather than starting with a complex AI model. Add OCR and image comparison after the basic claim workflow works. Store the actual uploaded files in file storage and keep their metadata and references in PostgreSQL.

## 9. Database design

The database plan has 7 tables: 6 main entities plus 1 relationship table: User, Product, Claim, EvidenceDocument, Finding, InvestigationAction, and EvidenceLink. The schema is designed for PostgreSQL. It can be created in pgAdmin, MySQL Workbench, or a diagram tool such as draw.io.

## 9.1 What each table does

| Table | Simple meaning |
| --- | --- |
| USER | Stores login accounts, roles, and account status. |
| PRODUCT | Stores the electronic device and warranty details. |
| CLAIM | Stores a customer's warranty request. |
| EVIDENCE_DOCUMENT | Stores uploaded invoice, repair report, and photo metadata. |
| FINDING | Stores possible inconsistencies detected by the system. |
| INVESTIGATION_ACTION | Stores what a reviewer did and why. |
| EVIDENCE_LINK | Connects a finding to the documents supporting it. |

EvidenceLink is a relationship table. It allows one finding to reference multiple documents and one document to support multiple findings.


## 9.2 Relationships

| Relationship | Cardinality | Meaning |
| --- | --- | --- |
| PRODUCT to CLAIM | One to many | One product can have many claims over time. |
| USER to CLAIM | One to many | One user registers or manages many claims. |
| CLAIM to EVIDENCE_DOCUMENT | One to many | One claim has many uploaded documents. |
| CLAIM to FINDING | One to many | One claim can raise many findings. |
| FINDING to INVESTIGATION_ACTION | One to many | One finding has a history of reviewer actions. |
| USER to INVESTIGATION_ACTION | One to many | One reviewer performs many actions. |
| FINDING to EVIDENCE_LINK | One to many | One finding links to several documents. |
| EVIDENCE_DOCUMENT to | One to many | One document can support several findings. |
| EVIDENCE_LINK |   |   |
| FINDING and EVIDENCE_DOCUMENT | Many to many | Resolved by the link table with a composite primary |
| (through EVIDENCE_LINK) |   | key. |


## 9.3 ER diagram

*Figure 1: Claimora entity-relationship diagram (7 tables)*


## 9.4 Field-level design

Types follow PostgreSQL naming. PK = primary key, FK = foreign key, UK = unique key. Fields from the ER diagram are listed first; fields marked (suggested) come from the project plan or are recommended and are not yet in the diagram.

*USER*

| Field | Type | Key | Description |
| --- | --- | --- | --- |
| user_id | bigint | PK | Unique id of the account. |
| name | varchar |   | Full name. |
| email | varchar | UK | Login identifier; must be unique. |
| password_hash | varchar |   | Hashed password only (for example BCrypt). Never the plain password. |
| role | varchar |   | Access role, for example ADMIN, INVESTIGATOR, STAFF (as in the team |
|   |   |   | plan; Manager maps to ADMIN). |
| status | varchar |   | Account status, for example ACTIVE or INACTIVE (suggested values). |

PostgreSQL tip. user is a reserved word in PostgreSQL. Name the physical table something like users or app_user (and map the JPA entity to it) to avoid quoting problems.

## PRODUCT

| Field | Type | Key | Description |
| --- | --- | --- | --- |
| product_id | bigint | PK | Unique id of the product record. |
| serial_number | varchar | UK | Device serial number; unique per physical device. |
| model | varchar |   | Model name or number. |
| warranty_start | date |   | First day of warranty coverage. |
| warranty_end | date |   | Last day of warranty coverage. |
| purchase_date | date |   | Date of purchase, used for date-consistency checks. |
| (suggested) |   |   |   |

## CLAIM

| Field | Type | Key | Description |
| --- | --- | --- | --- |
| claim_id | bigint | PK | Unique id of the claim. |
| product_id | bigint | FK | The product the claim is about. |
| user_id | bigint | FK | The user who registered or manages the claim. |
| claim_number | varchar | UK | Human-readable claim reference; unique. |
| claim_date | date |   | Date the claim was made. |
| status | varchar |   | Claim status, for example SUBMITTED, UNDER_REVIEW, |
|   |   |   | FLAGGED, RESOLVED (suggested values). |
| issue_description | text |   | What the customer says is wrong with the product. |
| (suggested) |   |   |   |
| service_centre_id | bigint | FK | Only if the ServiceCentre table is added. |
| (suggested) |   |   |   |


## EVIDENCE_DOCUMENT

| Field | Type | Key | Description |
| --- | --- | --- | --- |
| document_id | bigint | PK | Unique id of the document record. |
| claim_id | bigint | FK | The claim this document belongs to. |
| document_type | varchar |   | INVOICE, REPAIR_REPORT, PARTS_INVOICE or PHOTO |
|   |   |   | (suggested values). |
| file_path | varchar |   | Location of the file in protected storage. |
| file_hash | varchar |   | Hash of the file bytes (for example SHA-256) used to detect exact |
|   |   |   | duplicates. |
| extracted_data (suggested) | jsonb or text |   | OCR output: invoice number, amount, dates, serial number. |
| upload_date (suggested) | timestamp |   | When the file was uploaded. |

Do not make file_hash unique. The same hash appearing on two claims is exactly what the system must be able to store and detect. Add a normal (non-unique) index instead.

## FINDING

| Field | Type | Key | Description |
| --- | --- | --- | --- |
| finding_id | bigint | PK | Unique id of the finding. |
| claim_id | bigint | FK | The claim in which the inconsistency was found. |
| rule_code | varchar |   | Which rule fired, for example DUPLICATE_INVOICE or |
|   |   |   | SERIAL_REUSE. |
| severity | varchar |   | LOW, MEDIUM or HIGH (suggested values). |
| status | varchar |   | OPEN, UNDER_INVESTIGATION, RESOLVED, DISMISSED |
|   |   |   | (suggested values). |
| description (suggested) | text |   | The plain-language reason shown to the reviewer. |
| created_at (suggested) | timestamp |   | When the finding was created. |

## INVESTIGATION_ACTION

| Field | Type | Key | Description |
| --- | --- | --- | --- |
| action_id | bigint | PK | Unique id of the action. |
| finding_id | bigint | FK | The finding the reviewer acted on. |
| user_id | bigint | FK | The reviewer who performed the action (called reviewer_id in the |
|   |   |   | written plan). |
| action_type | varchar |   | For example COMMENT, REQUEST_EVIDENCE, |
|   |   |   | CORRECT_VALUE, STATUS_CHANGE, RESOLVE (suggested |
|   |   |   | values). |
| explanation | text |   | Why the reviewer did this. Required for resolutions. |
| previous_status (suggested) | varchar |   | Finding status before the action. |
| new_status (suggested) | varchar |   | Finding status after the action. |
| action_time (suggested) | timestamp |   | When the action happened. |


Actions are append-only: never edit or delete a row to “fix” history. Add a new action instead. This is what makes the audit history correction-aware.

## EVIDENCE_LINK (relationship table)

| Field | Type | Key | Description |
| --- | --- | --- | --- |
| finding_id | bigint | PK, FK | The finding. |
| document_id | bigint | PK, FK | A document that supports that finding. |
| evidence_role | varchar |   | Why the document is linked, for example CONFLICTING_VALUE, |
|   |   |   | DUPLICATE_OF, SUPPORTING_EVIDENCE (suggested values). |

The two foreign keys together form the composite primary key, so the same document cannot be linked to the same finding twice. Because a finding can link to documents from different claims (for example the same invoice used in two claims), this table is what powers traceability.

## 9.5 Optional extra table: SERVICE_CENTRE (suggested)

The written plan lists a separate ServiceCentre entity because several claims may come from the same centre, and service-centre patterns (for example unusual parts activity) are a known fraud signal. It is not in the current ER diagram. If added: SERVICE_CENTRE (service_centre_id PK, name, location) and a one-to-many link to CLAIM through service_centre_id.

## 9.6 Integrity rules

- Use foreign keys for every relationship so orphan records are impossible.

- Unique constraints on user.email, product.serial_number and claim.claim_number.

- Composite primary key on EVIDENCE_LINK (finding_id, document_id).

- Index file_hash, claim_id and serial_number for fast cross-claim checks.

- Use NOT NULL on mandatory fields, and CHECK constraints or enums for status, role and severity values.

- Use warranty_end >= warranty_start as a check constraint.

- These tables are the starting set, not the complete final schema; add tables only when a feature needs them.

## 10. Analysis engine design

The analysis engine starts with rules, OCR, and image hashing. It does not use a complex AI model in the first version. It runs after documents are uploaded (and again after corrections or new evidence) and creates findings linked to their source documents.

## 10.1 Starting rules

Rule codes below are suggested names for the rule_code field.

| Rule code (suggested) | What it checks | Evidence linked to the finding |
| --- | --- | --- |
| DUPLICATE_INVOICE | The same invoice number or identical invoice file | Every invoice document carrying that |
|   | appears in more than one claim. | number or hash, across all claims involved. |


| Rule code (suggested) | What it checks | Evidence linked to the finding |
| --- | --- | --- |
| SERIAL_REUSE | The same serial number appears in claims that | Documents showing the serial number in |
|   | conflict (for example repeated claims or repairs in | each claim. |
|   | overlapping periods). |   |
| DATE_CONFLICT | Dates that cannot be right: claim outside warranty | Product record plus the document(s) |
|   | period, repair before purchase, repair before | carrying the conflicting dates. |
|   | claim, invoice after claim. |   |
| INVOICE_MISMATCH | Invoice details disagree with the claim or product | The invoice and the record it conflicts with. |
|   | (serial number, model, amount). |   |
| DUPLICATE_PHOTO | The same photograph (identical file hash) is used | The matching photo documents. |
|   | in different claims. |   |
| REPAIR_PARTS_MISM | Requested repair does not match the parts | Repair report and parts invoice. |
| ATCH | invoice or repair report. |   |

Image similarity (near-duplicate photographs, not only exact copies) can be added later. Service-centre pattern checks (for example unusual replacement-parts activity) are a natural next rule once ServiceCentre exists.

## 10.2 OCR field extraction

- Extract dates, invoice numbers, serial numbers, and amounts from supported documents.

- Store the extracted values with the document so reviewers can view them in the Evidence Explorer.

- OCR makes mistakes, so reviewers must be able to correct an extracted value. The original value is kept and the correction is recorded as an action, then analysis is re-run.

## 10.3 Image hashing

- Compute a hash (for example SHA-256) of every uploaded file and store it in file_hash.

- Two documents with the same hash are exact duplicates; this triggers duplicate checks.

- Exact hashing only catches identical files. A re-saved or cropped photo will have a different hash, which is why similarity matching is a later extension.

## 10.4 Finding lifecycle (suggested)

Every move between statuses creates an INVESTIGATION_ACTION row with the reviewer, the explanation, and the previous and new status. A resolved finding can be reopened; its earlier history stays visible.


## 11. Investigation and audit workflow

## 11.1 Worked example: duplicate invoice across two claims

- 1 Claims staff register Claim A and upload an invoice. OCR reads invoice number INV-1001 (fictional).

- 2 Later, Claim B is registered for a different customer and uses an invoice with the same number INV-1001.

- 3 The analysis engine fires DUPLICATE_INVOICE, creates a Finding on Claim B with severity HIGH, and adds two EVIDENCE_LINK rows pointing to both invoice documents.

- 4 An investigator opens the finding. Claimora shows the rule, both claims, both invoices and the conflicting values.

- 5 The investigator requests more evidence and sets the status to UNDER_INVESTIGATION (an action is recorded).

- 6 New evidence arrives (for example a corrected invoice or a service-centre confirmation). The investigator corrects the extracted value, re-runs analysis, writes an explanation and resolves the finding.

- 7 The full chain is preserved: original extracted values, correction, new document, explanation, who, and when.

## 11.2 What the audit history must preserve

| Item | How it is preserved |
| --- | --- |
| Original extracted values | Kept with the document; corrections do not overwrite them. |
| Reviewer corrections | Recorded as actions with the acting user, time, and explanation. |
| New evidence | Uploaded as new documents and linked to the finding. |
| Status changes | Each change stores previous status and new status. |
| Earlier findings | Never deleted; they can be resolved, dismissed or reopened. |
| Final decisions | Stored as the closing action with the written reason. |


## 12. Proposed project structure

Use two separate application folders in one main repository.

```
claimora/
frontend/ (Angular + TypeScript)
src/app/
components/ dashboard, claims, evidence viewer
pages/ claim list, claim details, investigations
services/ API communication
models/ TypeScript data interfaces
guards/ route protection
app.routes.ts
app.config.ts
backend/ (Java + Spring Boot)
controller/ REST endpoints
service/ business logic
entity/ database entities
repository/ database access
dto/ API request and response objects
analysis/ consistency and duplicate rules
audit/ reviewer actions and history
security/ authentication and authorization
resources/application.properties
database/
schema.sql tables and relationships
seed.sql fictional demonstration data
docs-and-tests/ API documentation, test cases, evaluation results,
screenshots, project report
```

## 13. Main modules to develop

| Module | Main responsibility | Typical work |
| --- | --- | --- |
| User and access | Login and reviewer roles | Login, password hashing, role checks, user admin |
| management |   | screen |
| Claim management | Create, view, and update warranty | Products, claim forms, claim list with search and |
|   | claims | filters, claim details |
| Evidence management | Upload, view, and organise | Upload API, protected storage, hash calculation, |
|   | documents | Evidence Explorer |
| Analysis engine | Run consistency and duplicate checks OCR step, rules, finding creation, evidence links |   |
| Investigation and audit | Assign findings, add explanations, | Finding detail page, actions, status history, reports |
|   | record resolutions |   |


## 14. Team Work Division

The Claimora project will be developed by six team members. Each member is responsible for one main backend entity, including its PostgreSQL table, Spring Boot Entity class, Repository, Service, Controller, and validation logic.

The team will follow a common database schema and naming convention to ensure that all entities integrate correctly. The EvidenceLink relationship table and overall integration will be handled collaboratively.

| Team Member | Assigned Entity / Area | Main Responsibility |
| --- | --- | --- |
| Vidhi | User | User management and authentication |
| Shaili | Product | Product records and warranty details |
| Tanishka | Claim | Warranty claim management |
| Kalp | EvidenceDocument | Evidence document uploads and metadata |
| Chinmay | Finding | Inconsistency detection and finding management |
| Anuj | InvestigationAction | Investigation history and reviewer actions |

## 14.1 Vidhi – User Entity and Authentication

- Design the User entity and PostgreSQL table.

- Implement user registration and login.

- Configure roles: ADMIN, INVESTIGATOR, and STAFF.

- Implement password hashing and account-status validation.

- Develop the User Repository, Service, and Controller.

- Configure Spring Security and coordinate role-based access with the team.

## 14.2 Shaili – Product Entity

- Design the Product entity and database table.

- Store product serial numbers, model details, purchase dates, and warranty periods.

- Implement product creation, viewing, updating, and searching.

- Validate serial numbers and warranty dates.

- Develop the Product Repository, Service, and Controller.

## 14.3 Tanishka – Claim Entity

- Design the Claim entity and PostgreSQL table.

- Link each claim to the relevant product and the user who registered or manages it.

- Implement claim creation, viewing, updating, searching, and status management.

- Validate claim numbers and required claim information.

- Develop the Claim Repository, Service, and Controller.


## 14.4 Kalp – EvidenceDocument Entity

- Design the EvidenceDocument entity and database table.

- Store document metadata, file paths, file hashes, document types, and extracted data.

- Implement document upload and retrieval through Spring Boot APIs.

- Support evidence types such as invoices, repair reports, parts invoices, and photographs.

Calculate file hashes to help identify exact duplicate files.

- Develop the EvidenceDocument Repository, Service, and Controller.

## 14.5 Chinmay – Finding Entity

- Design the Finding entity and PostgreSQL table.

- Store findings associated with warranty claims.

- Implement rule-based inconsistency detection, including duplicate invoices, serial-number reuse, conflicting dates, and invoice mismatches.

- Store the rule code, severity, status, description, and creation timestamp for each finding.

- Implement finding creation, viewing, filtering, status updates, and retrieval of finding details.

- Link findings to their related claims and coordinate with Kalp to connect supporting evidence through EvidenceLink.

- Develop the Finding Repository, Service, and Controller.

- Test whether findings are generated correctly for legitimate and inconsistent claims.

## 14.6 Anuj – InvestigationAction Entity

- Design the InvestigationAction entity and PostgreSQL table.

- Record reviewer actions, explanations, corrections, and finding status changes.

- Store the user who performed each action, the action type, previous status, new status, and action time.

- Implement action-history retrieval and recording of resolution explanations.

- Ensure earlier investigation actions remain preserved instead of being silently overwritten or deleted.

- Develop the InvestigationAction Repository, Service, and Controller.

- Coordinate with Chinmay to connect investigation actions to findings and with Vidhi to identify the acting user.

## 14.7 Shared Integration Responsibility

The EvidenceLink table is a relationship table rather than a seventh main entity assigned to an individual member.

- Kalp and Chinmay will coordinate the relationship between evidence documents and findings.


- Anuj will help integrate EvidenceLink with investigation history and test the related database operations.

- All members will follow the agreed database schema, field names, foreign keys, and API conventions.

- Each member will test their APIs using Postman and integrate their work with the Angular frontend.

- The complete team will test the end-to-end workflow, from user login and claim creation to evidence upload, finding generation, investigation, and resolution.

## 14.8 Entity Development Dependencies

- 1 Vidhi and Shaili can begin independently with User and Product.

- 2 Tanishka needs the User and Product entities to establish the Claim relationships.

- 3 Kalp needs the Claim entity to associate evidence documents with claims.

- 4 Chinmay needs the Claim entity and access to relevant evidence information to generate findings.

- 5 Anuj needs the Finding and User entities to record investigation actions.

- 6 The team will integrate EvidenceLink and test all relationships after the relevant entities are available.

## 15. Proposed REST API outline (suggested)

A starting list to agree on between frontend and backend. Paths and names can change; keep them consistent.

| Area | Method and path | Purpose | Roles |
| --- | --- | --- | --- |
| Auth | POST /api/auth/login | Log in and receive a session or token | All |
| Users | GET / POST / PUT /api/users | List, create and update users; set role and | Admin |
|   |   | status |   |
| Products | GET / POST /api/products | List and register products | Admin, Claims |
|   |   |   | Staff |
| Claims | GET / POST /api/claims | List (search, status filter) and create claims | By role |
| Claims | GET / PUT /api/claims/{id} | View and update one claim | By role |
| Evidence | POST /api/claims/{id}/documents | Upload a document to a claim | All |
| Evidence | GET /api/documents/{id} | Document metadata and extracted fields | By role |
| Evidence | GET /api/documents/{id}/file | Download from protected storage after | By role |
|   |   | permission check |   |
| Analysis | POST /api/claims/{id}/analyze | Run or re-run the analysis engine | Admin, |
|   |   |   | Investigator |
| Findings | GET /api/findings | List findings with filters (status, severity) | By role |
| Findings | GET /api/findings/{id} | Finding detail with reason, linked documents | By role |
|   |   | and actions |   |
| Actions | POST /api/findings/{id}/actions | Add a reviewer action or resolve a finding | Admin, |
|   |   |   | Investigator |
| Dashboard | GET /api/dashboard/summary | Counters for the dashboard | By role |
| Reports | GET /api/reports/... | Summary reports | By role |


## 16. Real-world case studies and what Claimora can learn

These published examples demonstrate that warranty and claims fraud is a real problem. They also show why Claimora must be positioned around a focused implementation rather than claiming to invent fraud detection.

## Case study 1: Warranty and service-provider fraud (Elder Research, computer technology)

Elder Research describes a system that analysed service-provider patterns, including unusual replacement-parts activity. It reported identifying \$11 million in contract fraud during the first nine months and more than \$67 million in savings over five years.

Lesson for Claimora: compare repair records and parts invoices across claims, not just within a single claim.

## Case study 2: One invoice across three claims (Ceertia, property insurance)

Ceertia describes an anonymised insurer scenario in which the same repair invoice appeared across three separate claims. Portfolio-wide document checks connected the duplicate invoice to the relevant claim records.

Lesson for Claimora: maintain cross-claim duplicate detection and show reviewers every linked claim.

## Case study 3: Warranty returns and dealer credits (OPAG / Ajwa Group, published 2026)

A published case study describes a warranty-returns workflow that flagged 23 duplicate or unsupported dealer credit claims using serial histories, invoices, returned-part records, photographs, and approval records. Human reviewers retained control of final decisions.

Lesson for Claimora: connect multiple evidence types and keep final resolution under human control.

These are published vendor case studies, not independently audited proof of results that Claimora can reproduce. Check the figures against the original sources before quoting them in the viva.

## 17. How to evaluate Claimora

Create a synthetic dataset of legitimate and deliberately inconsistent claims. Compare Claimora against a simple baseline that checks required fields, warranty dates, and exact duplicates.

| Measure | What it tells us |
| --- | --- |
| Detection rate for planted inconsistencies | How many of the deliberately planted problems Claimora finds |
| False-positive rate on legitimate claims | How often it flags claims that are actually fine |
| Percentage of findings with traceable source | Whether every finding links back to documents and fields |
| evidence |   |
| Correct resolution after new evidence is uploaded | Whether re-analysis and resolution behave correctly |
| Average review time per test claim | Whether the explanations actually speed up review |

Report the actual results after testing. Do not invent performance figures in the proposal.


## 18. Recommended development order

| Step Work |   | Notes |
| --- | --- | --- |
| 1 | Design the PostgreSQL schema and create the | Write schema.sql and seed.sql. Agree on the open decisions |
|   | tables | in section 21 first. |
| 2 | Build Spring Boot entities, repositories, services | Claim creation, claim listing, document metadata, findings. |
|   | and REST controllers |   |
| 3 | Implement secure login, password hashing and | Spring Security, enforced on the backend. |
|   | role-based permissions |   |
| 4 | Build Angular login, dashboard, products and | Plus route guards and the HTTP service layer. |
|   | claims pages |   |
| 5 | Add evidence uploads and protected file storage | Hash on upload, save metadata in PostgreSQL. |
| 6 | Implement rule-based findings and evidence links | Duplicate invoice, serial-number reuse, date conflict, |
|   |   | repeated image. |
| 7 | Add investigation actions, status history, | Reviewer decisions, corrections, resolution history. |
|   | re-analysis and reports |   |
| 8 | Test and demonstrate with fictional claims | Show a flagged issue, new evidence and a traceable |
|   |   | resolution. |

Priority. Complete login, then role permissions, then product and claim management first. Once those work, add evidence uploads and the analysis engine. That gives you a functional website before tackling the more advanced features.

## 19. Test scenarios (suggested)

Use fictional data only. Include both clean claims and claims with planted inconsistencies.

| Scenario | Setup | Expected result |
| --- | --- | --- |
| Legitimate claim | Valid product, dates inside warranty, unique | No findings. |
|   | invoice and photos. |   |
| Duplicate invoice | Two claims use the same invoice number. | DUPLICATE_INVOICE finding linked to |
|   |   | both invoices. |
| Serial reuse | Same serial number appears in conflicting claims. | SERIAL_REUSE finding with both claims |
|   |   | linked. |
| Date conflict | Claim date after warranty end, or repair dated | DATE_CONFLICT finding showing the |
|   | before purchase. | dates. |
| Repeated photo | Identical photo file uploaded to two claims. | DUPLICATE_PHOTO finding (same hash). |
| Invoice mismatch | Invoice serial number differs from the product | INVOICE_MISMATCH finding. |
|   | record. |   |
| New evidence resolves | Upload explanatory document, correct value, | Finding resolved; history keeps original |
| a finding | re-analyse. | value and reason. |
| Permission check | Claims Staff tries to resolve a finding or open User | Backend rejects the request. |
|   | Management. |   |


## 20. Final project pitch

Claimora is a warranty claims investigation platform that connects evidence across documents and related claims, explains potential inconsistencies, and preserves the history of investigation and resolution. Its proposed contribution is an end-to-end workflow combining evidence traceability, explainable rule-based analysis, and correction-aware audit history.

Strongest demonstration: a duplicate invoice detected across two claims, investigated by a reviewer, and resolved after additional evidence arrives.

That gives you a focused academic project with a clear problem statement, practical full-stack architecture, measurable evaluation criteria, and a USP you can defend during your viva.

## 21. Open decisions for the team

| # | Decision | Options / note |
| --- | --- | --- |
| 1 | Add a ServiceCentre table? | Useful for service-centre patterns; adds service_centre_id to Claim. |
| 2 | How are cases “assigned” to investigators? Add assigned_to on Finding or Claim; needed for the Investigator |   |
|   |   | dashboard and filtering. |
| 3 | Which extra fields go into the final schema? See the suggested fields in section 9.4. |   |
| 4 | Physical name of the USER table | users or app_user, because USER is reserved in PostgreSQL. |
| 5 | Authentication style | Session-based or token-based (JWT) with Spring Security. |
| 6 | File storage | Protected local folder for the project, or object storage later. |
| 7 | OCR library or service | Pick one early and test it on sample invoices. |
| 8 | Status and role value lists | Agree the exact values for claim, finding, role, severity and action_type. |
| 9 | Confirm who owns what | Team work division in section 14; confirm it and the hand-off order. |

## Appendix: Glossary

| Term | Meaning |
| --- | --- |
| Claim | A customer's request for warranty service on a product. |
| Finding | A possible inconsistency worth investigating. It is not proof of fraud. |
| Evidence document | An uploaded invoice, repair report, parts invoice or photograph, with its metadata. |
| Evidence link | Connection between a finding and a document that supports it. |
| Rule code | Identifier of the rule that produced a finding. |
| OCR | Optical character recognition: reading text and fields from document images. |
| File hash | A fingerprint of a file's bytes; identical files produce identical hashes. |
| Audit history | The preserved record of reviewer actions, status changes, corrections and reasons. |
| REST API | HTTP interface between the Angular frontend and the Spring Boot backend. |
| Viva | The oral examination where the project is presented and defended. |
