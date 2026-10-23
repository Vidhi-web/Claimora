package com.claimora.controller;

import com.claimora.dto.AssignFindingRequest;
import com.claimora.dto.FindingResponse;
import com.claimora.dto.InvestigationActionRequest;
import com.claimora.dto.InvestigationActionResponse;
import com.claimora.entity.FindingSeverity;
import com.claimora.entity.FindingStatus;
import com.claimora.security.CustomUserDetails;
import com.claimora.service.FindingService;
import com.claimora.service.InvestigationActionService;
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
 * REST Controller for Findings, Assignment, and Investigation Action timeline.
 * Owners: Chinmay (Finding) & Anuj (InvestigationAction)
 */
@RestController
@RequestMapping("/api/findings")
public class FindingController {

    private final FindingService findingService;
    private final InvestigationActionService actionService;

    public FindingController(FindingService findingService, InvestigationActionService actionService) {
        this.findingService = findingService;
        this.actionService = actionService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<FindingResponse>> getFindings(
            @RequestParam(name = "status", required = false) FindingStatus status,
            @RequestParam(name = "severity", required = false) FindingSeverity severity,
            @RequestParam(name = "assignedTo", required = false) Long assignedTo,
            @RequestParam(name = "claimId", required = false) Long claimId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "findingId") String sortBy,
            @RequestParam(name = "direction", defaultValue = "DESC") String direction,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<FindingResponse> findings = findingService.getFindings(status, severity, assignedTo, claimId, userDetails, pageable);
        return ResponseEntity.ok(findings);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FindingResponse> getFindingById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        FindingResponse finding = findingService.getFindingById(id, userDetails);
        return ResponseEntity.ok(finding);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FindingResponse> assignFinding(
            @PathVariable("id") Long id,
            @Valid @RequestBody AssignFindingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        FindingResponse assigned = findingService.assignFinding(id, request.getAssignedToUserId(), userDetails);
        return ResponseEntity.ok(assigned);
    }

    @GetMapping("/{id}/actions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InvestigationActionResponse>> getActions(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<InvestigationActionResponse> actions = actionService.getActionsForFinding(id, userDetails);
        return ResponseEntity.ok(actions);
    }

    @PostMapping("/{id}/actions")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVESTIGATOR')")
    public ResponseEntity<InvestigationActionResponse> addAction(
            @PathVariable("id") Long id,
            @Valid @RequestBody InvestigationActionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        InvestigationActionResponse recorded = actionService.addAction(id, request, userDetails);
        return new ResponseEntity<>(recorded, HttpStatus.CREATED);
    }
}
