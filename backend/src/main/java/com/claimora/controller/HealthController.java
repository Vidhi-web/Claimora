package com.claimora.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Health check endpoint for system readiness and dev validation.
 */
@Tag(name = "System", description = "Health check and system status")
@RestController
@RequestMapping("/api/health")
public class HealthController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(HealthController.class);

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "app", "Claimora Backend",
                "timestamp", Instant.now().toString(),
                "cors", "Enabled for http://localhost:4200"
        ));
    }
}
