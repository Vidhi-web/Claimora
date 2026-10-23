package com.claimora.dto;

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
    private String claimNumber;
    private LocalDate claimDate;
    private String status;
    private String issueDescription;
    private Instant createdAt;

    public ClaimResponse() {
    }

    public ClaimResponse(Long claimId, Long productId, String productModel, String productSerialNumber,
                         Long userId, String claimantName, String claimNumber, LocalDate claimDate,
                         String status, String issueDescription, Instant createdAt) {
        this.claimId = claimId;
        this.productId = productId;
        this.productModel = productModel;
        this.productSerialNumber = productSerialNumber;
        this.userId = userId;
        this.claimantName = claimantName;
        this.claimNumber = claimNumber;
        this.claimDate = claimDate;
        this.status = status;
        this.issueDescription = issueDescription;
        this.createdAt = createdAt;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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
}
