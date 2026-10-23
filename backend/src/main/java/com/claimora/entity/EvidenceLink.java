package com.claimora.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Join entity linking findings directly to supporting evidence documents.
 * Integration work (Shared).
 */
@Entity
@Table(name = "evidence_link")
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

    @Column(name = "evidence_role", nullable = false, length = 100)
    private String evidenceRole = "SUPPORTING";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public EvidenceLink() {
    }

    public EvidenceLink(Finding finding, EvidenceDocument document, String evidenceRole) {
        this.id = new EvidenceLinkId(finding.getFindingId(), document.getDocumentId());
        this.finding = finding;
        this.document = document;
        this.evidenceRole = evidenceRole != null ? evidenceRole : "SUPPORTING";
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

    public String getEvidenceRole() {
        return evidenceRole;
    }

    public void setEvidenceRole(String evidenceRole) {
        this.evidenceRole = evidenceRole;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
