package com.claimora.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Automated or investigator-flagged fraud finding.
 * Owner: Chinmay (Finding + analysis)
 */
@Entity
@Table(name = "finding")
public class Finding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "finding_id")
    private Long findingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @Column(name = "rule_code", nullable = false, length = 100)
    private String ruleCode;

    @Column(name = "severity", nullable = false, length = 50)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "status", nullable = false, length = 50)
    private String status = "OPEN"; // OPEN, INVESTIGATING, CONFIRMED_FRAUD, FALSE_POSITIVE, RESOLVED

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Finding() {
    }

    public Finding(Claim claim, String ruleCode, String severity, String status, String description) {
        this.claim = claim;
        this.ruleCode = ruleCode;
        this.severity = severity;
        this.status = status != null ? status : "OPEN";
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

    public String getRuleCode() {
        return ruleCode;
    }

    public void setRuleCode(String ruleCode) {
        this.ruleCode = ruleCode;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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
