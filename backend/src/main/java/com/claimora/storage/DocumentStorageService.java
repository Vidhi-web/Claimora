package com.claimora.storage;

import com.claimora.exception.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Service handling protected evidence document storage, path management,
 * and SHA-256 digital fingerprinting.
 * Never stores raw file bytes in the database.
 * Owner: Kalp (EvidenceDocument)
 */
@Service
public class DocumentStorageService {

    private static final Logger log = LoggerFactory.getLogger(DocumentStorageService.class);

    private final Path rootStoragePath;

    public DocumentStorageService(@Value("${claimora.storage.location:./storage/uploads}") String storageLocation) {
        this.rootStoragePath = Paths.get(storageLocation).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootStoragePath);
            log.info("Initialized evidence document storage directory at: {}", this.rootStoragePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory: " + this.rootStoragePath, e);
        }
    }

    /**
     * Stores an uploaded multipart file to disk, calculates its SHA-256 checksum,
     * and returns the file metadata.
     */
    public StoredFileInfo storeFile(MultipartFile file, Long claimId) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Uploaded file cannot be empty");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
        String mimeType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        long fileSize = file.getSize();

        // Calculate SHA-256 hash from stream
        String fileHash;
        try (InputStream is = file.getInputStream()) {
            fileHash = calculateSha256(is);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file for hash computation: " + originalFilename, e);
        }

        // Subdirectory partitioned by claim ID
        Path claimDirPath = this.rootStoragePath.resolve("claims").resolve(String.valueOf(claimId)).normalize();
        try {
            Files.createDirectories(claimDirPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create claim storage directory: " + claimDirPath, e);
        }

        // Prevent filename collisions with unique prefix
        String sanitizedFilename = UUID.randomUUID().toString().substring(0, 8) + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path destinationPath = claimDirPath.resolve(sanitizedFilename).normalize();

        try (InputStream is = file.getInputStream()) {
            Files.copy(is, destinationPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored evidence document at: {} (SHA-256: {})", destinationPath, fileHash);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write evidence document to disk: " + destinationPath, e);
        }

        // Return relative path from storage root for portability
        String storedRelativePath = this.rootStoragePath.relativize(destinationPath).toString().replace('\\', '/');
        return new StoredFileInfo(storedRelativePath, fileHash, originalFilename, mimeType, fileSize);
    }

    /**
     * Loads a stored file as a Spring Resource for secured download.
     */
    public Resource loadFileAsResource(String storedPath) {
        try {
            Path filePath = this.rootStoragePath.resolve(storedPath).normalize();
            // Security check against directory traversal
            if (!filePath.startsWith(this.rootStoragePath)) {
                throw new SecurityException("Access to path outside storage root is denied: " + storedPath);
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Stored file not found or not readable: " + storedPath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid file path URL: " + storedPath, e);
        }
    }

    /**
     * Resolves the absolute Path for a stored file (used by OCR processing).
     */
    public Path resolveAbsolutePath(String storedPath) {
        Path filePath = this.rootStoragePath.resolve(storedPath).normalize();
        if (!filePath.startsWith(this.rootStoragePath)) {
            throw new SecurityException("Access to path outside storage root is denied: " + storedPath);
        }
        return filePath;
    }

    /**
     * Computes the SHA-256 hash of a byte array.
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

    /**
     * Computes the SHA-256 hash from an InputStream.
     */
    public String calculateSha256(InputStream inputStream) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
            byte[] hash = digest.digest();
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
