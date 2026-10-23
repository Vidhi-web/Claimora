package com.claimora.analysis.rules;

import com.claimora.analysis.AnalysisContext;
import com.claimora.analysis.AnalysisRule;
import com.claimora.analysis.FindingDraft;
import com.claimora.entity.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Rule 3: Flags claims submitted outside the warranty coverage period, or with conflicting document dates.
 */
@Component
public class DateConflictRule implements AnalysisRule {

    public static final String RULE_CODE = "DATE_CONFLICT";

    @Override
    public String getRuleCode() {
        return RULE_CODE;
    }

    @Override
    public String getRuleName() {
        return "Warranty & Document Date Conflict Detection";
    }

    @Override
    public int getWeight() {
        return 50;
    }

    @Override
    public List<FindingDraft> evaluate(AnalysisContext context) {
        List<FindingDraft> findings = new ArrayList<>();
        Claim claim = context.getClaim();
        Product product = claim.getProduct();
        LocalDate claimDate = claim.getClaimDate();

        // Check 1: Claim date vs Product warranty window
        if (product != null && claimDate != null) {
            LocalDate warrantyEnd = product.getWarrantyEnd();
            LocalDate warrantyStart = product.getWarrantyStart();

            if (warrantyEnd != null && claimDate.isAfter(warrantyEnd)) {
                String desc = String.format(
                        "Claim date %s is outside the manufacturer warranty window (%s to %s).",
                        claimDate, warrantyStart, warrantyEnd
                );
                FindingDraft draft = new FindingDraft(RULE_CODE, FindingSeverity.HIGH, desc);
                for (EvidenceDocument doc : context.getClaimDocuments()) {
                    draft.addEvidenceLink(doc, EvidenceRole.CONFLICTING_VALUE);
                }
                findings.add(draft);
                return findings;
            }

            if (warrantyStart != null && claimDate.isBefore(warrantyStart)) {
                String desc = String.format(
                        "Claim date %s is prior to manufacturer warranty start date %s.",
                        claimDate, warrantyStart
                );
                FindingDraft draft = new FindingDraft(RULE_CODE, FindingSeverity.HIGH, desc);
                for (EvidenceDocument doc : context.getClaimDocuments()) {
                    draft.addEvidenceLink(doc, EvidenceRole.CONFLICTING_VALUE);
                }
                findings.add(draft);
                return findings;
            }
        }

        // Check 2: Invoice date vs Claim date
        List<EvidenceDocument> invoices = context.getClaimDocumentsByType(DocumentType.INVOICE);
        for (EvidenceDocument inv : invoices) {
            LocalDate invDate = context.getExtractedLocalDate(inv, "invoiceDate");
            if (invDate != null && claimDate != null && invDate.isAfter(claimDate)) {
                String desc = String.format(
                        "Invoice date %s is after claim submission date %s.",
                        invDate, claimDate
                );
                FindingDraft draft = new FindingDraft(RULE_CODE, FindingSeverity.HIGH, desc);
                draft.addEvidenceLink(inv, EvidenceRole.CONFLICTING_VALUE);
                findings.add(draft);
                return findings;
            }
        }

        // Check 3: Repair report date vs Product purchase date
        List<EvidenceDocument> repairReports = context.getClaimDocumentsByType(DocumentType.REPAIR_REPORT);
        for (EvidenceDocument rep : repairReports) {
            LocalDate repDate = context.getExtractedLocalDate(rep, "repairDate");
            if (repDate != null && product != null && product.getPurchaseDate() != null && repDate.isBefore(product.getPurchaseDate())) {
                String desc = String.format(
                        "Repair report date %s precedes registered product purchase date %s.",
                        repDate, product.getPurchaseDate()
                );
                FindingDraft draft = new FindingDraft(RULE_CODE, FindingSeverity.HIGH, desc);
                draft.addEvidenceLink(rep, EvidenceRole.CONFLICTING_VALUE);
                findings.add(draft);
                return findings;
            }
        }

        return findings;
    }
}
