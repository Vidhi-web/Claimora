package com.claimora.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Automated or investigator-flagged fraud finding.
 * Owner: Chinmay (Finding + analysis)
 */
@Entity
@Table(name = "finding", indexes = {
        @Index(name = "idx_finding_claim_id", columnList = "claim_id"),
        @Index(name = "idx_finding_assigned_to", columnList = "assigned_to"),
        @Index(name = "idx_finding_rule_code", columnList = "rule_code"),
        @Index(name = "idx_finding_severity", columnList = "severity"),
        @Index(name = "idx_finding_status", columnList = "status")
})
public class Finding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "finding_id")
    private Long findingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "rule_code", nullable = false, length = 100)
    private String ruleCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 50)
    private FindingSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private FindingStatus status = FindingStatus.OPEN;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Finding() {
    }

    public Finding(Claim claim, User assignedTo, String ruleCode, FindingSeverity severity, FindingStatus status, String description) {
        this.claim = claim;
        this.assignedTo = assignedTo;
        this.ruleCode = ruleCode;
        this.severity = severity;
        this.status = status != null ? status : FindingStatus.OPEN;
        this.description = description;
        this.createdAt = Instant.now();
    }

    public Long getFindingId() {
        return findingId;
    }

    public void setFindingId(Long findingId) {
        this.findingId = findingId;
    }

    public Claim getClaim() {
        return claim;
    }

    public void setClaim(Claim claim) {
        this.claim = claim;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
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
}
