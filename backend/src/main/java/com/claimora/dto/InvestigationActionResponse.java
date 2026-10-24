package com.claimora.dto;

import com.claimora.entity.ActionType;
import com.claimora.entity.FindingStatus;
import com.claimora.entity.InvestigationAction;
import java.time.Instant;

/**
 * Response payload representing an append-only investigation audit log entry.
 * Owner: Anuj (InvestigationAction)
 */
public class InvestigationActionResponse {

    private Long actionId;
    private Long findingId;
    private UserResponse user;
    private ActionType actionType;
    private String explanation;
    private FindingStatus previousStatus;
    private FindingStatus newStatus;
    private Instant actionTime;

    public InvestigationActionResponse() {
    }

    public InvestigationActionResponse(Long actionId, Long findingId, UserResponse user, ActionType actionType,
                                       String explanation, FindingStatus previousStatus, FindingStatus newStatus,
                                       Instant actionTime) {
        this.actionId = actionId;
        this.findingId = findingId;
        this.user = user;
        this.actionType = actionType;
        this.explanation = explanation;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.actionTime = actionTime;
    }

    public static InvestigationActionResponse fromEntity(InvestigationAction action) {
        if (action == null) return null;
        return new InvestigationActionResponse(
                action.getActionId(),
                action.getFinding() != null ? action.getFinding().getFindingId() : null,
                UserResponse.fromEntity(action.getUser()),
                action.getActionType(),
                action.getExplanation(),
                action.getPreviousStatus(),
                action.getNewStatus(),
                action.getActionTime()
        );
    }

    public Long getActionId() {
        return actionId;
    }

    public void setActionId(Long actionId) {
        this.actionId = actionId;
    }

    public Long getFindingId() {
        return findingId;
    }

    public void setFindingId(Long findingId) {
        this.findingId = findingId;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public ActionType getActionType() {
        return actionType;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public FindingStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(FindingStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public FindingStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(FindingStatus newStatus) {
        this.newStatus = newStatus;
    }

    public Instant getActionTime() {
        return actionTime;
    }

    public void setActionTime(Instant actionTime) {
        this.actionTime = actionTime;
    }
}
