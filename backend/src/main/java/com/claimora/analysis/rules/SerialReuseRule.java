package com.claimora.analysis.rules;

import com.claimora.analysis.AnalysisContext;
import com.claimora.analysis.AnalysisRule;
import com.claimora.analysis.FindingDraft;
import com.claimora.entity.Claim;
import com.claimora.entity.EvidenceDocument;
import com.claimora.entity.EvidenceRole;
import com.claimora.entity.FindingSeverity;
import org.springframework.stereotype.Component;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Rule 2: Flags repeated or overlapping warranty claims on the same product serial number.
 */
@Component
public class SerialReuseRule implements AnalysisRule {

    public static final String RULE_CODE = "SERIAL_REUSE";

    @Override
    public String getRuleCode() {
        return RULE_CODE;
    }

    @Override
    public String getRuleName() {
        return "Serial Number Reuse Detection";
    }

    @Override
    public int getWeight() {
        return 45;
    }

    @Override
    public List<FindingDraft> evaluate(AnalysisContext context) {
        List<FindingDraft> findings = new ArrayList<>();
        Claim claim = context.getClaim();

        if (claim.getProduct() == null || claim.getProduct().getSerialNumber() == null) {
            return findings;
        }

        String serialNumber = claim.getProduct().getSerialNumber();
        List<Claim> otherClaims = context.findOtherClaimsByProductSerial(serialNumber);

        if (!otherClaims.isEmpty()) {
            // Find the closest claim by date
            Claim otherClaim = otherClaims.stream()
                    .min(Comparator.comparingLong(c -> {
                        if (c.getClaimDate() != null && claim.getClaimDate() != null) {
                            return Math.abs(ChronoUnit.DAYS.between(c.getClaimDate(), claim.getClaimDate()));
                        }
                        return Long.MAX_VALUE;
                    }))
                    .orElse(otherClaims.get(0));

            long days = 0;
            if (claim.getClaimDate() != null && otherClaim.getClaimDate() != null) {
                days = Math.abs(ChronoUnit.DAYS.between(otherClaim.getClaimDate(), claim.getClaimDate()));
            }

            String description = String.format(
                    "Serial number %s submitted in Claim %s was already claimed in %s within %d days.",
                    serialNumber, claim.getClaimNumber(), otherClaim.getClaimNumber(), days
            );

            FindingDraft draft = new FindingDraft(RULE_CODE, FindingSeverity.HIGH, description);

            // Link prior claim documents as SUPPORTING_EVIDENCE
            if (otherClaim.getClaimId() != null) {
                List<EvidenceDocument> otherDocs = context.findDocumentsByClaimId(otherClaim.getClaimId());
                for (EvidenceDocument od : otherDocs) {
                    draft.addEvidenceLink(od, EvidenceRole.SUPPORTING_EVIDENCE);
                }
            }

            // Link current claim's evidence documents as CONFLICTING_VALUE
            for (EvidenceDocument doc : context.getClaimDocuments()) {
                draft.addEvidenceLink(doc, EvidenceRole.CONFLICTING_VALUE);
            }

            findings.add(draft);
        }

        return findings;
    }
}
