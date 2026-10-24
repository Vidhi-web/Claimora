package com.claimora.entity;

/**
 * Investigation lifecycle status of a finding.
 * Transitions:
 * - OPEN -> UNDER_INVESTIGATION -> RESOLVED
 * - OPEN -> DISMISSED
 * - RESOLVED -> OPEN (reopen)
 */
public enum FindingStatus {
    OPEN,
    UNDER_INVESTIGATION,
    RESOLVED,
    DISMISSED
}
