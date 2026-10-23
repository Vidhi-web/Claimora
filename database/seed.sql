-- =============================================================================
-- Claimora Seed Data (Fictional Records Only)
-- Platform: Evidence-Centric Warranty Claims Investigation & Fraud-Risk Analysis Platform
-- Includes planted inconsistencies demonstrating all 6 analysis rules
-- =============================================================================

-- Clear existing data (in dependency order)
TRUNCATE TABLE evidence_link, investigation_action, finding, evidence_document, claim, product, users RESTART IDENTITY CASCADE;

-- -----------------------------------------------------------------------------
-- 1. Fictional Users (Passwords are BCrypt hashes of 'Password123!' or 'Admin123!')
-- -----------------------------------------------------------------------------
INSERT INTO users (name, email, password_hash, role, status) VALUES
('Claimora Administrator', 'admin@claimora.internal', '$2a$10$wE1uC4kLhMhKzK2nNu8yxeG1bM1h0aV2Jc1bXz4E6p8mY9q0r1s2t', 'ADMIN', 'ACTIVE'),
('Anuj Investigator', 'anuj.investigator@claimora.internal', '$2a$10$Xq8N5sY6t1m2u3v4w5x6yeZ7aB8c9d0e1f2g3h4i5j6k7l8m9n0o1', 'INVESTIGATOR', 'ACTIVE'),
('Chinmay Analyst', 'chinmay.investigator@claimora.internal', '$2a$10$Xq8N5sY6t1m2u3v4w5x6yeZ7aB8c9d0e1f2g3h4i5j6k7l8m9n0o1', 'INVESTIGATOR', 'ACTIVE'),
('Tanishka Claims Specialist', 'tanishka.staff@claimora.internal', '$2a$10$Xq8N5sY6t1m2u3v4w5x6yeZ7aB8c9d0e1f2g3h4i5j6k7l8m9n0o1', 'STAFF', 'ACTIVE'),
('Kalp Document Reviewer', 'kalp.staff@claimora.internal', '$2a$10$Xq8N5sY6t1m2u3v4w5x6yeZ7aB8c9d0e1f2g3h4i5j6k7l8m9n0o1', 'STAFF', 'ACTIVE'),
('Shaili Catalog Manager', 'shaili.staff@claimora.internal', '$2a$10$Xq8N5sY6t1m2u3v4w5x6yeZ7aB8c9d0e1f2g3h4i5j6k7l8m9n0o1', 'STAFF', 'ACTIVE'),
('Inactive Staff User', 'inactive.user@claimora.internal', '$2a$10$Xq8N5sY6t1m2u3v4w5x6yeZ7aB8c9d0e1f2g3h4i5j6k7l8m9n0o1', 'STAFF', 'INACTIVE');

-- -----------------------------------------------------------------------------
-- 2. Fictional Products
-- -----------------------------------------------------------------------------
INSERT INTO product (serial_number, model, purchase_date, warranty_start, warranty_end) VALUES
('SN-DELL-XPS15-001', 'Dell XPS 15 9530', '2025-01-10', '2025-01-10', '2027-01-10'),
('SN-APPL-MBP16-002', 'Apple MacBook Pro 16 M3', '2025-05-15', '2025-05-15', '2026-05-15'),
('SN-SAMS-S24U-003', 'Samsung Galaxy S24 Ultra', '2025-02-01', '2025-02-01', '2027-02-01'),
('SN-LENO-X1C-004', 'Lenovo ThinkPad X1 Carbon', '2023-08-01', '2023-08-01', '2024-08-01'),
('SN-SONY-WH5-005', 'Sony WH-1000XM5 Headphones', '2025-06-20', '2025-06-20', '2026-06-20');

-- -----------------------------------------------------------------------------
-- 3. Fictional Claims
-- -----------------------------------------------------------------------------
INSERT INTO claim (product_id, user_id, claim_number, claim_date, status, issue_description) VALUES
-- Clean claim
(3, 4, 'CLM-2026-001', '2025-08-14', 'SUBMITTED', 'Camera focus actuator buzzing during 5x optical zoom mode.'),
-- Planted Inconsistency 1: DUPLICATE_INVOICE (Claims 2 and 3 share same invoice number & hash)
(1, 4, 'CLM-2026-002', '2025-09-02', 'FLAGGED', 'Display flickering intermittently under GPU rendering load.'),
(2, 5, 'CLM-2026-003', '2025-09-15', 'FLAGGED', 'Liquid damage claim with submitted retail invoice.'),
-- Planted Inconsistency 2: SERIAL_REUSE (Claims 4 and 5 repeated on same Product 1)
(1, 4, 'CLM-2026-004', '2025-10-01', 'UNDER_REVIEW', 'Motherboard replacement request following electrical surge.'),
(1, 5, 'CLM-2026-005', '2025-10-18', 'FLAGGED', 'Repeat motherboard failure claim within 18 days on same serial.'),
-- Planted Inconsistency 3: DATE_CONFLICT (Claim 6 outside warranty window on Product 4)
(4, 4, 'CLM-2026-006', '2025-11-05', 'FLAGGED', 'Keyboard keycaps sticky; thermal throttling issue reported.'),
-- Planted Inconsistency 4: INVOICE_MISMATCH (Claim 7 invoice has conflicting serial and inflated amount)
(1, 5, 'CLM-2026-007', '2025-11-20', 'FLAGGED', 'Charging port loose and intermittent battery recognition.'),
-- Planted Inconsistency 5: DUPLICATE_PHOTO (Claims 8 and 9 share exact duplicate photo hash)
(3, 4, 'CLM-2026-008', '2025-12-01', 'FLAGGED', 'Cracked camera module submitted with damage photograph.'),
(5, 5, 'CLM-2026-009', '2025-12-10', 'FLAGGED', 'Cracked headphone headband submitted with identical photograph.'),
-- Planted Inconsistency 6: REPAIR_PARTS_MISMATCH (Repair report vs parts invoice disagree)
(2, 4, 'CLM-2026-010', '2026-01-12', 'FLAGGED', 'Audio jack failure; technician invoice submitted.');

