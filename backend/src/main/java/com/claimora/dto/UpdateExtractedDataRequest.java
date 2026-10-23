package com.claimora.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request to manually update or correct an OCR extracted value on an evidence document.
 * Triggers audit logging with action CORRECT_VALUE and triggers re-analysis.
 */
public class UpdateExtractedDataRequest {

    @NotBlank(message = "Extracted data JSON cannot be blank")
    private String extractedData;

    private String reason;

    public UpdateExtractedDataRequest() {
    }

    public UpdateExtractedDataRequest(String extractedData, String reason) {
        this.extractedData = extractedData;
        this.reason = reason;
    }

    public String getExtractedData() {
        return extractedData;
    }

    public void setExtractedData(String extractedData) {
        this.extractedData = extractedData;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
