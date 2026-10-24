package com.claimora;

import com.claimora.ocr.OcrResult;
import com.claimora.ocr.OcrServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class OcrServiceTest {

    private OcrServiceImpl ocrService;

    @BeforeEach
    void setUp() {
        ocrService = new OcrServiceImpl();
    }

    @Test
    @DisplayName("Should extract invoice number, serial number, amount, and date from text using regexes")
    void testExtractFieldsFromText() {
        String sampleText = """
                OFFICIAL RETAIL INVOICE
                Invoice #: INV-99201-US
                Date: 2025-01-15
                Customer: Jane Doe
                Item Description: Dell XPS 15 9530 Laptop
                Serial No: SN-DELL-XPS15-001
                Total Amount: $2,199.00
                Thank you for your purchase!
                """;

        Map<String, Object> fields = ocrService.extractFieldsFromText(sampleText);

        assertNotNull(fields);
        assertEquals("INV-99201-US", fields.get("invoiceNumber"));
        assertEquals("SN-DELL-XPS15-001", fields.get("serialNumber"));
        assertEquals(2199.0, fields.get("amount"));
        assertEquals("2025-01-15", fields.get("invoiceDate"));
    }

    @Test
    @DisplayName("Should gracefully handle non-existent file without throwing exceptions")
    void testGracefulFallbackOnNonExistentFile() {
        Path invalidPath = Path.of("non_existent_document_12345.pdf");

        OcrResult result = ocrService.processDocument(invalidPath, "application/pdf");

        assertNotNull(result);
        assertEquals("FAILED", result.ocrStatus());
        assertEquals("{}", result.extractedDataJson());
        assertEquals("", result.rawText());
    }
}
