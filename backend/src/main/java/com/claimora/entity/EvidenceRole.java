package com.claimora.entity;

/**
 * Role of an evidence document linked to a finding.
 * - CONFLICTING_VALUE: Document containing contradictory information
 * - DUPLICATE_OF: Document that is a duplicate or clone of another
 * - SUPPORTING_EVIDENCE: Document corroborating or providing context for the finding
 */
public enum EvidenceRole {
    CONFLICTING_VALUE,
    DUPLICATE_OF,
    SUPPORTING_EVIDENCE
}
