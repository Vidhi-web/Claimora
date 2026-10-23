package com.claimora.dto;

import com.claimora.entity.DocumentType;
import com.claimora.entity.EvidenceDocument;
import java.time.Instant;

/**
 * Response payload representing an uploaded evidence document.
 * Owner: Kalp (EvidenceDocument)
 */
public class EvidenceDocumentResponse {

    private Long documentId;
    private Long claimId;
    private String claimNumber;
    private DocumentType documentType;
    private String filePath;
    private String fileHash;
    private String originalFilename;
    private String mimeType;
    private Long fileSize;
    private String ocrStatus;
    private String extractedData;
    private Instant uploadDate;

    public EvidenceDocumentResponse() {
    }

    public EvidenceDocumentResponse(Long documentId, Long claimId, String claimNumber, DocumentType documentType,
                                    String filePath, String fileHash, String originalFilename, String mimeType,
                                    Long fileSize, String ocrStatus, String extractedData, Instant uploadDate) {
        this.documentId = documentId;
        this.claimId = claimId;
        this.claimNumber = claimNumber;
        this.documentType = documentType;
        this.filePath = filePath;
        this.fileHash = fileHash;
        this.originalFilename = originalFilename;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.ocrStatus = ocrStatus;
        this.extractedData = extractedData;
        this.uploadDate = uploadDate;
    }

    public static EvidenceDocumentResponse fromEntity(EvidenceDocument doc) {
        if (doc == null) return null;
        return new EvidenceDocumentResponse(
                doc.getDocumentId(),
                doc.getClaim() != null ? doc.getClaim().getClaimId() : null,
                doc.getClaim() != null ? doc.getClaim().getClaimNumber() : null,
                doc.getDocumentType(),
                doc.getFilePath(),
                doc.getFileHash(),
                doc.getOriginalFilename(),
                doc.getMimeType(),
                doc.getFileSize(),
                doc.getOcrStatus(),
                doc.getExtractedData(),
                doc.getUploadDate()
        );
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
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
