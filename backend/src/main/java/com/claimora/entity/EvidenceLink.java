package com.claimora.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Join entity linking findings directly to supporting evidence documents.
 * Integration entity (Shared).
 */
@Entity
@Table(name = "evidence_link", indexes = {
        @Index(name = "idx_evidence_link_document_id", columnList = "document_id"),
        @Index(name = "idx_evidence_link_role", columnList = "evidence_role")
})
public class EvidenceLink {

    @EmbeddedId
    private EvidenceLinkId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("findingId")
    @JoinColumn(name = "finding_id", nullable = false)
    private Finding finding;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("documentId")
    @JoinColumn(name = "document_id", nullable = false)
    private EvidenceDocument document;

    @Enumerated(EnumType.STRING)
    @Column(name = "evidence_role", nullable = false, length = 100)
    private EvidenceRole evidenceRole = EvidenceRole.SUPPORTING_EVIDENCE;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public EvidenceLink() {
    }

    public EvidenceLink(Finding finding, EvidenceDocument document, EvidenceRole evidenceRole) {
        this.id = new EvidenceLinkId(finding.getFindingId(), document.getDocumentId());
        this.finding = finding;
        this.document = document;
        this.evidenceRole = evidenceRole != null ? evidenceRole : EvidenceRole.SUPPORTING_EVIDENCE;
        this.createdAt = Instant.now();
    }

    public EvidenceLinkId getId() {
        return id;
    }

    public void setId(EvidenceLinkId id) {
        this.id = id;
    }

    public Finding getFinding() {
        return finding;
    }

    public void setFinding(Finding finding) {
        this.finding = finding;
    }

    public EvidenceDocument getDocument() {
        return document;
    }

    public void setDocument(EvidenceDocument document) {
        this.document = document;
    }

    public EvidenceRole getEvidenceRole() {
        return evidenceRole;
    }

    public void setEvidenceRole(EvidenceRole evidenceRole) {
        this.evidenceRole = evidenceRole;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
