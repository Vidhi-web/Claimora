package com.claimora.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Response payload returned after fraud-risk analysis execution on a claim.
 */
public class AnalysisResultResponse {

    private Long claimId;
    private String claimNumber;
    private String claimStatus;
    private int score;
    private String riskLevel;
    private int findingsCreated;
    private int activeFindingsCount;
    private List<String> triggeredRuleCodes = new ArrayList<>();
    private List<FindingResponse> findings = new ArrayList<>();

    public AnalysisResultResponse() {
    }

    public AnalysisResultResponse(Long claimId, String claimNumber, String claimStatus,
                                  int score, String riskLevel, int findingsCreated,
                                  int activeFindingsCount, List<String> triggeredRuleCodes,
                                  List<FindingResponse> findings) {
        this.claimId = claimId;
        this.claimNumber = claimNumber;
        this.claimStatus = claimStatus;
        this.score = score;
        this.riskLevel = riskLevel;
        this.findingsCreated = findingsCreated;
        this.activeFindingsCount = activeFindingsCount;
        this.triggeredRuleCodes = triggeredRuleCodes != null ? triggeredRuleCodes : new ArrayList<>();
        this.findings = findings != null ? findings : new ArrayList<>();
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    public String getClaimStatus() {
        return claimStatus;
    }

    public void setClaimStatus(String claimStatus) {
        this.claimStatus = claimStatus;
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

    public int getFindingsCreated() {
        return findingsCreated;
    }

    public void setFindingsCreated(int findingsCreated) {
        this.findingsCreated = findingsCreated;
    }

    public int getActiveFindingsCount() {
        return activeFindingsCount;
    }

    public void setActiveFindingsCount(int activeFindingsCount) {
        this.activeFindingsCount = activeFindingsCount;
    }

    public List<String> getTriggeredRuleCodes() {
        return triggeredRuleCodes;
    }

    public void setTriggeredRuleCodes(List<String> triggeredRuleCodes) {
        this.triggeredRuleCodes = triggeredRuleCodes;
    }

    public List<FindingResponse> getFindings() {
        return findings;
    }

    public void setFindings(List<FindingResponse> findings) {
        this.findings = findings;
    }
}
