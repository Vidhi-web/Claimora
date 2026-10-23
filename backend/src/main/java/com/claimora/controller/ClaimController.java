package com.claimora.controller;

import com.claimora.dto.AnalysisResultResponse;
import com.claimora.dto.ClaimRequest;
import com.claimora.dto.ClaimResponse;
import com.claimora.dto.EvidenceDocumentResponse;
import com.claimora.entity.ClaimStatus;
import com.claimora.security.CustomUserDetails;
import com.claimora.service.AnalysisService;
import com.claimora.service.ClaimService;
import com.claimora.service.EvidenceDocumentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Claims management with role-based authorization.
 * Owner: Tanishka (Claim)
 */
@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;
    private final EvidenceDocumentService documentService;
    private final AnalysisService analysisService;

    public ClaimController(ClaimService claimService,
                           EvidenceDocumentService documentService,
                           AnalysisService analysisService) {
        this.claimService = claimService;
        this.documentService = documentService;
        this.analysisService = analysisService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ClaimResponse>> getClaims(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", required = false) ClaimStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "claimId") String sortBy,
            @RequestParam(name = "direction", defaultValue = "DESC") String direction,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ClaimResponse> claims = claimService.getClaims(search, status, userDetails, pageable);
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClaimResponse> getClaimById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ClaimResponse claim = claimService.getClaimById(id, userDetails);
        return ResponseEntity.ok(claim);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ClaimResponse> createClaim(
            @Valid @RequestBody ClaimRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ClaimResponse createdClaim = claimService.createClaim(request, userDetails);
        return new ResponseEntity<>(createdClaim, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/documents")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EvidenceDocumentResponse>> getClaimDocuments(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<EvidenceDocumentResponse> docs = documentService.getDocumentsForClaim(id, userDetails);
        return ResponseEntity.ok(docs);
    }

    @PostMapping(value = "/{id}/documents", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<EvidenceDocumentResponse> uploadDocument(
            @PathVariable("id") Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("documentType") com.claimora.entity.DocumentType documentType,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EvidenceDocumentResponse uploaded = documentService.uploadDocument(id, file, documentType, userDetails);
        return new ResponseEntity<>(uploaded, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/analyze")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnalysisResultResponse> analyzeClaim(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        AnalysisResultResponse result = analysisService.analyzeClaim(id, userDetails);
        return ResponseEntity.ok(result);
    }
}
