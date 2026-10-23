package com.claimora.analysis;

import com.claimora.entity.EvidenceDocument;
import com.claimora.entity.EvidenceRole;

/**
 * Draft linking an evidence document to a finding with a specific role.
 */
public class LinkedEvidenceDraft {

    private final EvidenceDocument document;
    private final EvidenceRole role;

    public LinkedEvidenceDraft(EvidenceDocument document, EvidenceRole role) {
        this.document = document;
        this.role = role != null ? role : EvidenceRole.SUPPORTING_EVIDENCE;
    }

    public EvidenceDocument getDocument() {
        return document;
    }

    public EvidenceRole getRole() {
        return role;
    }
}
