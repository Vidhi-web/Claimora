package com.claimora.ocr;

/**
 * Result of document text extraction and OCR field extraction.
 * Owner: Kalp (EvidenceDocument)
 */
public record OcrResult(
        String rawText,
        String extractedDataJson,
        String ocrStatus
) {
    public static OcrResult empty(String status) {
        return new OcrResult("", "{}", status);
    }
}
