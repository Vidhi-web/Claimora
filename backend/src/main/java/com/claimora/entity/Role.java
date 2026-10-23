package com.claimora.entity;

/**
 * System roles for Claimora platform.
 * Enforced on backend via Spring Security (@PreAuthorize).
 * - ADMIN: Full access, user management, system config.
 * - INVESTIGATOR: Assigned findings, fraud analysis, resolution actions.
 * - STAFF: Claim creation, evidence document uploads, read-only findings.
 */
public enum Role {
    ADMIN,
    INVESTIGATOR,
    STAFF
}
