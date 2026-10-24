package com.claimora.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Executive Summary Report DTO containing high-level risk overview, flagged claim insights, and audit records.
 */
public class ReportSummaryResponse {

    private String reportId;
    private Instant generatedAt;
    private String generatedBy;
    private DashboardStatsResponse stats;
    private List<ClaimResponse> flaggedClaims = new ArrayList<>();
    private List<InvestigationActionResponse> recentAuditLog = new ArrayList<>();

    public ReportSummaryResponse() {
    }

    public ReportSummaryResponse(String reportId, Instant generatedAt, String generatedBy,
                                 DashboardStatsResponse stats, List<ClaimResponse> flaggedClaims,
                                 List<InvestigationActionResponse> recentAuditLog) {
        this.reportId = reportId;
        this.generatedAt = generatedAt;
        this.generatedBy = generatedBy;
        this.stats = stats;
        this.flaggedClaims = flaggedClaims != null ? flaggedClaims : new ArrayList<>();
        this.recentAuditLog = recentAuditLog != null ? recentAuditLog : new ArrayList<>();
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(String generatedBy) {
        this.generatedBy = generatedBy;
    }

    public DashboardStatsResponse getStats() {
        return stats;
    }

    public void setStats(DashboardStatsResponse stats) {
        this.stats = stats;
    }

    public List<ClaimResponse> getFlaggedClaims() {
        return flaggedClaims;
    }

    public void setFlaggedClaims(List<ClaimResponse> flaggedClaims) {
        this.flaggedClaims = flaggedClaims;
    }

    public List<InvestigationActionResponse> getRecentAuditLog() {
        return recentAuditLog;
    }

    public void setRecentAuditLog(List<InvestigationActionResponse> recentAuditLog) {
        this.recentAuditLog = recentAuditLog;
    }
}
