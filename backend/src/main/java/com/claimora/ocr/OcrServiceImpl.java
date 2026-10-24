package com.claimora.ocr;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Implementation of OcrService utilizing Apache PDFBox for PDFs
 * and Tess4J (Tesseract) for scanned images.
 * Owner: Kalp (EvidenceDocument)
 */
@Service
public class OcrServiceImpl implements OcrService {

    private static final Logger log = LoggerFactory.getLogger(OcrServiceImpl.class);

    // Regex patterns for structured field extraction
    private static final Pattern INVOICE_PATTERN = Pattern.compile(
            "\\b(INV-[A-Z0-9-]+)\\b|(?i)(?:invoice|inv|bill)\\s*(?:#|no|num|number)?[:.]\\s*([A-Z0-9-]+)"
    );

    private static final Pattern SERIAL_PATTERN = Pattern.compile(
            "\\b(SN-[A-Z0-9-]+)\\b|(?i)(?:serial|sn|s/n)\\s*(?:#|no|num|number)?[:.]\\s*([A-Z0-9-]+)"
    );

    private static final Pattern AMOUNT_PATTERN = Pattern.compile(
            "(?i)(?:total|amount|grand\\s*total|cost|price|balance)?\\s*[$€£]?\\s*([0-9]{1,3}(?:,[0-9]{3})*\\.[0-9]{2})"
    );

    private static final Pattern DATE_PATTERN = Pattern.compile(
            "\\b(\\d{4}-\\d{2}-\\d{2})\\b|\\b(\\d{2}/\\d{2}/\\d{4})\\b"
    );

    private static final Pattern PART_PATTERN = Pattern.compile(
            "(?i)(?:part|replaced|module|component|repaired)\\s*[:.\\s]*([A-Za-z0-9\\s-]{3,40})"
    );

    @Value("${claimora.ocr.tessdata-path:}")
    private String tessdataPath;

    @Override
    public OcrResult processDocument(Path filePath, String mimeType) {
        if (filePath == null) {
            return OcrResult.empty("FAILED");
        }

        File file = filePath.toFile();
        if (!file.exists() || !file.canRead()) {
            log.warn("Document file does not exist or cannot be read: {}", filePath);
            return OcrResult.empty("FAILED");
        }

        String rawText = "";
        String normalizedMime = mimeType != null ? mimeType.toLowerCase() : "";
        String filename = file.getName().toLowerCase();

        try {
            if (normalizedMime.contains("pdf") || filename.endsWith(".pdf")) {
                rawText = extractTextFromPdf(file);
            } else if (normalizedMime.startsWith("image/") || filename.endsWith(".png") || filename.endsWith(".jpg") || filename.endsWith(".jpeg") || filename.endsWith(".tiff")) {
                rawText = extractTextFromImage(file);
            }
        } catch (Throwable t) {
            // Graceful degradation: OCR failure or missing native libraries must not block upload
            log.warn("OCR text extraction failed for file {}: {}. Upload proceeds with empty extraction.",
                    filename, t.getMessage());
            return OcrResult.empty("FAILED");
        }

        if (rawText == null || rawText.trim().isBlank()) {
            return OcrResult.empty("PROCESSED");
        }

        Map<String, Object> fields = extractFieldsFromText(rawText);
        String json = serializeToJson(fields);
        return new OcrResult(rawText, json, "PROCESSED");
    }

    private String extractTextFromPdf(File file) {
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (Throwable t) {
            log.warn("PDFBox extraction failed for {}: {}", file.getName(), t.getMessage());
            return "";
        }
    }

    private String extractTextFromImage(File file) {
        try {
            ITesseract tesseract = new Tesseract();
            if (tessdataPath != null && !tessdataPath.isBlank()) {
                tesseract.setDatapath(tessdataPath.trim());
            }
            return tesseract.doOCR(file);
        } catch (Throwable t) {
            log.warn("Tess4J image OCR unavailable or failed: {}", t.getMessage());
            return "";
        }
    }

    public Map<String, Object> extractFieldsFromText(String text) {
        Map<String, Object> fields = new LinkedHashMap<>();

        // Extract invoice number
        Matcher invoiceMatcher = INVOICE_PATTERN.matcher(text);
        if (invoiceMatcher.find()) {
            String val = invoiceMatcher.group(1) != null ? invoiceMatcher.group(1) : invoiceMatcher.group(2);
            if (val != null && !val.trim().isBlank()) {
                fields.put("invoiceNumber", val.trim());
            }
        }

        // Extract serial number
        Matcher serialMatcher = SERIAL_PATTERN.matcher(text);
        if (serialMatcher.find()) {
            String val = serialMatcher.group(1) != null ? serialMatcher.group(1) : serialMatcher.group(2);
            if (val != null && !val.trim().isBlank()) {
                fields.put("serialNumber", val.trim());
            }
        }

        // Extract amount
        Matcher amountMatcher = AMOUNT_PATTERN.matcher(text);
        if (amountMatcher.find()) {
            String amountStr = amountMatcher.group(1).replace(",", "");
            try {
                double amount = Double.parseDouble(amountStr);
                fields.put("amount", amount);
            } catch (NumberFormatException ignored) {}
        }

        // Extract date
        Matcher dateMatcher = DATE_PATTERN.matcher(text);
        if (dateMatcher.find()) {
            String dateStr = dateMatcher.group(1) != null ? dateMatcher.group(1) : dateMatcher.group(2);
            fields.put("invoiceDate", dateStr.trim());
        }

        // Extract part
        Matcher partMatcher = PART_PATTERN.matcher(text);
        if (partMatcher.find()) {
            String part = partMatcher.group(1).trim();
            if (part.length() > 3) {
                fields.put("repairPart", part);
            }
        }

        return fields;
    }

    private String serializeToJson(Map<String, Object> map) {
        if (map.isEmpty()) {
            return "{}";
        }
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) sb.append(", ");
            sb.append("\"").append(entry.getKey()).append("\": ");
            if (entry.getValue() instanceof Number) {
                sb.append(entry.getValue());
            } else {
                sb.append("\"").append(escapeJson(String.valueOf(entry.getValue()))).append("\"");
            }
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }

    private String escapeJson(String str) {
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\b", "\\b")
                  .replace("\f", "\\f")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
