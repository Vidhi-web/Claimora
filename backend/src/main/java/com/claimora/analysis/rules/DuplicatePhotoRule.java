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
 * Rule 5: Flags identical damage photograph digital fingerprints (SHA-256 hashes) uploaded across different claims.
 */
@Component
public class DuplicatePhotoRule implements AnalysisRule {

    public static final String RULE_CODE = "DUPLICATE_PHOTO";

    @Override
    public String getRuleCode() {
        return RULE_CODE;
    }

    @Override
    public String getRuleName() {
        return "Duplicate Photograph Detection";
    }

    @Override
    public int getWeight() {
        return 40;
    }

    @Override
    public List<FindingDraft> evaluate(AnalysisContext context) {
        List<FindingDraft> findings = new ArrayList<>();
        List<EvidenceDocument> photos = context.getClaimDocumentsByType(DocumentType.PHOTO);

        for (EvidenceDocument photo : photos) {
            String hash = photo.getFileHash();
            if (hash == null || hash.isBlank()) {
                continue;
            }

            List<EvidenceDocument> dupes = context.findOtherDocumentsByHash(hash).stream()
                    .filter(d -> d.getDocumentType() == DocumentType.PHOTO)
                    .toList();

            if (!dupes.isEmpty()) {
                EvidenceDocument otherPhoto = dupes.get(0);
                String otherClaimNum = otherPhoto.getClaim() != null
                        ? otherPhoto.getClaim().getClaimNumber()
                        : "another claim";
                String currentClaimNum = context.getClaim().getClaimNumber();

                String description = String.format(
                        "Damage photograph submitted in Claim %s shares identical digital hash with Claim %s.",
                        currentClaimNum, otherClaimNum
                );

                FindingDraft draft = new FindingDraft(RULE_CODE, FindingSeverity.HIGH, description);
                draft.addEvidenceLink(photo, EvidenceRole.CONFLICTING_VALUE);

                for (EvidenceDocument dp : dupes) {
                    draft.addEvidenceLink(dp, EvidenceRole.DUPLICATE_OF);
                }

                findings.add(draft);
                break; // One finding per claim for duplicate photo
            }
        }

        return findings;
    }
}
