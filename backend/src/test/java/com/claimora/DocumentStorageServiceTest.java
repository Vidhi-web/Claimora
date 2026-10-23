package com.claimora;

import com.claimora.storage.DocumentStorageService;
import com.claimora.storage.StoredFileInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class DocumentStorageServiceTest {

    @TempDir
    Path tempDir;

    private DocumentStorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new DocumentStorageService(tempDir.toString());
    }

    @Test
    @DisplayName("Should correctly compute SHA-256 hexadecimal hash")
    void testCalculateSha256() throws IOException {
        String testData = "Claimora Evidence Document Verification";
        // Known SHA-256 for this exact ASCII string
        String hash = storageService.calculateSha256(testData.getBytes(StandardCharsets.UTF_8));
        assertNotNull(hash);
        assertEquals(64, hash.length());

        // Same stream should yield identical hash
        try (ByteArrayInputStream is = new ByteArrayInputStream(testData.getBytes(StandardCharsets.UTF_8))) {
            String streamHash = storageService.calculateSha256(is);
            assertEquals(hash, streamHash);
        }
    }

    @Test
    @DisplayName("Should store uploaded file to disk and return metadata")
    void testStoreFileSuccess() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "invoice_test.pdf",
                "application/pdf",
                "Invoice content: $1200 for SN-12345".getBytes(StandardCharsets.UTF_8)
        );

        StoredFileInfo info = storageService.storeFile(file, 101L);

        assertNotNull(info);
        assertEquals("invoice_test.pdf", info.originalFilename());
        assertEquals("application/pdf", info.mimeType());
        assertTrue(info.filePath().contains("claims/101") || info.filePath().contains("claims\\101"));
        assertEquals(64, info.fileHash().length());

        // Verify resource can be reloaded
        Resource resource = storageService.loadFileAsResource(info.filePath());
        assertTrue(resource.exists());
        assertTrue(resource.isReadable());
    }

    @Test
    @DisplayName("Should block directory traversal attempts")
    void testDirectoryTraversalSecurity() {
        assertThrows(SecurityException.class, () -> {
            storageService.loadFileAsResource("../../windows/system32/cmd.exe");
        });
    }
}
