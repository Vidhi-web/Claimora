package com.claimora.service;

import com.claimora.dto.InvestigationActionRequest;
import com.claimora.dto.InvestigationActionResponse;
import com.claimora.entity.*;
import com.claimora.exception.ResourceNotFoundException;
import com.claimora.exception.ValidationException;
import com.claimora.repository.ClaimRepository;
import com.claimora.repository.FindingRepository;
import com.claimora.repository.InvestigationActionRepository;
import com.claimora.repository.UserRepository;
import com.claimora.security.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service enforcing the append-only investigation audit trail and strict state transitions.
 * Owner: Anuj (InvestigationAction)
 * Core USP: "Every alert has evidence. Every correction has a history. Every resolution has a reason."
 */
@Service
public class InvestigationActionService {

    private final InvestigationActionRepository actionRepository;
    private final FindingRepository findingRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;

    public InvestigationActionService(InvestigationActionRepository actionRepository,
                                      FindingRepository findingRepository,
                                      ClaimRepository claimRepository,
                                      UserRepository userRepository) {
        this.actionRepository = actionRepository;
        this.findingRepository = findingRepository;
        this.claimRepository = claimRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<InvestigationActionResponse> getActionsForFinding(Long findingId, CustomUserDetails userDetails) {
        Finding finding = findingRepository.findById(findingId)
                .orElseThrow(() -> new ResourceNotFoundException("Finding not found with id: " + findingId));

        if (userDetails != null && userDetails.getRole() == Role.INVESTIGATOR) {
            if (finding.getAssignedTo() == null || !finding.getAssignedTo().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to view action history for findings assigned to other investigators");
            }
        } else if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            if (!finding.getClaim().getUser().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to view actions for this claim");
            }
        }

        return actionRepository.findByFinding_FindingIdOrderByActionTimeAsc(findingId)
                .stream()
                .map(InvestigationActionResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InvestigationActionResponse> getAllRecentActions(CustomUserDetails userDetails) {
        if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            return actionRepository.findTop10ByFinding_Claim_User_UserIdOrderByActionTimeDesc(userDetails.getUserId())
                    .stream()
                    .map(InvestigationActionResponse::fromEntity)
                    .toList();
        }
        return actionRepository.findTop10ByOrderByActionTimeDesc()
                .stream()
                .map(InvestigationActionResponse::fromEntity)
                .toList();
    }

    @Transactional
    public InvestigationActionResponse addAction(Long findingId, InvestigationActionRequest request, CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("Authentication required to perform investigation actions");
        }

        if (userDetails.getRole() == Role.STAFF) {
            throw new AccessDeniedException("Staff members have view-only access and cannot record investigation actions");
        }

        Finding finding = findingRepository.findById(findingId)
                .orElseThrow(() -> new ResourceNotFoundException("Finding not found with id: " + findingId));

        // Investigators can only act on findings assigned to them
        if (userDetails.getRole() == Role.INVESTIGATOR) {
            if (finding.getAssignedTo() == null || !finding.getAssignedTo().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You can only perform actions on findings assigned to you");
            }
        }

        User actingUser = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getUserId()));

        FindingStatus currentStatus = finding.getStatus();
        FindingStatus nextStatus = currentStatus;
        ActionType actionType = request.getActionType();

        // Validate state transitions & mandatory explanations
        switch (actionType) {
            case RESOLVE:
                validateExplanation(request.getExplanation(), "RESOLVE");
                validateTransition(currentStatus, FindingStatus.RESOLVED);
                nextStatus = FindingStatus.RESOLVED;
                break;

            case DISMISS:
                validateExplanation(request.getExplanation(), "DISMISS");
                validateTransition(currentStatus, FindingStatus.DISMISSED);
                nextStatus = FindingStatus.DISMISSED;
                break;

            case REOPEN:
                validateExplanation(request.getExplanation(), "REOPEN");
                validateTransition(currentStatus, FindingStatus.OPEN);
                nextStatus = FindingStatus.OPEN;
                break;

            case STATUS_CHANGE:
                if (request.getNewStatus() == null) {
                    throw new ValidationException("newStatus is required for actionType STATUS_CHANGE");
                }
                validateTransition(currentStatus, request.getNewStatus());
                nextStatus = request.getNewStatus();
                break;

            case COMMENT:
            case REQUEST_EVIDENCE:
            case CORRECT_VALUE:
                // Status does not change unless specified
                if (request.getNewStatus() != null && request.getNewStatus() != currentStatus) {
                    validateTransition(currentStatus, request.getNewStatus());
                    nextStatus = request.getNewStatus();
                }
                break;
        }

        // Create append-only action record
        InvestigationAction action = new InvestigationAction(
                finding,
                actingUser,
                actionType,
                request.getExplanation() != null ? request.getExplanation().trim() : "",
                currentStatus,
                nextStatus
        );
        InvestigationAction savedAction = actionRepository.save(action);

        // Update finding status if transitioned
        if (nextStatus != currentStatus) {
            finding.setStatus(nextStatus);
            findingRepository.save(finding);

            // Check if claim still has open findings
            Claim claim = finding.getClaim();
            List<Finding> openFindings = findingRepository.findByClaim_ClaimIdAndStatus(claim.getClaimId(), FindingStatus.OPEN);
            if (openFindings.isEmpty() && (nextStatus == FindingStatus.RESOLVED || nextStatus == FindingStatus.DISMISSED)) {
                // If all findings resolved, set claim to RESOLVED
                claim.setStatus(ClaimStatus.RESOLVED);
                claimRepository.save(claim);
            } else if (!openFindings.isEmpty()) {
                claim.setStatus(ClaimStatus.FLAGGED);
                claimRepository.save(claim);
            }
        }

        return InvestigationActionResponse.fromEntity(savedAction);
    }

    private void validateExplanation(String explanation, String actionName) {
        if (explanation == null || explanation.trim().isBlank()) {
            throw new ValidationException("Explanation is mandatory for " + actionName + " action");
        }
    }

    /**
     * Enforces allowed state machine transitions:
     * - OPEN -> UNDER_INVESTIGATION -> RESOLVED
     * - OPEN -> DISMISSED
     * - RESOLVED -> OPEN (reopen)
     */
    private void validateTransition(FindingStatus from, FindingStatus to) {
        if (from == to) return;

        boolean allowed = false;
        if (from == FindingStatus.OPEN && (to == FindingStatus.UNDER_INVESTIGATION || to == FindingStatus.DISMISSED)) {
            allowed = true;
        } else if (from == FindingStatus.UNDER_INVESTIGATION && (to == FindingStatus.RESOLVED || to == FindingStatus.DISMISSED)) {
            allowed = true;
        } else if (from == FindingStatus.RESOLVED && to == FindingStatus.OPEN) {
            allowed = true;
        } else if (from == FindingStatus.DISMISSED && to == FindingStatus.OPEN) {
            allowed = true;
        }

        if (!allowed) {
            throw new ValidationException(String.format("Invalid status transition from %s to %s", from, to));
        }
    }
}
