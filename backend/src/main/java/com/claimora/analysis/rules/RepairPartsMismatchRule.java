package com.claimora.analysis.rules;

import com.claimora.analysis.AnalysisContext;
import com.claimora.analysis.AnalysisRule;
import com.claimora.analysis.FindingDraft;
import com.claimora.entity.DocumentType;
import com.claimora.entity.EvidenceDocument;
import com.claimora.entity.EvidenceRole;
import com.claimora.entity.FindingSeverity;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Rule 6: Flags discrepancies between technician repair report parts and billed parts invoices.
 */
@Component
public class RepairPartsMismatchRule implements AnalysisRule {

    public static final String RULE_CODE = "REPAIR_PARTS_MISMATCH";

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "a", "an", "and", "or", "for", "with", "module", "pack", "unit", "item", "part", "assembly"
    );

    @Override
    public String getRuleCode() {
        return RULE_CODE;
    }

    @Override
    public String getRuleName() {
        return "Repair Report vs Parts Invoice Mismatch";
    }

    @Override
    public int getWeight() {
        return 25;
    }

    @Override
    public List<FindingDraft> evaluate(AnalysisContext context) {
        List<FindingDraft> findings = new ArrayList<>();
        List<EvidenceDocument> repairReports = context.getClaimDocumentsByType(DocumentType.REPAIR_REPORT);
        List<EvidenceDocument> partsInvoices = context.getClaimDocumentsByType(DocumentType.PARTS_INVOICE);

        if (repairReports.isEmpty() || partsInvoices.isEmpty()) {
            return findings;
        }

        for (EvidenceDocument rep : repairReports) {
            String repairPart = context.getExtractedString(rep, "repairPart");
            if (repairPart == null || repairPart.isBlank()) {
                repairPart = context.getExtractedString(rep, "serviceNote");
            }
            if (repairPart == null || repairPart.isBlank()) {
                continue;
            }

            for (EvidenceDocument inv : partsInvoices) {
                String billedPart = context.getExtractedString(inv, "billedPart");
                if (billedPart == null || billedPart.isBlank()) {
                    billedPart = context.getExtractedString(inv, "repairPart");
                }
                if (billedPart == null || billedPart.isBlank()) {
                    continue;
                }

                if (!partsMatch(repairPart, billedPart)) {
                    String description = String.format(
                            "Repair report specifies \"%s\" while parts invoice lists \"%s\".",
                            repairPart, billedPart
                    );
                    FindingDraft draft = new FindingDraft(RULE_CODE, FindingSeverity.MEDIUM, description);
                    draft.addEvidenceLink(rep, EvidenceRole.CONFLICTING_VALUE);
                    draft.addEvidenceLink(inv, EvidenceRole.CONFLICTING_VALUE);
                    findings.add(draft);
                    return findings; // One finding per claim is sufficient
                }
            }
        }

        return findings;
    }

    private boolean partsMatch(String part1, String part2) {
        if (part1 == null || part2 == null) {
            return true;
        }
        String p1 = part1.toLowerCase().trim();
        String p2 = part2.toLowerCase().trim();

        if (p1.equals(p2) || p1.contains(p2) || p2.contains(p1)) {
            return true;
        }

        Set<String> words1 = extractKeywords(p1);
        Set<String> words2 = extractKeywords(p2);

        // Check if there is any overlapping significant keyword
        for (String w1 : words1) {
            if (words2.contains(w1)) {
                return true;
            }
        }

        return false;
    }

    private Set<String> extractKeywords(String text) {
        Set<String> set = new HashSet<>();
        String[] tokens = text.split("[^a-zA-Z0-9]+");
        for (String t : tokens) {
            String clean = t.trim().toLowerCase();
            if (clean.length() >= 3 && !STOP_WORDS.contains(clean)) {
                set.add(clean);
            }
        }
        return set;
    }
}
