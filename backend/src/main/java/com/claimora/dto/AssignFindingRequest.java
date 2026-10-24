package com.claimora.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request to assign or reassign a finding to an investigator.
 * Accessible to ADMIN.
 */
public class AssignFindingRequest {

    @NotNull(message = "Assigned user ID is required")
    private Long assignedToUserId;

    public AssignFindingRequest() {
    }

    public AssignFindingRequest(Long assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public Long getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(Long assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }
}
