package com.claimora;

import com.claimora.dto.InvestigationActionRequest;
import com.claimora.dto.InvestigationActionResponse;
import com.claimora.entity.*;
import com.claimora.exception.ValidationException;
import com.claimora.repository.ClaimRepository;
import com.claimora.repository.FindingRepository;
import com.claimora.repository.InvestigationActionRepository;
import com.claimora.repository.UserRepository;
import com.claimora.security.CustomUserDetails;
import com.claimora.service.InvestigationActionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvestigationActionServiceTest {

    @Mock
    private InvestigationActionRepository actionRepository;

    @Mock
    private FindingRepository findingRepository;

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private UserRepository userRepository;

    private InvestigationActionService actionService;

    private User investigator;
    private CustomUserDetails investigatorDetails;
    private Finding finding;

    @BeforeEach
    void setUp() {
        actionService = new InvestigationActionService(actionRepository, findingRepository, claimRepository, userRepository);

        investigator = new User("Anuj Investigator", "anuj@claimora.internal", "hash", Role.INVESTIGATOR, UserStatus.ACTIVE);
        investigator.setUserId(2L);
        investigatorDetails = new CustomUserDetails(investigator);

        Product product = new Product("SN-1", "Model A", LocalDate.now(), LocalDate.now(), LocalDate.now().plusYears(1));
        Claim claim = new Claim(product, investigator, "CLM-100", LocalDate.now(), ClaimStatus.FLAGGED, "Issue");
        claim.setClaimId(10L);

        finding = new Finding(claim, investigator, "DUPLICATE_INVOICE", FindingSeverity.HIGH, FindingStatus.OPEN, "Duplicate invoice detected");
        finding.setFindingId(50L);
    }

    @Test
    @DisplayName("Should successfully record STATUS_CHANGE to UNDER_INVESTIGATION")
    void testTransitionToUnderInvestigation() {
        InvestigationActionRequest request = new InvestigationActionRequest(
                ActionType.STATUS_CHANGE,
                "Starting review",
                FindingStatus.UNDER_INVESTIGATION
        );

        when(findingRepository.findById(50L)).thenReturn(Optional.of(finding));
        when(userRepository.findById(2L)).thenReturn(Optional.of(investigator));
        when(actionRepository.save(any(InvestigationAction.class))).thenAnswer(i -> {
            InvestigationAction a = i.getArgument(0);
            a.setActionId(1L);
            return a;
        });

        InvestigationActionResponse response = actionService.addAction(50L, request, investigatorDetails);

        assertNotNull(response);
        assertEquals(FindingStatus.UNDER_INVESTIGATION, response.getNewStatus());
        assertEquals(FindingStatus.OPEN, response.getPreviousStatus());
        assertEquals(FindingStatus.UNDER_INVESTIGATION, finding.getStatus());
        verify(findingRepository).save(finding);
        verify(actionRepository).save(any(InvestigationAction.class));
    }

    @Test
    @DisplayName("Should throw ValidationException when RESOLVE is called without an explanation")
    void testResolveMissingExplanationThrowsValidationException() {
        finding.setStatus(FindingStatus.UNDER_INVESTIGATION);

        InvestigationActionRequest request = new InvestigationActionRequest(
                ActionType.RESOLVE,
                "", // Blank explanation
                FindingStatus.RESOLVED
        );

        when(findingRepository.findById(50L)).thenReturn(Optional.of(finding));
        when(userRepository.findById(2L)).thenReturn(Optional.of(investigator));

        ValidationException ex = assertThrows(ValidationException.class, () -> actionService.addAction(50L, request, investigatorDetails));
        assertTrue(ex.getMessage().contains("Explanation is mandatory"));
        verify(actionRepository, never()).save(any(InvestigationAction.class));
    }

    @Test
    @DisplayName("Should throw ValidationException on invalid transition (OPEN -> RESOLVED directly)")
    void testInvalidDirectTransitionThrowsValidationException() {
        InvestigationActionRequest request = new InvestigationActionRequest(
                ActionType.RESOLVE,
                "Valid explanation",
                FindingStatus.RESOLVED
        );

        when(findingRepository.findById(50L)).thenReturn(Optional.of(finding));
        when(userRepository.findById(2L)).thenReturn(Optional.of(investigator));

        ValidationException ex = assertThrows(ValidationException.class, () -> actionService.addAction(50L, request, investigatorDetails));
        assertTrue(ex.getMessage().contains("Invalid status transition"));
    }

    @Test
    @DisplayName("Staff user should receive AccessDeniedException when attempting to record an action")
    void testStaffCannotAddAction() {
        User staff = new User("Staff", "staff@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        staff.setUserId(9L);
        CustomUserDetails staffDetails = new CustomUserDetails(staff);

        InvestigationActionRequest request = new InvestigationActionRequest(ActionType.COMMENT, "Staff note", null);

        assertThrows(AccessDeniedException.class, () -> actionService.addAction(50L, request, staffDetails));
    }

    @Test
    @DisplayName("Investigator cannot act on finding assigned to someone else")
    void testInvestigatorCannotActOnUnassignedOrOtherFinding() {
        User otherInvestigator = new User("Other", "other@claimora.internal", "hash", Role.INVESTIGATOR, UserStatus.ACTIVE);
        otherInvestigator.setUserId(99L);
        finding.setAssignedTo(otherInvestigator);

        when(findingRepository.findById(50L)).thenReturn(Optional.of(finding));

        InvestigationActionRequest request = new InvestigationActionRequest(ActionType.COMMENT, "Note", null);

        assertThrows(AccessDeniedException.class, () -> actionService.addAction(50L, request, investigatorDetails));
    }
}
