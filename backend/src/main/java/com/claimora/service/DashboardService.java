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
            // Staff-scoped metrics
            long total = claimRepository.countByUser_UserId(userId);
            long submitted = claimRepository.countByUser_UserIdAndStatus(userId, ClaimStatus.SUBMITTED);
            long underReview = claimRepository.countByUser_UserIdAndStatus(userId, ClaimStatus.UNDER_REVIEW);
            long flagged = claimRepository.countByUser_UserIdAndStatus(userId, ClaimStatus.FLAGGED);
            long resolved = claimRepository.countByUser_UserIdAndStatus(userId, ClaimStatus.RESOLVED);
            double fraudRate = total > 0 ? (double) (flagged * 100) / total : 0.0;
            claimMetrics = new DashboardStatsResponse.ClaimMetrics(total, submitted, underReview, flagged, resolved, Math.round(fraudRate * 10.0) / 10.0);

            long totalFindings = findingRepository.countByClaim_User_UserId(userId);
            long openFindings = findingRepository.countByClaim_User_UserIdAndStatus(userId, FindingStatus.OPEN);
            long underInv = findingRepository.countByClaim_User_UserIdAndStatus(userId, FindingStatus.UNDER_INVESTIGATION);
            long resolvedFindings = findingRepository.countByClaim_User_UserIdAndStatus(userId, FindingStatus.RESOLVED);
            long dismissed = findingRepository.countByClaim_User_UserIdAndStatus(userId, FindingStatus.DISMISSED);
            findingMetrics = new DashboardStatsResponse.FindingMetrics(totalFindings, openFindings, underInv, resolvedFindings, dismissed, 0, 0, 0);

            topTriggeredRules = List.of();
            recentActivities = actionRepository.findTop10ByFinding_Claim_User_UserIdOrderByActionTimeDesc(userId).stream()
                    .map(InvestigationActionResponse::fromEntity)
                    .toList();
            systemMetrics = new DashboardStatsResponse.SystemMetrics(0, documentRepository.countByClaim_User_UserId(userId), 0);
        } else {
            // Admin and Investigator platform-wide metrics
            long total = claimRepository.count();
            long submitted = claimRepository.countByStatus(ClaimStatus.SUBMITTED);
            long underReview = claimRepository.countByStatus(ClaimStatus.UNDER_REVIEW);
            long flagged = claimRepository.countByStatus(ClaimStatus.FLAGGED);
            long resolved = claimRepository.countByStatus(ClaimStatus.RESOLVED);
            double fraudRate = total > 0 ? (double) (flagged * 100) / total : 0.0;
            claimMetrics = new DashboardStatsResponse.ClaimMetrics(total, submitted, underReview, flagged, resolved, Math.round(fraudRate * 10.0) / 10.0);

            long totalFindings = findingRepository.count();
            long openFindings = findingRepository.countByStatus(FindingStatus.OPEN);
            long underInv = findingRepository.countByStatus(FindingStatus.UNDER_INVESTIGATION);
            long resolvedFindings = findingRepository.countByStatus(FindingStatus.RESOLVED);
            long dismissed = findingRepository.countByStatus(FindingStatus.DISMISSED);
            long highSev = findingRepository.countBySeverity(FindingSeverity.HIGH);
            long medSev = findingRepository.countBySeverity(FindingSeverity.MEDIUM);
            long lowSev = findingRepository.countBySeverity(FindingSeverity.LOW);
            findingMetrics = new DashboardStatsResponse.FindingMetrics(totalFindings, openFindings, underInv, resolvedFindings, dismissed, highSev, medSev, lowSev);

            topTriggeredRules = findingRepository.countGroupByRuleCode().stream()
                    .map(row -> {
                        String code = (String) row[0];
                        long count = ((Number) row[1]).longValue();
                        return new RuleTriggerStat(code, formatRuleName(code), count);
                    })
                    .toList();

            recentActivities = actionRepository.findTop10ByOrderByActionTimeDesc().stream()
                    .map(InvestigationActionResponse::fromEntity)
                    .toList();

            systemMetrics = new DashboardStatsResponse.SystemMetrics(
                    productRepository.count(),
                    documentRepository.count(),
                    documentRepository.countByOcrStatus("MANUAL")
            );
        }

        return new DashboardStatsResponse(claimMetrics, findingMetrics, topTriggeredRules, recentActivities, systemMetrics);
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
            case "DUPLICATE_INVOICE" -> "Duplicate Invoice Detection";
            case "SERIAL_REUSE" -> "Serial Number Reuse";
            case "DATE_CONFLICT" -> "Warranty & Date Timeline Conflict";
            case "INVOICE_MISMATCH" -> "Invoice vs Product Mismatch";
            case "DUPLICATE_PHOTO" -> "Duplicate Photograph Detection";
            case "REPAIR_PARTS_MISMATCH" -> "Repair vs Parts Billing Mismatch";
            default -> code.replace("_", " ");
        };
    }
}
