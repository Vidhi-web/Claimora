package com.claimora.service;

import com.claimora.dto.ClaimRequest;
import com.claimora.dto.ClaimResponse;
import com.claimora.entity.*;
import java.util.List;
import com.claimora.exception.ResourceNotFoundException;
import com.claimora.exception.ValidationException;
import com.claimora.repository.ClaimRepository;
import com.claimora.repository.FindingRepository;
import com.claimora.repository.ProductRepository;
import com.claimora.repository.UserRepository;
import com.claimora.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for Claim lifecycle and role-based data filtering.
 * Owner: Tanishka (Claim)
 */
@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FindingRepository findingRepository;

    public ClaimService(ClaimRepository claimRepository, ProductRepository productRepository,
                        UserRepository userRepository, FindingRepository findingRepository) {
        this.claimRepository = claimRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.findingRepository = findingRepository;
    }

    @Transactional(readOnly = true)
    public Page<ClaimResponse> getClaims(String search, ClaimStatus status, CustomUserDetails userDetails, Pageable pageable) {
        Long filterUserId = null;
        if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            filterUserId = userDetails.getUserId();
        }

        Page<Claim> claimsPage = claimRepository.findFilteredClaims(filterUserId, status, search, pageable);
        List<Long> claimIds = claimsPage.getContent().stream().map(Claim::getClaimId).toList();
        java.util.Map<Long, Long> openCounts = new java.util.HashMap<>();
        if (!claimIds.isEmpty()) {
            List<Object[]> rows = findingRepository.countByClaimIdsAndStatus(claimIds, FindingStatus.OPEN);
            for (Object[] row : rows) {
                openCounts.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
            }
        }

        return claimsPage.map(claim -> ClaimResponse.fromEntity(claim, openCounts.getOrDefault(claim.getClaimId(), 0L)));
    }

    @Transactional(readOnly = true)
    public ClaimResponse getClaimById(Long claimId, CustomUserDetails userDetails) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            if (!claim.getUser().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to access claims submitted by other users");
            }
        }

        long openCount = findingRepository.findByClaim_ClaimIdAndStatus(claim.getClaimId(), FindingStatus.OPEN).size();
        return ClaimResponse.fromEntity(claim, openCount);
    }

    @Transactional
    public ClaimResponse createClaim(ClaimRequest request, CustomUserDetails userDetails) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (claimRepository.existsByClaimNumber(request.getClaimNumber().trim())) {
            throw new ValidationException("Claim number " + request.getClaimNumber() + " already exists");
        }

        Long resolvedUserId = request.getUserId();
        if (resolvedUserId == null) {
            if (userDetails != null) {
                resolvedUserId = userDetails.getUserId();
            } else {
                throw new ValidationException("Claimant user ID is required");
            }
        }
        final Long targetUserId = resolvedUserId;

        User claimant = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetUserId));

        Claim claim = new Claim(
                product,
                claimant,
                request.getClaimNumber().trim(),
                request.getClaimDate(),
                ClaimStatus.SUBMITTED,
                request.getIssueDescription()
        );

        Claim saved = claimRepository.save(claim);
        return ClaimResponse.fromEntity(saved, 0);
    }
}
