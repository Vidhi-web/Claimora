package com.claimora.dto;

import com.claimora.entity.ActionType;
import com.claimora.entity.FindingStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for appending an action to a finding timeline.
 * Owner: Anuj (InvestigationAction)
 */
public class InvestigationActionRequest {

    @NotNull(message = "Action type is required")
    private ActionType actionType;

    private String explanation;

    private FindingStatus newStatus;

    public InvestigationActionRequest() {
    }

    public InvestigationActionRequest(ActionType actionType, String explanation, FindingStatus newStatus) {
        this.actionType = actionType;
        this.explanation = explanation;
        this.newStatus = newStatus;
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

    public FindingStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(FindingStatus newStatus) {
        this.newStatus = newStatus;
    }
}
