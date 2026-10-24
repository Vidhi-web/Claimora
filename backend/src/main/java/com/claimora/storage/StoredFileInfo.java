package com.claimora.storage;

/**
 * Metadata record for a stored file.
 * Owner: Kalp (EvidenceDocument)
 */
public record StoredFileInfo(
        String filePath,
        String fileHash,
        String originalFilename,
        String mimeType,
        long fileSize
) {}
