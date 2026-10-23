package com.claimora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Request payload for creating or submitting a warranty claim.
 * Owner: Tanishka (Claim)
 */
public class ClaimRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Claim number is required")
    private String claimNumber;

    private LocalDate claimDate;

    @NotBlank(message = "Issue description is required")
    private String issueDescription;

    public ClaimRequest() {
    }

    public ClaimRequest(Long productId, Long userId, String claimNumber, LocalDate claimDate, String issueDescription) {
        this.productId = productId;
        this.userId = userId;
        this.claimNumber = claimNumber;
        this.claimDate = claimDate;
        this.issueDescription = issueDescription;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }
}
