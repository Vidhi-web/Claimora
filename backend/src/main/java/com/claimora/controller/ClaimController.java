package com.claimora.controller;

import com.claimora.dto.ClaimRequest;
import com.claimora.dto.ClaimResponse;
import com.claimora.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Claims management.
 * Follows platform conventions:
 * - Base path: /api/claims (plural noun)
 * - Exclusively uses DTOs for requests and responses
 * Owner: Tanishka (Claim)
 */
@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @GetMapping
    public ResponseEntity<List<ClaimResponse>> getAllClaims(
            @RequestParam(name = "status", required = false) String status) {
        List<ClaimResponse> claims = (status != null && !status.isBlank())
                ? claimService.getClaimsByStatus(status)
                : claimService.getAllClaims();
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimResponse> getClaimById(@PathVariable("id") Long id) {
        ClaimResponse claim = claimService.getClaimById(id);
        return ResponseEntity.ok(claim);
    }

    @PostMapping
    public ResponseEntity<ClaimResponse> createClaim(@Valid @RequestBody ClaimRequest request) {
        ClaimResponse createdClaim = claimService.createClaim(request);
        return new ResponseEntity<>(createdClaim, HttpStatus.CREATED);
    }
}
