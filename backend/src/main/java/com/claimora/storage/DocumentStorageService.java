package com.claimora.storage;

import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Service handling evidence document storage and SHA-256 digital fingerprinting.
 * Owner: Kalp (EvidenceDocument)
 */
@Service
public class DocumentStorageService {

    /**
     * Computes the SHA-256 hash of document binary data for non-unique index deduplication
     * and tamper verification across claims.
     */
    public String calculateSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
