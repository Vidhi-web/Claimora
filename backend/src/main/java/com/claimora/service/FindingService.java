package com.claimora.service;

import com.claimora.dto.EvidenceLinkResponse;
import com.claimora.dto.FindingResponse;
import com.claimora.entity.*;
import com.claimora.exception.ResourceNotFoundException;
import com.claimora.repository.*;
import com.claimora.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for fraud findings and investigator assignments.
 * Owner: Chinmay (Finding)
 */
@Service
public class FindingService {

    private final FindingRepository findingRepository;
    private final EvidenceLinkRepository evidenceLinkRepository;
    private final InvestigationActionRepository actionRepository;
    private final UserRepository userRepository;

    public FindingService(FindingRepository findingRepository,
                          EvidenceLinkRepository evidenceLinkRepository,
                          InvestigationActionRepository actionRepository,
                          UserRepository userRepository) {
        this.findingRepository = findingRepository;
        this.evidenceLinkRepository = evidenceLinkRepository;
        this.actionRepository = actionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<FindingResponse> getFindings(FindingStatus status, FindingSeverity severity,
                                            Long assignedToId, Long claimId,
                                            CustomUserDetails userDetails, Pageable pageable) {
        Long targetAssignedToId = assignedToId;
        if (userDetails != null && userDetails.getRole() == Role.INVESTIGATOR) {
            // INVESTIGATOR is restricted to findings assigned to them
            targetAssignedToId = userDetails.getUserId();
        }

        Page<Finding> page = findingRepository.findFilteredFindings(targetAssignedToId, status, severity, claimId, pageable);
        List<Long> findingIds = page.getContent().stream().map(Finding::getFindingId).toList();
        java.util.Map<Long, Long> actionCounts = new java.util.HashMap<>();
        if (!findingIds.isEmpty()) {
            List<Object[]> rows = actionRepository.countActionsByFindingIds(findingIds);
            for (Object[] row : rows) {
                actionCounts.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
            }
        }

        return page.map(finding -> FindingResponse.fromEntity(finding, List.of(), actionCounts.getOrDefault(finding.getFindingId(), 0L)));
    }

    @Transactional(readOnly = true)
    public FindingResponse getFindingById(Long findingId, CustomUserDetails userDetails) {
        Finding finding = findingRepository.findById(findingId)
                .orElseThrow(() -> new ResourceNotFoundException("Finding not found with id: " + findingId));

        if (userDetails != null && userDetails.getRole() == Role.INVESTIGATOR) {
            if (finding.getAssignedTo() == null || !finding.getAssignedTo().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to view findings assigned to other investigators");
            }
        } else if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            if (!finding.getClaim().getUser().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to view findings for other claimants");
            }
        }

        List<EvidenceLinkResponse> linkedDocs = evidenceLinkRepository.findById_FindingId(findingId)
                .stream()
                .map(EvidenceLinkResponse::fromEntity)
                .toList();

        long actionCount = actionRepository.countByFinding_FindingId(findingId);

        return FindingResponse.fromEntity(finding, linkedDocs, actionCount);
    }

    @Transactional
    public FindingResponse assignFinding(Long findingId, Long assignedToUserId) {
        return assignFinding(findingId, assignedToUserId, null);
    }

    @Transactional
    public FindingResponse assignFinding(Long findingId, Long assignedToUserId, CustomUserDetails userDetails) {
        Finding finding = findingRepository.findById(findingId)
                .orElseThrow(() -> new ResourceNotFoundException("Finding not found with id: " + findingId));

        User assignee = userRepository.findById(assignedToUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + assignedToUserId));

        if (assignee.getRole() != Role.INVESTIGATOR && assignee.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Findings can only be assigned to INVESTIGATOR or ADMIN users");
        }

        finding.setAssignedTo(assignee);
        Finding saved = findingRepository.save(finding);

        // Audit log assignment action
        if (userDetails != null) {
            User adminUser = userRepository.findById(userDetails.getUserId()).orElse(null);
            if (adminUser != null) {
                InvestigationAction action = new InvestigationAction(
                        saved,
                        adminUser,
                        ActionType.COMMENT,
                        "Assigned finding to " + assignee.getName() + " (" + assignee.getEmail() + ")",
                        saved.getStatus(),
                        saved.getStatus()
                );
                actionRepository.save(action);
            }
        }

        List<EvidenceLinkResponse> linkedDocs = evidenceLinkRepository.findById_FindingId(findingId)
                .stream()
                .map(EvidenceLinkResponse::fromEntity)
                .toList();
        long actionCount = actionRepository.countByFinding_FindingId(findingId);

        return FindingResponse.fromEntity(saved, linkedDocs, actionCount);
    }
}
