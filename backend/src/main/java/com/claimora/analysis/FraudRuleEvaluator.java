package com.claimora.analysis;

import com.claimora.entity.Claim;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Core fraud risk rule evaluator for warranty claims.
 * Owner: Chinmay (Finding + analysis)
 */
@Component
public class FraudRuleEvaluator {

    /**
     * Evaluates a warranty claim against automated business fraud rules.
     */
    public RiskScoreResult evaluateClaim(Claim claim) {
        List<String> triggeredRules = new ArrayList<>();
        int score = 0;

        if (claim.getProduct() != null) {
            LocalDate warrantyEnd = claim.getProduct().getWarrantyEnd();
            LocalDate claimDate = claim.getClaimDate();

            if (claimDate != null && warrantyEnd != null && claimDate.isAfter(warrantyEnd)) {
                triggeredRules.add("RULE_WARRANTY_EXPIRED");
                score += 50;
            }
        }

        String riskLevel = "LOW";
        if (score >= 75) {
            riskLevel = "CRITICAL";
        } else if (score >= 50) {
            riskLevel = "HIGH";
        } else if (score >= 25) {
            riskLevel = "MEDIUM";
        }

        return new RiskScoreResult(claim.getClaimId(), score, riskLevel, triggeredRules);
    }
}
