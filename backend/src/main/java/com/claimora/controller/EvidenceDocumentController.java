package com.claimora.controller;

import com.claimora.dto.EvidenceDocumentResponse;
import com.claimora.dto.UpdateExtractedDataRequest;
import com.claimora.security.CustomUserDetails;
import com.claimora.service.EvidenceDocumentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST Controller for Evidence Document metadata and field corrections.
 * Owner: Kalp (EvidenceDocument)
 */
@Tag(name = "Evidence", description = "Evidence document upload, OCR processing, and retrieval")
@RestController
@RequestMapping("/api/documents")
public class EvidenceDocumentController {
    private static final Logger log = LoggerFactory.getLogger(EvidenceDocumentController.class);

    
    private final EvidenceDocumentService documentService;

    public EvidenceDocumentController(EvidenceDocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EvidenceDocumentResponse>> getDocuments(
            @RequestParam(name = "claimId", required = false) Long claimId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<EvidenceDocumentResponse> docs = documentService.getDocuments(claimId, userDetails);
        return ResponseEntity.ok(docs);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EvidenceDocumentResponse> getDocumentById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EvidenceDocumentResponse doc = documentService.getDocumentById(id, userDetails);
        return ResponseEntity.ok(doc);
    }

    @GetMapping("/{id}/file")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<org.springframework.core.io.Resource> downloadDocumentFile(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EvidenceDocumentService.DocumentDownload download = documentService.loadDocumentFile(id, userDetails);
        String contentType = download.mimeType() != null ? download.mimeType() : org.springframework.http.MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String filename = download.filename() != null ? download.filename() : "document_" + id;

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(download.resource());
    }

    @PutMapping("/{id}/extracted-data")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVESTIGATOR', 'STAFF')")
    public ResponseEntity<EvidenceDocumentResponse> updateExtractedData(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateExtractedDataRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EvidenceDocumentResponse updated = documentService.updateExtractedData(id, request, userDetails);
        return ResponseEntity.ok(updated);
    }
}
