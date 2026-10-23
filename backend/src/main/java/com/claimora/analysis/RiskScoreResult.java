package com.claimora.analysis;

import java.util.List;

/**
 * Result payload from the Fraud Risk Analysis engine.
 * Owner: Chinmay (Finding + analysis)
 */
public class RiskScoreResult {

    private Long claimId;
    private int score; // 0 to 100
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private List<String> triggeredRuleCodes;

    public RiskScoreResult() {
    }

    public RiskScoreResult(Long claimId, int score, String riskLevel, List<String> triggeredRuleCodes) {
        this.claimId = claimId;
        this.score = score;
        this.riskLevel = riskLevel;
        this.triggeredRuleCodes = triggeredRuleCodes;
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public List<String> getTriggeredRuleCodes() {
        return triggeredRuleCodes;
    }

    public void setTriggeredRuleCodes(List<String> triggeredRuleCodes) {
        this.triggeredRuleCodes = triggeredRuleCodes;
    }
}
