package com.claimora.dto;

import com.claimora.entity.EvidenceLink;
import com.claimora.entity.EvidenceRole;
import java.time.Instant;

/**
 * Response payload representing a link between a finding and an evidence document.
 */
public class EvidenceLinkResponse {

    private Long findingId;
    private Long documentId;
    private EvidenceRole evidenceRole;
    private EvidenceDocumentResponse document;
    private Instant createdAt;

    public EvidenceLinkResponse() {
    }

    public EvidenceLinkResponse(Long findingId, Long documentId, EvidenceRole evidenceRole,
                                EvidenceDocumentResponse document, Instant createdAt) {
        this.findingId = findingId;
        this.documentId = documentId;
        this.evidenceRole = evidenceRole;
        this.document = document;
        this.createdAt = createdAt;
    }

    public static EvidenceLinkResponse fromEntity(EvidenceLink link) {
        if (link == null) return null;
        return new EvidenceLinkResponse(
                link.getFinding() != null ? link.getFinding().getFindingId() : null,
                link.getDocument() != null ? link.getDocument().getDocumentId() : null,
                link.getEvidenceRole(),
                EvidenceDocumentResponse.fromEntity(link.getDocument()),
                link.getCreatedAt()
        );
    }

    public Long getFindingId() {
        return findingId;
    }

    public void setFindingId(Long findingId) {
        this.findingId = findingId;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public EvidenceRole getEvidenceRole() {
        return evidenceRole;
    }

    public void setEvidenceRole(EvidenceRole evidenceRole) {
        this.evidenceRole = evidenceRole;
    }

    public EvidenceDocumentResponse getDocument() {
        return document;
    }

    public void setDocument(EvidenceDocumentResponse document) {
        this.document = document;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
