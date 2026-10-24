package com.claimora.dto;

import com.claimora.entity.Claim;
import com.claimora.entity.ClaimStatus;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Response payload representing a claim.
 * Ensures the Claim JPA entity is never exposed directly.
 * Owner: Tanishka (Claim)
 */
public class ClaimResponse {

    private Long claimId;
    private Long productId;
    private String productModel;
    private String productSerialNumber;
    private Long userId;
    private String claimantName;
    private String claimantEmail;
    private String claimNumber;
    private LocalDate claimDate;
    private ClaimStatus status;
    private String issueDescription;
    private Instant createdAt;
    private Instant updatedAt;
    private long openFindingsCount;

    public ClaimResponse() {
    }

    public ClaimResponse(Long claimId, Long productId, String productModel, String productSerialNumber,
                         Long userId, String claimantName, String claimantEmail, String claimNumber,
                         LocalDate claimDate, ClaimStatus status, String issueDescription,
                         Instant createdAt, Instant updatedAt, long openFindingsCount) {
        this.claimId = claimId;
        this.productId = productId;
        this.productModel = productModel;
        this.productSerialNumber = productSerialNumber;
        this.userId = userId;
        this.claimantName = claimantName;
        this.claimantEmail = claimantEmail;
        this.claimNumber = claimNumber;
        this.claimDate = claimDate;
        this.status = status;
        this.issueDescription = issueDescription;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.openFindingsCount = openFindingsCount;
    }

    public static ClaimResponse fromEntity(Claim claim) {
        return fromEntity(claim, 0);
    }

    public static ClaimResponse fromEntity(Claim claim, long openFindingsCount) {
        if (claim == null) return null;
        return new ClaimResponse(
                claim.getClaimId(),
                claim.getProduct() != null ? claim.getProduct().getProductId() : null,
                claim.getProduct() != null ? claim.getProduct().getModel() : null,
                claim.getProduct() != null ? claim.getProduct().getSerialNumber() : null,
                claim.getUser() != null ? claim.getUser().getUserId() : null,
                claim.getUser() != null ? claim.getUser().getName() : null,
                claim.getUser() != null ? claim.getUser().getEmail() : null,
                claim.getClaimNumber(),
                claim.getClaimDate(),
                claim.getStatus(),
                claim.getIssueDescription(),
                claim.getCreatedAt(),
                claim.getUpdatedAt(),
                openFindingsCount
        );
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductModel() {
        return productModel;
    }

    public void setProductModel(String productModel) {
        this.productModel = productModel;
    }

    public String getProductSerialNumber() {
        return productSerialNumber;
    }

    public void setProductSerialNumber(String productSerialNumber) {
        this.productSerialNumber = productSerialNumber;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getClaimantName() {
        return claimantName;
    }

    public void setClaimantName(String claimantName) {
        this.claimantName = claimantName;
    }

    public String getClaimantEmail() {
        return claimantEmail;
    }

    public void setClaimantEmail(String claimantEmail) {
        this.claimantEmail = claimantEmail;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    public LocalDate getClaimDate() {
        return claimDate;
    }

    public void setClaimDate(LocalDate claimDate) {
        this.claimDate = claimDate;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public long getOpenFindingsCount() {
        return openFindingsCount;
    }

    public void setOpenFindingsCount(long openFindingsCount) {
        this.openFindingsCount = openFindingsCount;
    }
}
