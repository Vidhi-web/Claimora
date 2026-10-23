package com.claimora.entity;

/**
 * Types of investigation audit actions.
 * - COMMENT: Investigator note/memo
 * - REQUEST_EVIDENCE: Request additional documents/invoices
 * - CORRECT_VALUE: Correction of OCR extracted value
 * - STATUS_CHANGE: Transition between finding statuses
 * - RESOLVE: Final resolution of an alert with required explanation
 * - DISMISS: Dismissal as false positive with required explanation
 * - REOPEN: Reopening a previously resolved finding with required explanation
 */
public enum ActionType {
    COMMENT,
    REQUEST_EVIDENCE,
    CORRECT_VALUE,
    STATUS_CHANGE,
    RESOLVE,
    DISMISS,
    REOPEN
}
