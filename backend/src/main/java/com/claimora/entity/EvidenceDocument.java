package com.claimora.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Evidence document uploaded in support of a claim.
 * Owner: Kalp (EvidenceDocument)
 */
@Entity
@Table(name = "evidence_document", indexes = {
        @Index(name = "idx_evidence_file_hash", columnList = "file_hash"),
        @Index(name = "idx_evidence_claim_id", columnList = "claim_id"),
        @Index(name = "idx_evidence_doc_type", columnList = "document_type"),
        @Index(name = "idx_evidence_upload_date", columnList = "upload_date")
})
public class EvidenceDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private DocumentType documentType;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_hash", nullable = false, length = 128)
    private String fileHash;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "ocr_status", nullable = false, length = 50)
    private String ocrStatus = "PENDING"; // PENDING, PROCESSED, FAILED, MANUAL

    @Column(name = "extracted_data", columnDefinition = "text")
    private String extractedData = "{}";

    @Column(name = "upload_date", updatable = false)
    private Instant uploadDate = Instant.now();

    public EvidenceDocument() {
    }

    public EvidenceDocument(Claim claim, DocumentType documentType, String filePath, String fileHash,
                            String originalFilename, String mimeType, Long fileSize, String ocrStatus, String extractedData) {
        this.claim = claim;
        this.documentType = documentType;
        this.filePath = filePath;
        this.fileHash = fileHash;
        this.originalFilename = originalFilename;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.ocrStatus = ocrStatus != null ? ocrStatus : "PENDING";
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

    public DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(DocumentType documentType) {
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

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getOcrStatus() {
        return ocrStatus;
    }

    public void setOcrStatus(String ocrStatus) {
        this.ocrStatus = ocrStatus;
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
