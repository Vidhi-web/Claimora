package com.claimora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/**
 * Composite Primary Key for EvidenceLink.
 */
@Embeddable
public class EvidenceLinkId implements Serializable {

    @Column(name = "finding_id")
    private Long findingId;

    @Column(name = "document_id")
    private Long documentId;

    public EvidenceLinkId() {
    }

    public EvidenceLinkId(Long findingId, Long documentId) {
        this.findingId = findingId;
        this.documentId = documentId;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EvidenceLinkId that = (EvidenceLinkId) o;
        return Objects.equals(findingId, that.findingId) && Objects.equals(documentId, that.documentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(findingId, documentId);
    }
}
