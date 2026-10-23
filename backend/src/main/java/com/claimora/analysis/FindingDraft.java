package com.claimora.analysis;

import com.claimora.entity.EvidenceDocument;
import com.claimora.entity.EvidenceRole;
import com.claimora.entity.FindingSeverity;

import java.util.ArrayList;
import java.util.List;

/**
 * In-memory representation of an anomaly or fraud finding produced by an AnalysisRule.
 */
public class FindingDraft {

    private final String ruleCode;
    private final FindingSeverity severity;
    private final String description;
    private final List<LinkedEvidenceDraft> evidenceLinks = new ArrayList<>();

    public FindingDraft(String ruleCode, FindingSeverity severity, String description) {
        this.ruleCode = ruleCode;
        this.severity = severity;
        this.description = description;
    }

    public FindingDraft addEvidenceLink(EvidenceDocument document, EvidenceRole role) {
        if (document != null) {
            this.evidenceLinks.add(new LinkedEvidenceDraft(document, role));
        }
        return this;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public FindingSeverity getSeverity() {
        return severity;
    }

    public String getDescription() {
        return description;
    }

    public List<LinkedEvidenceDraft> getEvidenceLinks() {
        return evidenceLinks;
    }
}
