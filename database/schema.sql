-- =============================================================================
-- Claimora Database Schema (PostgreSQL)
-- Platform: Warranty Claims Investigation & Fraud-Risk Analysis Platform
-- Source of Truth: schema.sql (JPA ddl-auto=validate)
-- =============================================================================

-- Clean up existing tables in reverse dependency order
DROP TABLE IF EXISTS evidence_link CASCADE;
DROP TABLE IF EXISTS investigation_action CASCADE;
DROP TABLE IF EXISTS finding CASCADE;
DROP TABLE IF EXISTS evidence_document CASCADE;
DROP TABLE IF EXISTS claim CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. USERS Table (Owner: Vidhi)
-- Note: Named 'users' because 'user' is a reserved keyword in PostgreSQL.
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'INVESTIGATOR', 'STAFF')),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- -----------------------------------------------------------------------------
-- 2. PRODUCT Table (Owner: Shaili)
-- Warranty start/end constraints ensure warranty period integrity.
-- -----------------------------------------------------------------------------
CREATE TABLE product (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL,
    warranty_start DATE NOT NULL,
    warranty_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_warranty_end_ge_start CHECK (warranty_end >= warranty_start)
);

CREATE INDEX idx_product_serial ON product(serial_number);
CREATE INDEX idx_product_model ON product(model);
CREATE INDEX idx_product_warranty_dates ON product(warranty_start, warranty_end);

-- -----------------------------------------------------------------------------
-- 3. CLAIM Table (Owner: Tanishka)
-- Connects a product and claimant user with a unique business claim number.
-- -----------------------------------------------------------------------------
CREATE TABLE claim (
    claim_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    claim_number VARCHAR(50) NOT NULL UNIQUE,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    issue_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_claim_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE RESTRICT,
    CONSTRAINT fk_claim_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT chk_claim_status CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'FLAGGED'))
);

CREATE INDEX idx_claim_number ON claim(claim_number);
CREATE INDEX idx_claim_product_id ON claim(product_id);
CREATE INDEX idx_claim_user_id ON claim(user_id);
CREATE INDEX idx_claim_status ON claim(status);
CREATE INDEX idx_claim_date ON claim(claim_date);

-- -----------------------------------------------------------------------------
-- 4. EVIDENCE_DOCUMENT Table (Owner: Kalp)
-- Stores metadata, digital fingerprints (hashes), and OCR/JSON extractions.
-- -----------------------------------------------------------------------------
CREATE TABLE evidence_document (
    document_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(128) NOT NULL,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evidence_claim FOREIGN KEY (claim_id) REFERENCES claim(claim_id) ON DELETE CASCADE
);

-- Non-unique index on file_hash for detecting cross-claim duplicated/fraudulent receipts
CREATE INDEX idx_evidence_file_hash ON evidence_document(file_hash);
CREATE INDEX idx_evidence_claim_id ON evidence_document(claim_id);
CREATE INDEX idx_evidence_doc_type ON evidence_document(document_type);

-- -----------------------------------------------------------------------------
-- 5. FINDING Table (Owner: Chinmay)
-- Automated rule violations, anomaly detection findings, and risk indicators.
-- -----------------------------------------------------------------------------
CREATE TABLE finding (
    finding_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    rule_code VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_finding_claim FOREIGN KEY (claim_id) REFERENCES claim(claim_id) ON DELETE CASCADE,
    CONSTRAINT chk_finding_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_finding_status CHECK (status IN ('OPEN', 'INVESTIGATING', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'RESOLVED'))
);

CREATE INDEX idx_finding_claim_id ON finding(claim_id);
CREATE INDEX idx_finding_rule_code ON finding(rule_code);
CREATE INDEX idx_finding_severity ON finding(severity);
CREATE INDEX idx_finding_status ON finding(status);

-- -----------------------------------------------------------------------------
-- 6. INVESTIGATION_ACTION Table (Owner: Anuj)
-- Append-only audit trail logging investigator decisions, comments, and state changes.
-- -----------------------------------------------------------------------------
CREATE TABLE investigation_action (
    action_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    finding_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    explanation TEXT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    action_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_action_finding FOREIGN KEY (finding_id) REFERENCES finding(finding_id) ON DELETE CASCADE,
    CONSTRAINT fk_action_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE INDEX idx_action_finding_id ON investigation_action(finding_id);
CREATE INDEX idx_action_user_id ON investigation_action(user_id);
CREATE INDEX idx_action_time ON investigation_action(action_time);

-- -----------------------------------------------------------------------------
-- 7. EVIDENCE_LINK Table (Integration Entity - Shared)
-- Many-to-many relationship linking findings directly to supporting evidence.
-- -----------------------------------------------------------------------------
CREATE TABLE evidence_link (
    finding_id BIGINT NOT NULL,
    document_id BIGINT NOT NULL,
    evidence_role VARCHAR(100) NOT NULL DEFAULT 'SUPPORTING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (finding_id, document_id),
    CONSTRAINT fk_evidence_link_finding FOREIGN KEY (finding_id) REFERENCES finding(finding_id) ON DELETE CASCADE,
    CONSTRAINT fk_evidence_link_document FOREIGN KEY (document_id) REFERENCES evidence_document(document_id) ON DELETE CASCADE
);

CREATE INDEX idx_evidence_link_document_id ON evidence_link(document_id);
