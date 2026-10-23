package com.claimora.controller;

import com.claimora.dto.DashboardStatsResponse;
import com.claimora.dto.ReportSummaryResponse;
import com.claimora.security.CustomUserDetails;
import com.claimora.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for generating forensic risk summaries and audit reports.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final DashboardService dashboardService;

    public ReportController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVESTIGATOR')")
    public ResponseEntity<ReportSummaryResponse> getSummaryReport(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ReportSummaryResponse report = dashboardService.getSummaryReport(userDetails);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DashboardStatsResponse> getDashboardReport(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        DashboardStatsResponse stats = dashboardService.getDashboardStats(userDetails);
        return ResponseEntity.ok(stats);
    }
}
