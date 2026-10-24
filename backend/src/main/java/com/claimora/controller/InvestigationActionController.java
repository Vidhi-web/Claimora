package com.claimora.controller;

import com.claimora.dto.InvestigationActionResponse;
import com.claimora.security.CustomUserDetails;
import com.claimora.service.InvestigationActionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST Controller for Investigation Actions and append-only audit enforcement.
 * Owner: Anuj (InvestigationAction)
 */
@Tag(name = "Investigation", description = "Investigation action timeline management")
@RestController
@RequestMapping("/api/investigations")
public class InvestigationActionController {
    private static final Logger log = LoggerFactory.getLogger(InvestigationActionController.class);

    
    private final InvestigationActionService actionService;

    public InvestigationActionController(InvestigationActionService actionService) {
        this.actionService = actionService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InvestigationActionResponse>> getAllActions(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<InvestigationActionResponse> actions = actionService.getAllRecentActions(userDetails);
        return ResponseEntity.ok(actions);
    }

    @GetMapping("/finding/{findingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InvestigationActionResponse>> getActionsForFinding(
            @PathVariable("findingId") Long findingId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<InvestigationActionResponse> actions = actionService.getActionsForFinding(findingId, userDetails);
        return ResponseEntity.ok(actions);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateActionForbidden(@PathVariable("id") Long id) {
        throw new ResponseStatusException(
                HttpStatus.METHOD_NOT_ALLOWED,
                "Investigation actions are strictly append-only audit records and cannot be modified."
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteActionForbidden(@PathVariable("id") Long id) {
        throw new ResponseStatusException(
                HttpStatus.METHOD_NOT_ALLOWED,
                "Investigation actions are strictly append-only audit records and cannot be deleted."
        );
    }

    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> patchActionForbidden(@PathVariable("id") Long id) {
        throw new ResponseStatusException(
                HttpStatus.METHOD_NOT_ALLOWED,
                "Investigation actions are strictly append-only audit records and cannot be modified."
        );
    }
}
