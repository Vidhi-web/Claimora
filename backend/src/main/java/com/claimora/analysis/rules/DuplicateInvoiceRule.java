package com.claimora.analysis.rules;

import com.claimora.analysis.AnalysisContext;
import com.claimora.analysis.AnalysisRule;
import com.claimora.analysis.FindingDraft;
import com.claimora.entity.DocumentType;
import com.claimora.entity.EvidenceDocument;
import com.claimora.entity.EvidenceRole;
import com.claimora.entity.FindingSeverity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Rule 1: Flags identical invoice numbers or duplicate invoice file hashes submitted across different claims.
 */
@Component
public class DuplicateInvoiceRule implements AnalysisRule {

    public static final String RULE_CODE = "DUPLICATE_INVOICE";

    @Override
    public String getRuleCode() {
        return RULE_CODE;
    }

    @Override
    public String getRuleName() {
        return "Duplicate Invoice Detection";
    }

    @Override
    public int getWeight() {
        return 50;
    }

    @Override
    public List<FindingDraft> evaluate(AnalysisContext context) {
        List<FindingDraft> findings = new ArrayList<>();
        List<EvidenceDocument> invoices = context.getClaimDocumentsByType(DocumentType.INVOICE);

        for (EvidenceDocument doc : invoices) {
            String invNum = context.getExtractedString(doc, "invoiceNumber");
            List<EvidenceDocument> dupesByNum = (invNum != null && !invNum.isBlank())
                    ? context.findOtherInvoicesWithInvoiceNumber(invNum)
                    : List.of();

            List<EvidenceDocument> dupesByHash = context.findOtherDocumentsByHash(doc.getFileHash()).stream()
                    .filter(d -> d.getDocumentType() == DocumentType.INVOICE)
                    .toList();

            if (!dupesByNum.isEmpty() || !dupesByHash.isEmpty()) {
                EvidenceDocument otherDoc = !dupesByNum.isEmpty() ? dupesByNum.get(0) : dupesByHash.get(0);
                String otherClaimNum = otherDoc.getClaim() != null ? otherDoc.getClaim().getClaimNumber() : "another claim";
                String currentClaimNum = context.getClaim().getClaimNumber();

                String description;
                String shortHash = doc.getFileHash() != null && doc.getFileHash().length() >= 8
                        ? doc.getFileHash().substring(0, 8) + "..."
                        : doc.getFileHash();

                if (invNum != null && !invNum.isBlank() && !dupesByHash.isEmpty()) {
                    description = String.format(
                            "Invoice number %s and file hash %s submitted in Claim %s also appears in Claim %s.",
                            invNum, shortHash, currentClaimNum, otherClaimNum
                    );
                } else if (invNum != null && !invNum.isBlank()) {
                    description = String.format(
                            "Invoice number %s submitted in Claim %s also appears in Claim %s.",
                            invNum, currentClaimNum, otherClaimNum
                    );
                } else {
                    description = String.format(
                            "Invoice document with file hash %s submitted in Claim %s also appears in Claim %s.",
                            shortHash, currentClaimNum, otherClaimNum
                    );
                }

                FindingDraft draft = new FindingDraft(RULE_CODE, FindingSeverity.HIGH, description);
                draft.addEvidenceLink(doc, EvidenceRole.CONFLICTING_VALUE);

                List<EvidenceDocument> allMatches = new ArrayList<>(dupesByNum);
                for (EvidenceDocument hd : dupesByHash) {
                    if (allMatches.stream().noneMatch(m -> m.getDocumentId().equals(hd.getDocumentId()))) {
                        allMatches.add(hd);
                    }
                }

                for (EvidenceDocument m : allMatches) {
                    draft.addEvidenceLink(m, EvidenceRole.DUPLICATE_OF);
                }

                findings.add(draft);
                break; // One finding per claim is sufficient for duplicate invoice
            }
        }

        return findings;
    }
}
