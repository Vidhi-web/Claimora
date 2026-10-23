-- =============================================================================
-- Claimora Seed Data (Fictional Records Only)
-- Platform: Warranty Claims Investigation & Fraud-Risk Analysis Platform
-- =============================================================================

-- Clear existing data (in dependency order)
TRUNCATE TABLE evidence_link, investigation_action, finding, evidence_document, claim, product, users RESTART IDENTITY CASCADE;

-- -----------------------------------------------------------------------------
-- 1. Fictional Users (Passwords are BCrypt hashes of 'Password123!')
-- -----------------------------------------------------------------------------
INSERT INTO users (name, email, password_hash, role, status) VALUES
('Vidhi Lead', 'vidhi.admin@claimora.internal', '$2a$12$K8yXb6qQ3e0pT5o8t8eNveQZpU1wTjD0C6.O4P.M4G9JkXQ1W9y2a', 'ADMIN', 'ACTIVE'),
('Anuj Investigator', 'anuj.investigator@claimora.internal', '$2a$12$K8yXb6qQ3e0pT5o8t8eNveQZpU1wTjD0C6.O4P.M4G9JkXQ1W9y2a', 'INVESTIGATOR', 'ACTIVE'),
('Chinmay Analyst', 'chinmay.analyst@claimora.internal', '$2a$12$K8yXb6qQ3e0pT5o8t8eNveQZpU1wTjD0C6.O4P.M4G9JkXQ1W9y2a', 'INVESTIGATOR', 'ACTIVE'),
('Tanishka Claims Specialist', 'tanishka.staff@claimora.internal', '$2a$12$K8yXb6qQ3e0pT5o8t8eNveQZpU1wTjD0C6.O4P.M4G9JkXQ1W9y2a', 'STAFF', 'ACTIVE'),
('Kalp Document Reviewer', 'kalp.staff@claimora.internal', '$2a$12$K8yXb6qQ3e0pT5o8t8eNveQZpU1wTjD0C6.O4P.M4G9JkXQ1W9y2a', 'STAFF', 'ACTIVE'),
('Shaili Catalog Manager', 'shaili.staff@claimora.internal', '$2a$12$K8yXb6qQ3e0pT5o8t8eNveQZpU1wTjD0C6.O4P.M4G9JkXQ1W9y2a', 'STAFF', 'ACTIVE'),
('John Customer', 'john.doe@example.com', '$2a$12$K8yXb6qQ3e0pT5o8t8eNveQZpU1wTjD0C6.O4P.M4G9JkXQ1W9y2a', 'STAFF', 'ACTIVE');

-- -----------------------------------------------------------------------------
-- 2. Fictional Products
-- -----------------------------------------------------------------------------
INSERT INTO product (serial_number, model, purchase_date, warranty_start, warranty_end) VALUES
('SN-XPS15-9520-4821', 'Dell XPS 15 9520', '2025-01-15', '2025-01-15', '2027-01-15'),
('SN-APL-MBP16-9932', 'Apple MacBook Pro 16 M3', '2024-06-10', '2024-06-10', '2025-06-10'),
('SN-SMS-S24U-10294', 'Samsung Galaxy S24 Ultra', '2025-03-01', '2025-03-01', '2026-03-01'),
('SN-SNY-WH1000XM5', 'Sony WH-1000XM5 Headphones', '2024-11-20', '2024-11-20', '2025-11-20');

-- -----------------------------------------------------------------------------
-- 3. Fictional Claims
-- -----------------------------------------------------------------------------
INSERT INTO claim (product_id, user_id, claim_number, claim_date, status, issue_description) VALUES
(1, 4, 'CLM-2026-000101', '2026-02-10', 'FLAGGED', 'Screen flickering intermittently and blacking out under GPU load during normal usage.'),
(2, 4, 'CLM-2026-000102', '2026-02-12', 'UNDER_REVIEW', 'Battery draining within 45 minutes; device runs abnormally hot near charging port.'),
(3, 4, 'CLM-2026-000103', '2026-02-14', 'SUBMITTED', 'Camera sensor failure; autofocus motor buzzing loudly when switching to 5x optical zoom.'),
(4, 5, 'CLM-2026-000104', '2026-01-28', 'APPROVED', 'Right hinge detached from chassis due to manufacturing plastic fatigue; verified authentic.');

-- -----------------------------------------------------------------------------
-- 4. Fictional Evidence Documents
-- -----------------------------------------------------------------------------
INSERT INTO evidence_document (claim_id, document_type, file_path, file_hash, extracted_data) VALUES
(1, 'INVOICE', '/storage/evidence/2026/02/invoice_clm101_electronic.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 
 '{"vendor": "BestTech Electronics", "total_amount": 1899.99, "currency": "USD", "invoice_date": "2025-01-15", "ocr_confidence": 0.98}'),
(1, 'PHOTO_DAMAGE', '/storage/evidence/2026/02/damage_screen_clm101.jpg', '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945', 
 '{"detected_objects": ["display_panel", "crack_lines", "water_mark"], "tamper_detected": true, "tamper_score": 0.87}'),
(2, 'RECEIPT', '/storage/evidence/2026/02/apple_store_receipt_clm102.pdf', 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', 
 '{"vendor": "Apple Store Michigan Ave", "total_amount": 2499.00, "currency": "USD", "invoice_date": "2024-06-10", "ocr_confidence": 0.94}'),
(3, 'SERVICE_ESTIMATE', '/storage/evidence/2026/02/repair_quote_clm103.pdf', '9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba', 
 '{"service_center": "Authorized Samsung Care", "estimated_cost": 230.00, "part_needed": "Camera Module Assy", "ocr_confidence": 0.96}');

-- -----------------------------------------------------------------------------
-- 5. Fictional Findings (Fraud Risk Engine Rules)
-- -----------------------------------------------------------------------------
INSERT INTO finding (claim_id, rule_code, severity, status, description) VALUES
(1, 'RULE_IMAGE_TAMPER_DETECTED', 'CRITICAL', 'OPEN', 'Error level analysis (ELA) detected altered pixels in the receipt date and serial number area.'),
(1, 'RULE_VELOCITY_HIGH_VALUE', 'MEDIUM', 'INVESTIGATING', 'Claimant submitted 3 high-value hardware claims within a 45-day window across retail partners.'),
(2, 'RULE_WARRANTY_DATE_PROXIMITY', 'LOW', 'OPEN', 'Claim filed 8 days after standard limited warranty cutoff; checking grace period extension.');

-- -----------------------------------------------------------------------------
-- 6. Fictional Investigation Actions (Append-Only Audit Trail)
-- -----------------------------------------------------------------------------
INSERT INTO investigation_action (finding_id, user_id, action_type, explanation, previous_status, new_status, action_time) VALUES
(1, 2, 'FLAG_FOR_FORENSICS', 'Flagged image for EXIF inspection. Metadata reveals creation with Photoshop 25.1 rather than camera capture.', 'OPEN', 'INVESTIGATING', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(2, 3, 'CROSS_REFERENCE_HISTORY', 'Queried national claims fraud registry. Claimant matches pattern associated with refurbished re-submission ring.', 'OPEN', 'INVESTIGATING', CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- -----------------------------------------------------------------------------
-- 7. Fictional Evidence Links (Connecting Findings to Documents)
-- -----------------------------------------------------------------------------
INSERT INTO evidence_link (finding_id, document_id, evidence_role) VALUES
(1, 2, 'PRIMARY_SUSPECT_EVIDENCE'),
(1, 1, 'CORROBORATING_DOCUMENT'),
(3, 3, 'SUPPORTING_INVOICE');
