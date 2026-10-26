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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
@Tag(name = "Findings", description = "Fraud findings, investigator assignment, and action timeline APIs")
public class FindingController {

    private static final Logger log = LoggerFactory.getLogger(FindingController.class);

    private final FindingService findingService;
    private final InvestigationActionService actionService;

    public FindingController(FindingService findingService, InvestigationActionService actionService) {
        this.findingService = findingService;
        this.actionService = actionService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List findings", description = "Returns a paginated list of fraud findings. Filterable by status, severity, assigned investigator, and claim.")
    public ResponseEntity<Page<FindingResponse>> getFindings(
            @Parameter(description = "Filter by finding status") @RequestParam(name = "status", required = false) FindingStatus status,
            @Parameter(description = "Filter by severity level") @RequestParam(name = "severity", required = false) FindingSeverity severity,
            @Parameter(description = "Filter by assigned investigator user ID") @RequestParam(name = "assignedTo", required = false) Long assignedTo,
            @Parameter(description = "Filter by parent claim ID") @RequestParam(name = "claimId", required = false) Long claimId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "findingId") String sortBy,
            @RequestParam(name = "direction", defaultValue = "DESC") String direction,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.debug("GET /api/findings status={} severity={} page={} size={} by={}",
                status, severity, page, size, userDetails != null ? userDetails.getUsername() : "anon");
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<FindingResponse> findings = findingService.getFindings(status, severity, assignedTo, claimId, userDetails, pageable);
        return ResponseEntity.ok(findings);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get finding by ID")
    public ResponseEntity<FindingResponse> getFindingById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.debug("GET /api/findings/{} by={}", id, userDetails != null ? userDetails.getUsername() : "anon");
        FindingResponse finding = findingService.getFindingById(id, userDetails);
        return ResponseEntity.ok(finding);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign finding to investigator", description = "Admin-only. Assigns the finding to an investigator user.")
    public ResponseEntity<FindingResponse> assignFinding(
            @PathVariable("id") Long id,
            @Valid @RequestBody AssignFindingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Assigning finding {} to user {} by admin={}",
                id, request.getAssignedToUserId(), userDetails != null ? userDetails.getUsername() : "anon");
        FindingResponse assigned = findingService.assignFinding(id, request.getAssignedToUserId(), userDetails);
        return ResponseEntity.ok(assigned);
    }

    @GetMapping("/{id}/actions")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get investigation action timeline for a finding")
    public ResponseEntity<List<InvestigationActionResponse>> getActions(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.debug("GET /api/findings/{}/actions by={}", id, userDetails != null ? userDetails.getUsername() : "anon");
        List<InvestigationActionResponse> actions = actionService.getActionsForFinding(id, userDetails);
        return ResponseEntity.ok(actions);
    }

    @PostMapping("/{id}/actions")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVESTIGATOR')")
    @Operation(summary = "Record an investigation action", description = "Appends a new action (comment, resolve, dismiss, etc.) to a finding's timeline.")
    public ResponseEntity<InvestigationActionResponse> addAction(
            @PathVariable("id") Long id,
            @Valid @RequestBody InvestigationActionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        log.info("Recording action type={} on finding={} by={}", request.getActionType(), id,
                userDetails != null ? userDetails.getUsername() : "anon");
        InvestigationActionResponse recorded = actionService.addAction(id, request, userDetails);
        return new ResponseEntity<>(recorded, HttpStatus.CREATED);
    }
}
