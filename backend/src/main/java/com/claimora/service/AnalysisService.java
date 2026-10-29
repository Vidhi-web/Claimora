package com.claimora.service;

import com.claimora.analysis.AnalysisContext;
import com.claimora.analysis.AnalysisRule;
import com.claimora.analysis.FindingDraft;
import com.claimora.analysis.LinkedEvidenceDraft;
import com.claimora.dto.AnalysisResultResponse;
import com.claimora.dto.EvidenceLinkResponse;
import com.claimora.dto.FindingResponse;
import com.claimora.entity.*;
import com.claimora.exception.ResourceNotFoundException;
import com.claimora.repository.*;
import com.claimora.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Core Fraud Risk Analysis Engine Service.
 * Evaluates claims against all registered AnalysisRule implementations,
 * generates findings idempotently, populates cross-claim evidence links,
 * and updates claim status without auto-rejecting.
 * Owner: Chinmay (Finding + analysis)
 */
@Service
public class AnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);

    private final ClaimRepository claimRepository;
    private final EvidenceDocumentRepository documentRepository;
    private final FindingRepository findingRepository;
    private final EvidenceLinkRepository evidenceLinkRepository;
    private final InvestigationActionRepository actionRepository;
    private final List<AnalysisRule> rules;
    private final ObjectMapper objectMapper;
    private final jakarta.persistence.EntityManager entityManager;

    public AnalysisService(ClaimRepository claimRepository,
                           EvidenceDocumentRepository documentRepository,
                           FindingRepository findingRepository,
                           EvidenceLinkRepository evidenceLinkRepository,
                           InvestigationActionRepository actionRepository,
                           List<AnalysisRule> rules,
                           ObjectMapper objectMapper) {
        this(claimRepository, documentRepository, findingRepository, evidenceLinkRepository, actionRepository, rules, objectMapper, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AnalysisService(ClaimRepository claimRepository,
                           EvidenceDocumentRepository documentRepository,
                           FindingRepository findingRepository,
                           EvidenceLinkRepository evidenceLinkRepository,
                           InvestigationActionRepository actionRepository,
                           List<AnalysisRule> rules,
                           @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper,
                           @org.springframework.beans.factory.annotation.Autowired(required = false) jakarta.persistence.EntityManager entityManager) {
        this.claimRepository = claimRepository;
        this.documentRepository = documentRepository;
        this.findingRepository = findingRepository;
        this.evidenceLinkRepository = evidenceLinkRepository;
        this.actionRepository = actionRepository;
        this.rules = rules != null ? rules : List.of();
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.entityManager = entityManager;
    }

    @Transactional
    public AnalysisResultResponse analyzeClaim(Long claimId, CustomUserDetails userDetails) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        // Enforce RBAC access checks
        if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            if (!claim.getUser().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to analyze claims belonging to other claimants");
            }
        }

        List<EvidenceDocument> claimDocuments = documentRepository.findByClaim_ClaimId(claimId);
        AnalysisContext context = new AnalysisContext(claim, claimDocuments, documentRepository, claimRepository, objectMapper);

        int findingsCreated = 0;
        List<String> triggeredRuleCodes = new ArrayList<>();

        for (AnalysisRule rule : rules) {
            try {
                List<FindingDraft> drafts = rule.evaluate(context);
                for (FindingDraft draft : drafts) {
                    triggeredRuleCodes.add(draft.getRuleCode());

                    // Check for existing finding on this claim with the same ruleCode (Idempotency)
                    Optional<Finding> existingFindingOpt = findingRepository.findByClaim_ClaimId(claimId).stream()
                            .filter(f -> f.getRuleCode().equals(draft.getRuleCode()))
                            .findFirst();

                    Finding targetFinding;
                    if (existingFindingOpt.isPresent()) {
                        targetFinding = existingFindingOpt.get();
                        // If finding is already RESOLVED or DISMISSED, preserve human decision
                        log.info("Finding for rule {} already exists on claim {} with status {}. Preserving state.",
                                draft.getRuleCode(), claimId, targetFinding.getStatus());
                    } else {
                        // Create brand new finding
                        Finding newFinding = new Finding(
                                claim,
                                null, // unassigned by default
                                draft.getRuleCode(),
                                draft.getSeverity(),
                                FindingStatus.OPEN,
                                draft.getDescription()
                        );
                        targetFinding = findingRepository.saveAndFlush(newFinding);
                        findingsCreated++;
                        log.info("Created new finding #{} for rule {} on claim {}",
                                targetFinding.getFindingId(), draft.getRuleCode(), claimId);
                    }

                    // Populate evidence links idempotently
                    for (LinkedEvidenceDraft linkDraft : draft.getEvidenceLinks()) {
                        EvidenceDocument doc = linkDraft.getDocument();
                        if (doc != null && doc.getDocumentId() != null && targetFinding != null && targetFinding.getFindingId() != null) {
                            EvidenceLinkId linkId = new EvidenceLinkId(targetFinding.getFindingId(), doc.getDocumentId());
                            if (!evidenceLinkRepository.existsById(linkId)) {
                                EvidenceLink link = new EvidenceLink(targetFinding, doc, linkDraft.getRole());
                                evidenceLinkRepository.saveAndFlush(link);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error evaluating rule {} on claim {}: {}", rule.getRuleCode(), claimId, e.getMessage(), e);
            }
        }

        // Query all findings for the claim after analysis
        List<Finding> allFindings = findingRepository.findByClaim_ClaimId(claimId);
        List<Finding> activeFindings = allFindings.stream()
                .filter(f -> f.getStatus() == FindingStatus.OPEN || f.getStatus() == FindingStatus.UNDER_INVESTIGATION)
                .toList();

        // Flag claim if active findings exist and claim is not already resolved or flagged
        if (!activeFindings.isEmpty()) {
            if (claim.getStatus() == ClaimStatus.SUBMITTED || claim.getStatus() == ClaimStatus.UNDER_REVIEW) {
                claim.setStatus(ClaimStatus.FLAGGED);
                claimRepository.save(claim);
                log.info("Claim #{} status updated to FLAGGED due to {} active findings", claimId, activeFindings.size());
            }
        }

        // Calculate risk score (0-100) and risk level
        int score = 0;
        for (Finding f : activeFindings) {
            if (f.getSeverity() == FindingSeverity.HIGH) {
                score += 40;
            } else if (f.getSeverity() == FindingSeverity.MEDIUM) {
                score += 25;
            } else {
                score += 10;
            }
        }
        score = Math.min(100, score);

        String riskLevel = "LOW";
        if (score >= 75) {
            riskLevel = "CRITICAL";
        } else if (score >= 50) {
            riskLevel = "HIGH";
        } else if (score >= 25) {
            riskLevel = "MEDIUM";
        }

        // Build FindingResponse DTOs with their linked documents
        List<FindingResponse> findingResponses = allFindings.stream()
                .map(f -> {
                    List<EvidenceLinkResponse> links = evidenceLinkRepository.findById_FindingId(f.getFindingId()).stream()
                            .map(EvidenceLinkResponse::fromEntity)
                            .toList();
                    long actionCount = actionRepository.countByFinding_FindingId(f.getFindingId());
                    return FindingResponse.fromEntity(f, links, actionCount);
                })
                .toList();

        return new AnalysisResultResponse(
                claim.getClaimId(),
                claim.getClaimNumber(),
                claim.getStatus() != null ? claim.getStatus().name() : null,
                score,
                riskLevel,
                findingsCreated,
                activeFindings.size(),
                triggeredRuleCodes,
                findingResponses
        );
    }
}
