package com.claimora.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Append-only audit trail capturing investigator actions and state transitions.
 * Owner: Anuj (InvestigationAction)
 */
@Entity
@Table(name = "investigation_action", indexes = {
        @Index(name = "idx_action_finding_id", columnList = "finding_id"),
        @Index(name = "idx_action_user_id", columnList = "user_id"),
        @Index(name = "idx_action_time", columnList = "action_time")
})
public class InvestigationAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "action_id")
    private Long actionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finding_id", nullable = false)
    private Finding finding;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 100)
    private ActionType actionType;

    @Column(name = "explanation", nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 50)
    private FindingStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 50)
    private FindingStatus newStatus;

    @Column(name = "action_time", nullable = false, updatable = false)
    private Instant actionTime = Instant.now();

    public InvestigationAction() {
    }

    public InvestigationAction(Finding finding, User user, ActionType actionType, String explanation,
                               FindingStatus previousStatus, FindingStatus newStatus) {
        this.finding = finding;
        this.user = user;
        this.actionType = actionType;
        this.explanation = explanation;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.actionTime = Instant.now();
    }

    public Long getActionId() {
        return actionId;
    }

    public void setActionId(Long actionId) {
        this.actionId = actionId;
    }

    public Finding getFinding() {
        return finding;
    }

    public void setFinding(Finding finding) {
        this.finding = finding;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
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