-- -----------------------------------------------------------------------------
-- 4. Fictional Evidence Documents
-- -----------------------------------------------------------------------------
INSERT INTO evidence_document (claim_id, document_type, file_path, file_hash, original_filename, mime_type, file_size, ocr_status, extracted_data) VALUES
-- Claim 1 (Clean)
(1, 'INVOICE', '/storage/docs/2026/01/invoice_s24_clean.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'invoice_s24.pdf', 'application/pdf', 245100, 'PROCESSED', '{"invoiceNumber": "INV-S24-1001", "serialNumber": "SN-SAMS-S24U-003", "amount": 1299.99, "invoiceDate": "2025-02-01"}'),
-- Claim 2 & Claim 3: Duplicate Invoice (Same invoiceNumber "INV-DUP-99201" and identical hash)
(2, 'INVOICE', '/storage/docs/2026/02/invoice_retail_99201.pdf', 'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef', 'invoice_dell_99201.pdf', 'application/pdf', 312000, 'PROCESSED', '{"invoiceNumber": "INV-DUP-99201", "serialNumber": "SN-DELL-XPS15-001", "amount": 2199.00, "invoiceDate": "2025-01-10"}'),
(3, 'INVOICE', '/storage/docs/2026/03/invoice_macbook_reused.pdf', 'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef', 'invoice_macbook_reused.pdf', 'application/pdf', 312000, 'PROCESSED', '{"invoiceNumber": "INV-DUP-99201", "serialNumber": "SN-APPL-MBP16-002", "amount": 2499.00, "invoiceDate": "2025-05-15"}'),
-- Claim 4 & Claim 5: Serial Reuse documents
(4, 'REPAIR_REPORT', '/storage/docs/2026/04/repair_mb_first.pdf', 'b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdefa1', 'repair_oct01.pdf', 'application/pdf', 189000, 'PROCESSED', '{"serialNumber": "SN-DELL-XPS15-001", "repairDate": "2025-10-01", "serviceNote": "Motherboard diagnostics confirmed."}'),
(5, 'REPAIR_REPORT', '/storage/docs/2026/05/repair_mb_repeat.pdf', 'c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdefa1b2', 'repair_oct18.pdf', 'application/pdf', 194000, 'PROCESSED', '{"serialNumber": "SN-DELL-XPS15-001", "repairDate": "2025-10-18", "serviceNote": "Second motherboard replacement request."}'),
-- Claim 6: Date Conflict document
(6, 'INVOICE', '/storage/docs/2026/06/invoice_expired_lenovo.pdf', 'd4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdefa1b2c3', 'invoice_lenovo_x1.pdf', 'application/pdf', 210000, 'PROCESSED', '{"invoiceNumber": "INV-LEN-8812", "serialNumber": "SN-LENO-X1C-004", "amount": 1650.00, "invoiceDate": "2023-08-01"}'),
-- Claim 7: Invoice Mismatch document (serial disagrees with Product 1)
(7, 'INVOICE', '/storage/docs/2026/07/invoice_mismatch_dell.pdf', 'e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdefa1b2c3d4', 'invoice_mismatch.pdf', 'application/pdf', 278000, 'PROCESSED', '{"invoiceNumber": "INV-MIS-3312", "serialNumber": "SN-DELL-WRONG-999", "model": "Dell Alienware M16", "amount": 3899.00, "invoiceDate": "2025-01-10"}'),
-- Claim 8 & Claim 9: Duplicate Photo (identical file hash across two different claims)
(8, 'PHOTO', '/storage/docs/2026/08/damage_screen_cracked.jpg', 'ffeeddccbbaa00112233445566778899aabbccddeeff00112233445566778899', 'damage_screen.jpg', 'image/jpeg', 1450000, 'PROCESSED', '{}'),
(9, 'PHOTO', '/storage/docs/2026/09/damage_headband_copy.jpg', 'ffeeddccbbaa00112233445566778899aabbccddeeff00112233445566778899', 'damage_headphone.jpg', 'image/jpeg', 1450000, 'PROCESSED', '{}'),
-- Claim 10: Repair Parts Mismatch (Repair says Screen, Parts Invoice says Battery)
(10, 'REPAIR_REPORT', '/storage/docs/2026/10/repair_technician_log.pdf', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'technician_report.pdf', 'application/pdf', 156000, 'PROCESSED', '{"repairPart": "Liquid Retina XDR Display Module", "laborHours": 2.5}'),
(10, 'PARTS_INVOICE', '/storage/docs/2026/10/parts_billing_receipt.pdf', '123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0', 'parts_billing.pdf', 'application/pdf', 182000, 'PROCESSED', '{"billedPart": "Li-Ion Battery Pack 99.6Wh", "partCost": 249.00}');

-- -----------------------------------------------------------------------------
-- 5. Fictional Findings
-- -----------------------------------------------------------------------------
INSERT INTO finding (claim_id, assigned_to, rule_code, severity, status, description) VALUES
-- Finding 1: Duplicate invoice on Claim 2 and Claim 3
(2, 2, 'DUPLICATE_INVOICE', 'HIGH', 'UNDER_INVESTIGATION', 'Invoice number INV-DUP-99201 and file hash a1b2c3d4... submitted in Claim CLM-2026-002 also appears in Claim CLM-2026-003.'),
-- Finding 2: Serial reuse on Claim 5
(5, 2, 'SERIAL_REUSE', 'HIGH', 'OPEN', 'Serial number SN-DELL-XPS15-001 submitted in Claim CLM-2026-005 was already claimed in CLM-2026-004 within 18 days.'),
-- Finding 3: Date conflict on Claim 6
(6, 3, 'DATE_CONFLICT', 'HIGH', 'OPEN', 'Claim date 2025-11-05 is outside the manufacturer warranty window (2023-08-01 to 2024-08-01).'),
-- Finding 4: Invoice mismatch on Claim 7
(7, 3, 'INVOICE_MISMATCH', 'MEDIUM', 'OPEN', 'Invoice serial SN-DELL-WRONG-999 and model "Dell Alienware M16" conflict with product record SN-DELL-XPS15-001 (Dell XPS 15 9530).'),
-- Finding 5: Duplicate photo on Claim 8 and 9
(8, 2, 'DUPLICATE_PHOTO', 'HIGH', 'OPEN', 'Damage photograph submitted in Claim CLM-2026-008 shares identical digital hash with Claim CLM-2026-009.'),
-- Finding 6: Repair parts mismatch on Claim 10
(10, 2, 'REPAIR_PARTS_MISMATCH', 'MEDIUM', 'OPEN', 'Repair report specifies "Liquid Retina XDR Display Module" while parts invoice lists "Li-Ion Battery Pack 99.6Wh".');

-- -----------------------------------------------------------------------------
-- 6. Fictional Investigation Actions (Audit Trail)
-- -----------------------------------------------------------------------------
INSERT INTO investigation_action (finding_id, user_id, action_type, explanation, previous_status, new_status, action_time) VALUES
(1, 2, 'STATUS_CHANGE', 'Commenced formal forensic verification of duplicate invoice INV-DUP-99201 across retailer database.', 'OPEN', 'UNDER_INVESTIGATION', '2026-01-15 10:30:00Z'),
(1, 2, 'REQUEST_EVIDENCE', 'Issued request to service centre for original point-of-sale receipt verification.', 'UNDER_INVESTIGATION', 'UNDER_INVESTIGATION', '2026-01-15 14:15:00Z'),
(1, 2, 'COMMENT', 'Retailer confirmed receipt was issued once to customer A; customer B upload appears duplicated.', 'UNDER_INVESTIGATION', 'UNDER_INVESTIGATION', '2026-01-16 09:45:00Z');

-- -----------------------------------------------------------------------------
-- 7. Fictional Evidence Links
-- -----------------------------------------------------------------------------
INSERT INTO evidence_link (finding_id, document_id, evidence_role) VALUES
-- Finding 1 (DUPLICATE_INVOICE) links documents from BOTH claims!
(1, 2, 'CONFLICTING_VALUE'),
(1, 3, 'DUPLICATE_OF'),
-- Finding 2 (SERIAL_REUSE)
(2, 4, 'SUPPORTING_EVIDENCE'),
(2, 5, 'CONFLICTING_VALUE'),
-- Finding 3 (DATE_CONFLICT)
(3, 6, 'CONFLICTING_VALUE'),
-- Finding 4 (INVOICE_MISMATCH)
(4, 7, 'CONFLICTING_VALUE'),
-- Finding 5 (DUPLICATE_PHOTO)
(5, 8, 'CONFLICTING_VALUE'),
(5, 9, 'DUPLICATE_OF'),
-- Finding 6 (REPAIR_PARTS_MISMATCH)
(6, 10, 'CONFLICTING_VALUE'),
(6, 11, 'CONFLICTING_VALUE');
