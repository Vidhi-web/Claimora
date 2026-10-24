package com.claimora.service;

import com.claimora.dto.*;
import com.claimora.entity.Claim;
import com.claimora.entity.ClaimStatus;
import com.claimora.entity.FindingSeverity;
import com.claimora.entity.FindingStatus;
import com.claimora.entity.Role;
import com.claimora.repository.*;
import com.claimora.security.CustomUserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for aggregating system-wide and role-scoped KPI metrics,
 * fraud rule frequencies, and summary investigation reports.
 * Optimized: uses grouped aggregate queries to minimise Supabase round-trips.
 */
@Service
public class DashboardService {

    private final ClaimRepository claimRepository;
    private final FindingRepository findingRepository;
    private final InvestigationActionRepository actionRepository;
    private final ProductRepository productRepository;
    private final EvidenceDocumentRepository documentRepository;
    private final EvidenceLinkRepository evidenceLinkRepository;

    public DashboardService(ClaimRepository claimRepository,
                            FindingRepository findingRepository,
                            InvestigationActionRepository actionRepository,
                            ProductRepository productRepository,
                            EvidenceDocumentRepository documentRepository,
                            EvidenceLinkRepository evidenceLinkRepository) {
        this.claimRepository = claimRepository;
        this.findingRepository = findingRepository;
        this.actionRepository = actionRepository;
        this.productRepository = productRepository;
        this.documentRepository = documentRepository;
        this.evidenceLinkRepository = evidenceLinkRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(CustomUserDetails userDetails) {
        boolean isStaff = userDetails != null && userDetails.getRole() == Role.STAFF;
        Long userId = userDetails != null ? userDetails.getUserId() : null;

        DashboardStatsResponse.ClaimMetrics claimMetrics;
        DashboardStatsResponse.FindingMetrics findingMetrics;
        List<RuleTriggerStat> topTriggeredRules;
        List<InvestigationActionResponse> recentActivities;
        DashboardStatsResponse.SystemMetrics systemMetrics;

        if (isStaff && userId != null) {
            // Staff: 1 claim-group query + 1 finding-group query (instead of 9 separate counts)
            long[] cc = extractClaimCounts(claimRepository.countGroupedByStatusForUser(userId));
            double fraudRate = cc[0] > 0 ? (double)(cc[3] * 100) / cc[0] : 0.0;
            claimMetrics = new DashboardStatsResponse.ClaimMetrics(cc[0], cc[1], cc[2], cc[3], cc[4],
                    Math.round(fraudRate * 10.0) / 10.0);

            long[] fc = extractFindingStatusCounts(findingRepository.countGroupedByStatusForUser(userId));
            findingMetrics = new DashboardStatsResponse.FindingMetrics(fc[0], fc[1], fc[2], fc[3], fc[4], 0, 0, 0);

            topTriggeredRules = List.of();
            recentActivities = actionRepository
                    .findTop10ByFinding_Claim_User_UserIdOrderByActionTimeDesc(userId).stream()
                    .map(InvestigationActionResponse::fromEntity).toList();
            systemMetrics = new DashboardStatsResponse.SystemMetrics(0,
                    documentRepository.countByClaim_User_UserId(userId), 0);
        } else {
            // Admin/Investigator: grouped queries (8 queries instead of 18)
            long[] cc = extractClaimCounts(claimRepository.countGroupedByStatus());
            double fraudRate = cc[0] > 0 ? (double)(cc[3] * 100) / cc[0] : 0.0;
            claimMetrics = new DashboardStatsResponse.ClaimMetrics(cc[0], cc[1], cc[2], cc[3], cc[4],
                    Math.round(fraudRate * 10.0) / 10.0);

            long[] fc = extractFindingStatusCounts(findingRepository.countGroupedByStatus());
            long highSev = 0, medSev = 0, lowSev = 0;
            for (Object[] row : findingRepository.countGroupedBySeverity()) {
                String sev = row[0].toString();
                long cnt = ((Number) row[1]).longValue();
                if ("HIGH".equals(sev)) highSev = cnt;
                else if ("MEDIUM".equals(sev)) medSev = cnt;
                else if ("LOW".equals(sev)) lowSev = cnt;
            }
            findingMetrics = new DashboardStatsResponse.FindingMetrics(
                    fc[0], fc[1], fc[2], fc[3], fc[4], highSev, medSev, lowSev);

            topTriggeredRules = findingRepository.countGroupByRuleCode().stream()
                    .map(row -> new RuleTriggerStat(
                            (String) row[0], formatRuleName((String) row[0]),
                            ((Number) row[1]).longValue()))
                    .toList();

            recentActivities = actionRepository.findTop10ByOrderByActionTimeDesc().stream()
                    .map(InvestigationActionResponse::fromEntity).toList();

            systemMetrics = new DashboardStatsResponse.SystemMetrics(
                    productRepository.count(),
                    documentRepository.count(),
                    documentRepository.countByOcrStatus("MANUAL"));
        }

        return new DashboardStatsResponse(claimMetrics, findingMetrics, topTriggeredRules, recentActivities, systemMetrics);
    }

    /** Converts grouped [[ClaimStatus, count]] rows to [total, submitted, underReview, flagged, resolved] */
    private long[] extractClaimCounts(List<Object[]> rows) {
        long submitted = 0, underReview = 0, flagged = 0, resolved = 0;
        for (Object[] row : rows) {
            String s = row[0].toString();
            long n = ((Number) row[1]).longValue();
            switch (s) {
                case "SUBMITTED"    -> submitted   = n;
                case "UNDER_REVIEW" -> underReview = n;
                case "FLAGGED"      -> flagged      = n;
                case "RESOLVED"     -> resolved     = n;
            }
        }
        return new long[]{submitted + underReview + flagged + resolved, submitted, underReview, flagged, resolved};
    }

    /** Converts grouped [[FindingStatus, count]] rows to [total, open, underInv, resolved, dismissed] */
    private long[] extractFindingStatusCounts(List<Object[]> rows) {
        long open = 0, underInv = 0, resolved = 0, dismissed = 0;
        for (Object[] row : rows) {
            String s = row[0].toString();
            long n = ((Number) row[1]).longValue();
            switch (s) {
                case "OPEN"                -> open      = n;
                case "UNDER_INVESTIGATION" -> underInv  = n;
                case "RESOLVED"            -> resolved  = n;
                case "DISMISSED"           -> dismissed = n;
            }
        }
        return new long[]{open + underInv + resolved + dismissed, open, underInv, resolved, dismissed};
    }

    @Transactional(readOnly = true)
    public ReportSummaryResponse getSummaryReport(CustomUserDetails userDetails) {
        DashboardStatsResponse stats = getDashboardStats(userDetails);

        List<Claim> flaggedEntities = claimRepository.findTop5ByStatusOrderByCreatedAtDesc(ClaimStatus.FLAGGED);
        List<ClaimResponse> flaggedSummaries = flaggedEntities.stream()
                .map(c -> {
                    long fCount = findingRepository.findByClaim_ClaimId(c.getClaimId()).size();
                    return ClaimResponse.fromEntity(c, fCount);
                })
                .toList();

        List<InvestigationActionResponse> recentAudit = actionRepository.findTop10ByOrderByActionTimeDesc().stream()
                .map(InvestigationActionResponse::fromEntity)
                .toList();

        String reportId = "RPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String generatedBy = userDetails != null ? userDetails.getUsername() : "SYSTEM";

        return new ReportSummaryResponse(
                reportId,
                Instant.now(),
                generatedBy,
                stats,
                flaggedSummaries,
                recentAudit
        );
    }

    private String formatRuleName(String code) {
        if (code == null) return "";
        return switch (code) {
            case "DUPLICATE_INVOICE"    -> "Duplicate Invoice Detection";
            case "SERIAL_REUSE"         -> "Serial Number Reuse";
            case "DATE_CONFLICT"        -> "Warranty & Date Timeline Conflict";
            case "INVOICE_MISMATCH"     -> "Invoice vs Product Mismatch";
            case "DUPLICATE_PHOTO"      -> "Duplicate Photograph Detection";
            case "REPAIR_PARTS_MISMATCH"-> "Repair vs Parts Billing Mismatch";
            default                     -> code.replace("_", " ");
        };
    }
}
