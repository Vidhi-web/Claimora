package com.claimora;

import com.claimora.dto.DashboardStatsResponse;
import com.claimora.dto.ReportSummaryResponse;
import com.claimora.entity.*;
import com.claimora.repository.*;
import com.claimora.security.CustomUserDetails;
import com.claimora.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private FindingRepository findingRepository;

    @Mock
    private InvestigationActionRepository actionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private EvidenceDocumentRepository documentRepository;

    @Mock
    private EvidenceLinkRepository evidenceLinkRepository;

    private DashboardService dashboardService;
    private CustomUserDetails adminDetails;
    private CustomUserDetails staffDetails;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(
                claimRepository,
                findingRepository,
                actionRepository,
                productRepository,
                documentRepository,
                evidenceLinkRepository
        );

        User admin = new User("Admin", "admin@claimora.internal", "hash", Role.ADMIN, UserStatus.ACTIVE);
        admin.setUserId(1L);
        adminDetails = new CustomUserDetails(admin);

        User staff = new User("Staff", "staff@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        staff.setUserId(2L);
        staffDetails = new CustomUserDetails(staff);
    }

    @Test
    void testGetDashboardStats_Admin_ReturnsSystemWideMetrics() {
        when(claimRepository.count()).thenReturn(10L);
        when(claimRepository.countByStatus(ClaimStatus.SUBMITTED)).thenReturn(2L);
        when(claimRepository.countByStatus(ClaimStatus.UNDER_REVIEW)).thenReturn(1L);
        when(claimRepository.countByStatus(ClaimStatus.FLAGGED)).thenReturn(4L);
        when(claimRepository.countByStatus(ClaimStatus.RESOLVED)).thenReturn(3L);

        when(findingRepository.count()).thenReturn(6L);
        when(findingRepository.countByStatus(FindingStatus.OPEN)).thenReturn(3L);
        when(findingRepository.countByStatus(FindingStatus.UNDER_INVESTIGATION)).thenReturn(1L);
        when(findingRepository.countByStatus(FindingStatus.RESOLVED)).thenReturn(1L);
        when(findingRepository.countByStatus(FindingStatus.DISMISSED)).thenReturn(1L);
        when(findingRepository.countBySeverity(FindingSeverity.HIGH)).thenReturn(4L);
        when(findingRepository.countBySeverity(FindingSeverity.MEDIUM)).thenReturn(2L);
        when(findingRepository.countBySeverity(FindingSeverity.LOW)).thenReturn(0L);

        List<Object[]> ruleGroup = List.of(
                new Object[]{"DUPLICATE_INVOICE", 3L},
                new Object[]{"DATE_CONFLICT", 2L}
        );
        when(findingRepository.countGroupByRuleCode()).thenReturn(ruleGroup);
        when(actionRepository.findTop10ByOrderByActionTimeDesc()).thenReturn(List.of());
        when(productRepository.count()).thenReturn(5L);
        when(documentRepository.count()).thenReturn(11L);
        when(documentRepository.countByOcrStatus("MANUAL")).thenReturn(1L);

        DashboardStatsResponse stats = dashboardService.getDashboardStats(adminDetails);

        assertNotNull(stats);
        assertEquals(10L, stats.getClaimMetrics().getTotalClaims());
        assertEquals(4L, stats.getClaimMetrics().getFlagged());
        assertEquals(40.0, stats.getClaimMetrics().getFraudRatePercentage());
        assertEquals(6L, stats.getFindingMetrics().getTotalFindings());
        assertEquals(4L, stats.getFindingMetrics().getHighSeverity());
        assertEquals(2, stats.getTopTriggeredRules().size());
        assertEquals("DUPLICATE_INVOICE", stats.getTopTriggeredRules().get(0).getRuleCode());
        assertEquals(5L, stats.getSystemMetrics().getTotalProducts());
        assertEquals(11L, stats.getSystemMetrics().getTotalEvidenceDocuments());
        assertEquals(1L, stats.getSystemMetrics().getManualOcrCorrections());
    }

    @Test
    void testGetDashboardStats_Staff_ReturnsScopedMetrics() {
        when(claimRepository.countByUser_UserId(2L)).thenReturn(3L);
        when(claimRepository.countByUser_UserIdAndStatus(2L, ClaimStatus.SUBMITTED)).thenReturn(1L);
        when(claimRepository.countByUser_UserIdAndStatus(2L, ClaimStatus.UNDER_REVIEW)).thenReturn(1L);
        when(claimRepository.countByUser_UserIdAndStatus(2L, ClaimStatus.FLAGGED)).thenReturn(1L);
        when(claimRepository.countByUser_UserIdAndStatus(2L, ClaimStatus.RESOLVED)).thenReturn(0L);

        when(findingRepository.countByClaim_User_UserId(2L)).thenReturn(1L);
        when(findingRepository.countByClaim_User_UserIdAndStatus(2L, FindingStatus.OPEN)).thenReturn(1L);
        when(findingRepository.countByClaim_User_UserIdAndStatus(2L, FindingStatus.UNDER_INVESTIGATION)).thenReturn(0L);
        when(findingRepository.countByClaim_User_UserIdAndStatus(2L, FindingStatus.RESOLVED)).thenReturn(0L);
        when(findingRepository.countByClaim_User_UserIdAndStatus(2L, FindingStatus.DISMISSED)).thenReturn(0L);
        when(actionRepository.findTop10ByFinding_Claim_User_UserIdOrderByActionTimeDesc(2L)).thenReturn(List.of());
        when(documentRepository.countByClaim_User_UserId(2L)).thenReturn(2L);

        DashboardStatsResponse stats = dashboardService.getDashboardStats(staffDetails);

        assertNotNull(stats);
        assertEquals(3L, stats.getClaimMetrics().getTotalClaims());
        assertEquals(1L, stats.getClaimMetrics().getFlagged());
        assertEquals(33.3, stats.getClaimMetrics().getFraudRatePercentage());
        assertEquals(1L, stats.getFindingMetrics().getTotalFindings());
        assertEquals(2L, stats.getSystemMetrics().getTotalEvidenceDocuments());
    }

    @Test
    void testGetSummaryReport_GeneratesCompleteReport() {
        when(claimRepository.count()).thenReturn(5L);
        when(findingRepository.count()).thenReturn(2L);
        when(findingRepository.countGroupByRuleCode()).thenReturn(List.of());
        when(actionRepository.findTop10ByOrderByActionTimeDesc()).thenReturn(List.of());

        Product product = new Product("SN-1", "Model 1", LocalDate.now(), LocalDate.now(), LocalDate.now().plusYears(1));
        User user = new User("User", "u@claimora.internal", "h", Role.STAFF, UserStatus.ACTIVE);
        Claim flaggedClaim = new Claim(product, user, "CLM-FLAG-001", LocalDate.now(), ClaimStatus.FLAGGED, "Issue");
        flaggedClaim.setClaimId(50L);

        when(claimRepository.findTop5ByStatusOrderByCreatedAtDesc(ClaimStatus.FLAGGED)).thenReturn(List.of(flaggedClaim));
        when(findingRepository.findByClaim_ClaimId(50L)).thenReturn(List.of());

        ReportSummaryResponse report = dashboardService.getSummaryReport(adminDetails);

        assertNotNull(report);
        assertTrue(report.getReportId().startsWith("RPT-"));
        assertEquals("admin@claimora.internal", report.getGeneratedBy());
        assertEquals(1, report.getFlaggedClaims().size());
        assertEquals("CLM-FLAG-001", report.getFlaggedClaims().get(0).getClaimNumber());
    }
}
