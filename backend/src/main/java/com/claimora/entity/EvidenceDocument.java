package com.claimora.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Evidence document uploaded in support of a claim.
 * Owner: Kalp (EvidenceDocument)
 */
@Entity
@Table(name = "evidence_document", indexes = {
        @Index(name = "idx_evidence_file_hash", columnList = "file_hash")
})
public class EvidenceDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType; // INVOICE, PHOTO_DAMAGE, RECEIPT, SERVICE_ESTIMATE

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_hash", nullable = false, length = 128)
    private String fileHash;

    @Column(name = "extracted_data", columnDefinition = "jsonb")
    private String extractedData = "{}";

    @Column(name = "upload_date", updatable = false)
    private Instant uploadDate = Instant.now();

    public EvidenceDocument() {
    }

    public EvidenceDocument(Claim claim, String documentType, String filePath, String fileHash, String extractedData) {
        this.claim = claim;
        this.documentType = documentType;
        this.filePath = filePath;
        this.fileHash = fileHash;
        this.extractedData = extractedData != null ? extractedData : "{}";
        this.uploadDate = Instant.now();
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Claim getClaim() {
        return claim;
    }

    public void setClaim(Claim claim) {
        this.claim = claim;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileHash() {
        return fileHash;
    }

    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }

    public String getExtractedData() {
        return extractedData;
    }

    public void setExtractedData(String extractedData) {
        this.extractedData = extractedData;
    }

    public Instant getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(Instant uploadDate) {
        this.uploadDate = uploadDate;
    }
}
