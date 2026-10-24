package com.claimora.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * High-level executive and investigator dashboard KPI metrics payload.
 */
public class DashboardStatsResponse {

    private ClaimMetrics claimMetrics;
    private FindingMetrics findingMetrics;
    private List<RuleTriggerStat> topTriggeredRules = new ArrayList<>();
    private List<InvestigationActionResponse> recentActivities = new ArrayList<>();
    private SystemMetrics systemMetrics;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(ClaimMetrics claimMetrics, FindingMetrics findingMetrics,
                                  List<RuleTriggerStat> topTriggeredRules,
                                  List<InvestigationActionResponse> recentActivities,
                                  SystemMetrics systemMetrics) {
        this.claimMetrics = claimMetrics;
        this.findingMetrics = findingMetrics;
        this.topTriggeredRules = topTriggeredRules != null ? topTriggeredRules : new ArrayList<>();
        this.recentActivities = recentActivities != null ? recentActivities : new ArrayList<>();
        this.systemMetrics = systemMetrics;
    }

    public ClaimMetrics getClaimMetrics() {
        return claimMetrics;
    }

    public void setClaimMetrics(ClaimMetrics claimMetrics) {
        this.claimMetrics = claimMetrics;
    }

    public FindingMetrics getFindingMetrics() {
        return findingMetrics;
    }

    public void setFindingMetrics(FindingMetrics findingMetrics) {
        this.findingMetrics = findingMetrics;
    }

    public List<RuleTriggerStat> getTopTriggeredRules() {
        return topTriggeredRules;
    }

    public void setTopTriggeredRules(List<RuleTriggerStat> topTriggeredRules) {
        this.topTriggeredRules = topTriggeredRules;
    }

    public List<InvestigationActionResponse> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<InvestigationActionResponse> recentActivities) {
        this.recentActivities = recentActivities;
    }

    public SystemMetrics getSystemMetrics() {
        return systemMetrics;
    }

    public void setSystemMetrics(SystemMetrics systemMetrics) {
        this.systemMetrics = systemMetrics;
    }

    public static class ClaimMetrics {
        private long totalClaims;
        private long submitted;
        private long underReview;
        private long flagged;
        private long resolved;
        private double fraudRatePercentage;

        public ClaimMetrics() {}

        public ClaimMetrics(long totalClaims, long submitted, long underReview, long flagged, long resolved, double fraudRatePercentage) {
            this.totalClaims = totalClaims;
            this.submitted = submitted;
            this.underReview = underReview;
            this.flagged = flagged;
            this.resolved = resolved;
            this.fraudRatePercentage = fraudRatePercentage;
        }

        public long getTotalClaims() { return totalClaims; }
        public void setTotalClaims(long totalClaims) { this.totalClaims = totalClaims; }
        public long getSubmitted() { return submitted; }
        public void setSubmitted(long submitted) { this.submitted = submitted; }
        public long getUnderReview() { return underReview; }
        public void setUnderReview(long underReview) { this.underReview = underReview; }
        public long getFlagged() { return flagged; }
        public void setFlagged(long flagged) { this.flagged = flagged; }
        public long getResolved() { return resolved; }
        public void setResolved(long resolved) { this.resolved = resolved; }
        public double getFraudRatePercentage() { return fraudRatePercentage; }
        public void setFraudRatePercentage(double fraudRatePercentage) { this.fraudRatePercentage = fraudRatePercentage; }
    }

    public static class FindingMetrics {
        private long totalFindings;
        private long open;
        private long underInvestigation;
        private long resolved;
        private long dismissed;
        private long highSeverity;
        private long mediumSeverity;
        private long lowSeverity;

        public FindingMetrics() {}

        public FindingMetrics(long totalFindings, long open, long underInvestigation, long resolved, long dismissed,
                              long highSeverity, long mediumSeverity, long lowSeverity) {
            this.totalFindings = totalFindings;
            this.open = open;
            this.underInvestigation = underInvestigation;
            this.resolved = resolved;
            this.dismissed = dismissed;
            this.highSeverity = highSeverity;
            this.mediumSeverity = mediumSeverity;
            this.lowSeverity = lowSeverity;
        }

        public long getTotalFindings() { return totalFindings; }
        public void setTotalFindings(long totalFindings) { this.totalFindings = totalFindings; }
        public long getOpen() { return open; }
        public void setOpen(long open) { this.open = open; }
        public long getUnderInvestigation() { return underInvestigation; }
        public void setUnderInvestigation(long underInvestigation) { this.underInvestigation = underInvestigation; }
        public long getResolved() { return resolved; }
        public void setResolved(long resolved) { this.resolved = resolved; }
        public long getDismissed() { return dismissed; }
        public void setDismissed(long dismissed) { this.dismissed = dismissed; }
        public long getHighSeverity() { return highSeverity; }
        public void setHighSeverity(long highSeverity) { this.highSeverity = highSeverity; }
        public long getMediumSeverity() { return mediumSeverity; }
        public void setMediumSeverity(long mediumSeverity) { this.mediumSeverity = mediumSeverity; }
        public long getLowSeverity() { return lowSeverity; }
        public void setLowSeverity(long lowSeverity) { this.lowSeverity = lowSeverity; }
    }

    public static class SystemMetrics {
        private long totalProducts;
        private long totalEvidenceDocuments;
        private long manualOcrCorrections;

        public SystemMetrics() {}

        public SystemMetrics(long totalProducts, long totalEvidenceDocuments, long manualOcrCorrections) {
            this.totalProducts = totalProducts;
            this.totalEvidenceDocuments = totalEvidenceDocuments;
            this.manualOcrCorrections = manualOcrCorrections;
        }

        public long getTotalProducts() { return totalProducts; }
        public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
        public long getTotalEvidenceDocuments() { return totalEvidenceDocuments; }
        public void setTotalEvidenceDocuments(long totalEvidenceDocuments) { this.totalEvidenceDocuments = totalEvidenceDocuments; }
        public long getManualOcrCorrections() { return manualOcrCorrections; }
        public void setManualOcrCorrections(long manualOcrCorrections) { this.manualOcrCorrections = manualOcrCorrections; }
    }
}
