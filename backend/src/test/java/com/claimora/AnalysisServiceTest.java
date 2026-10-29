package com.claimora;

import com.claimora.analysis.AnalysisRule;
import com.claimora.analysis.FindingDraft;
import com.claimora.dto.AnalysisResultResponse;
import com.claimora.entity.*;
import com.claimora.repository.*;
import com.claimora.security.CustomUserDetails;
import com.claimora.service.AnalysisService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnalysisServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private EvidenceDocumentRepository documentRepository;

    @Mock
    private FindingRepository findingRepository;

    @Mock
    private EvidenceLinkRepository evidenceLinkRepository;

    @Mock
    private InvestigationActionRepository actionRepository;

    @Mock
    private AnalysisRule mockRule;

    private AnalysisService analysisService;
    private Claim claim;
    private User staffUser;
    private CustomUserDetails staffDetails;
    private CustomUserDetails adminDetails;

    @BeforeEach
    void setUp() {
        staffUser = new User("Staff One", "staff@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        staffUser.setUserId(10L);

        Product product = new Product("SN-123", "Model X", LocalDate.now(), LocalDate.now(), LocalDate.now().plusYears(1));
        product.setProductId(1L);

        claim = new Claim(product, staffUser, "CLM-TEST-001", LocalDate.now(), ClaimStatus.SUBMITTED, "Issue");
        claim.setClaimId(100L);

        staffDetails = new CustomUserDetails(staffUser);

        User adminUser = new User("Admin", "admin@claimora.internal", "hash", Role.ADMIN, UserStatus.ACTIVE);
        adminUser.setUserId(1L);
        adminDetails = new CustomUserDetails(adminUser);

        analysisService = new AnalysisService(
                claimRepository,
                documentRepository,
                findingRepository,
                evidenceLinkRepository,
                actionRepository,
                List.of(mockRule),
                new ObjectMapper()
        );
    }

    @Test
    void testAnalyzeClaim_CreatesFinding_FlagsClaim_LinksEvidence() {
        when(claimRepository.findById(100L)).thenReturn(Optional.of(claim));
        when(documentRepository.findByClaim_ClaimId(100L)).thenReturn(List.of());

        // Mock rule triggering a HIGH severity finding
        FindingDraft draft = new FindingDraft("RULE_TEST", FindingSeverity.HIGH, "Test finding description");
        EvidenceDocument linkedDoc = new EvidenceDocument(claim, DocumentType.INVOICE, "/path", "hash", "f.pdf", "app/pdf", 100L, "PROCESSED", "{}");
        linkedDoc.setDocumentId(50L);
        draft.addEvidenceLink(linkedDoc, EvidenceRole.CONFLICTING_VALUE);

        when(mockRule.evaluate(any())).thenReturn(List.of(draft));
        when(findingRepository.findByClaim_ClaimId(100L)).thenReturn(List.of(), List.of(
                new Finding(claim, null, "RULE_TEST", FindingSeverity.HIGH, FindingStatus.OPEN, "Test finding description")
        ));
        when(findingRepository.saveAndFlush(any(Finding.class))).thenAnswer(invocation -> {
            Finding f = invocation.getArgument(0);
            f.setFindingId(1001L);
            return f;
        });

        AnalysisResultResponse response = analysisService.analyzeClaim(100L, adminDetails);

        assertNotNull(response);
        assertEquals(1, response.getFindingsCreated());
        assertEquals("FLAGGED", claim.getStatus().name());
        assertEquals(40, response.getScore());
        assertEquals("MEDIUM", response.getRiskLevel()); // 40 is MEDIUM (25-49)
        verify(findingRepository).saveAndFlush(any(Finding.class));
        verify(evidenceLinkRepository).saveAndFlush(any(EvidenceLink.class));
        verify(claimRepository).save(claim);
    }

    @Test
    void testAnalyzeClaim_Idempotency_PreservesResolvedFinding() {
        when(claimRepository.findById(100L)).thenReturn(Optional.of(claim));
        when(documentRepository.findByClaim_ClaimId(100L)).thenReturn(List.of());

        Finding existingResolvedFinding = new Finding(claim, null, "RULE_TEST", FindingSeverity.HIGH, FindingStatus.RESOLVED, "Old description");
        existingResolvedFinding.setFindingId(2001L);

        when(findingRepository.findByClaim_ClaimId(100L)).thenReturn(List.of(existingResolvedFinding));

        FindingDraft draft = new FindingDraft("RULE_TEST", FindingSeverity.HIGH, "New draft description");
        when(mockRule.evaluate(any())).thenReturn(List.of(draft));

        AnalysisResultResponse response = analysisService.analyzeClaim(100L, adminDetails);

        assertEquals(0, response.getFindingsCreated());
        // Status should NOT be reverted from RESOLVED
        assertEquals(FindingStatus.RESOLVED, existingResolvedFinding.getStatus());
        verify(findingRepository, never()).save(any(Finding.class));
    }

    @Test
    void testAnalyzeClaim_StaffCannotAnalyzeOtherUserClaim() {
        User otherUser = new User("Other", "other@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        otherUser.setUserId(99L);
        claim.setUser(otherUser);

        when(claimRepository.findById(100L)).thenReturn(Optional.of(claim));

        assertThrows(AccessDeniedException.class, () -> analysisService.analyzeClaim(100L, staffDetails));
    }
}
