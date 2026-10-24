package com.claimora.ocr;

import java.nio.file.Path;

/**
 * Interface for OCR and text document parsing.
 * Supports Apache PDFBox for PDF documents and Tess4J (Tesseract) for image files.
 * Owner: Kalp (EvidenceDocument)
 */
public interface OcrService {

    /**
     * Extracts text and parses key fraud analysis fields (invoice number, serial number,
     * amounts, dates) into a JSON representation.
     *
     * If OCR fails or native libraries are missing, this method returns an empty result
     * with status FAILED, allowing upload to proceed uninterrupted.
     */
    OcrResult processDocument(Path filePath, String mimeType);
}
