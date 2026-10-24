package com.claimora.analysis;

import java.util.List;

/**
 * Common interface for all Claimora fraud-risk and anomaly detection rules.
 */
public interface AnalysisRule {

    /**
     * Unique business rule code (e.g. DUPLICATE_INVOICE, SERIAL_REUSE, etc.)
     */
    String getRuleCode();

    /**
     * Human-readable rule title.
     */
    String getRuleName();

    /**
     * Severity score contribution weight (0-100).
     */
    int getWeight();

    /**
     * Evaluates the claim context and returns any findings discovered.
     */
    List<FindingDraft> evaluate(AnalysisContext context);
}
