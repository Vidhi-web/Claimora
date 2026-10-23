package com.claimora.dto;

import com.claimora.entity.Claim;
import com.claimora.entity.Finding;
import com.claimora.entity.FindingSeverity;
import com.claimora.entity.FindingStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Response payload representing an automated fraud-risk finding.
 * Owner: Chinmay (Finding)
 */
public class FindingResponse {

    private Long findingId;
    private Long claimId;
    private String claimNumber;
    private String claimStatus;
    private String productModel;
    private String productSerialNumber;
    private UserResponse assignedTo;
    private String ruleCode;
    private FindingSeverity severity;
    private FindingStatus status;
    private String description;
    private Instant createdAt;
    private List<EvidenceLinkResponse> linkedDocuments = new ArrayList<>();
    private long actionsCount;

    public FindingResponse() {
    }

    public FindingResponse(Long findingId, Long claimId, String claimNumber, String claimStatus,
                           String productModel, String productSerialNumber, UserResponse assignedTo,
                           String ruleCode, FindingSeverity severity, FindingStatus status,
                           String description, Instant createdAt, List<EvidenceLinkResponse> linkedDocuments,
                           long actionsCount) {
        this.findingId = findingId;
        this.claimId = claimId;
        this.claimNumber = claimNumber;
        this.claimStatus = claimStatus;
        this.productModel = productModel;
        this.productSerialNumber = productSerialNumber;
        this.assignedTo = assignedTo;
        this.ruleCode = ruleCode;
        this.severity = severity;
        this.status = status;
        this.description = description;
        this.createdAt = createdAt;
        this.linkedDocuments = linkedDocuments != null ? linkedDocuments : new ArrayList<>();
        this.actionsCount = actionsCount;
    }

    public static FindingResponse fromEntity(Finding finding) {
        return fromEntity(finding, new ArrayList<>(), 0);
    }

    public static FindingResponse fromEntity(Finding finding, List<EvidenceLinkResponse> linkedDocuments, long actionsCount) {
        if (finding == null) return null;
        Claim claim = finding.getClaim();
        return new FindingResponse(
                finding.getFindingId(),
                claim != null ? claim.getClaimId() : null,
                claim != null ? claim.getClaimNumber() : null,
                claim != null && claim.getStatus() != null ? claim.getStatus().name() : null,
                claim != null && claim.getProduct() != null ? claim.getProduct().getModel() : null,
                claim != null && claim.getProduct() != null ? claim.getProduct().getSerialNumber() : null,
                UserResponse.fromEntity(finding.getAssignedTo()),
                finding.getRuleCode(),
                finding.getSeverity(),
                finding.getStatus(),
                finding.getDescription(),
                finding.getCreatedAt(),
                linkedDocuments,
                actionsCount
        );
    }

    public Long getFindingId() {
        return findingId;
    }

    public void setFindingId(Long findingId) {
        this.findingId = findingId;
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    public String getClaimStatus() {
        return claimStatus;
    }

    public void setClaimStatus(String claimStatus) {
        this.claimStatus = claimStatus;
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

    public UserResponse getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(UserResponse assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public void setRuleCode(String ruleCode) {
        this.ruleCode = ruleCode;
    }

    public FindingSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(FindingSeverity severity) {
        this.severity = severity;
    }

    public FindingStatus getStatus() {
        return status;
    }

    public void setStatus(FindingStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<EvidenceLinkResponse> getLinkedDocuments() {
        return linkedDocuments;
    }

    public void setLinkedDocuments(List<EvidenceLinkResponse> linkedDocuments) {
        this.linkedDocuments = linkedDocuments;
    }

    public long getActionsCount() {
        return actionsCount;
    }

    public void setActionsCount(long actionsCount) {
        this.actionsCount = actionsCount;
    }
}
