package com.claimora.service;

import com.claimora.dto.ClaimRequest;
import com.claimora.dto.ClaimResponse;
import com.claimora.entity.Claim;
import com.claimora.entity.Product;
import com.claimora.entity.User;
import com.claimora.exception.ResourceNotFoundException;
import com.claimora.exception.ValidationException;
import com.claimora.repository.ClaimRepository;
import com.claimora.repository.ProductRepository;
import com.claimora.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing claims intake, lifecycle, and DTO conversion.
 * Owner: Tanishka (Claim)
 */
@Service
@Transactional
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ClaimService(ClaimRepository claimRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.claimRepository = claimRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getAllClaims() {
        return claimRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaimsByStatus(String status) {
        return claimRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClaimResponse getClaimById(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", claimId));
        return mapToResponse(claim);
    }

    public ClaimResponse createClaim(ClaimRequest request) {
        if (claimRepository.existsByClaimNumber(request.getClaimNumber())) {
            throw new ValidationException("Claim with number '" + request.getClaimNumber() + "' already exists");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        LocalDate claimDate = request.getClaimDate() != null ? request.getClaimDate() : LocalDate.now();

        Claim claim = new Claim(
                product,
                user,
                request.getClaimNumber(),
                claimDate,
                "SUBMITTED",
                request.getIssueDescription()
        );

        Claim savedClaim = claimRepository.save(claim);
        return mapToResponse(savedClaim);
    }

    private ClaimResponse mapToResponse(Claim claim) {
        return new ClaimResponse(
                claim.getClaimId(),
                claim.getProduct() != null ? claim.getProduct().getProductId() : null,
                claim.getProduct() != null ? claim.getProduct().getModel() : null,
                claim.getProduct() != null ? claim.getProduct().getSerialNumber() : null,
                claim.getUser() != null ? claim.getUser().getUserId() : null,
                claim.getUser() != null ? claim.getUser().getName() : null,
                claim.getClaimNumber(),
                claim.getClaimDate(),
                claim.getStatus(),
                claim.getIssueDescription(),
                claim.getCreatedAt()
        );
    }
}
