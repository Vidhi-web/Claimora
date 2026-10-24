package com.claimora.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI / Swagger configuration for Claimora backend.
 * Access Swagger UI at: http://localhost:8080/swagger-ui.html
 * Raw JSON spec at:     http://localhost:8080/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI claimoraOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Claimora — Fraud Risk & Warranty Management API")
                        .description("""
                                REST API for the **Claimora** warranty fraud investigation platform.
                                
                                ## Authentication
                                All protected endpoints require a **Bearer JWT token**.
                                1. Call `POST /api/auth/login` with your credentials.
                                2. Copy the `token` from the response.
                                3. Click **Authorize** → paste `<your-token>` (without "Bearer").
                                
                                ## Roles
                                | Role | Access |
                                |------|--------|
                                | ADMIN | Full access — users, products, claims, findings, reports |
                                | INVESTIGATOR | Claims, findings, evidence, reports |
                                | STAFF | Own claims and evidence only |
                                """)
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Claimora Dev Team")
                                .email("dev@claimora.internal"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://claimora.internal")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development"),
                        new Server().url("https://api.claimora.internal").description("Production")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .name(BEARER_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your JWT token (without 'Bearer' prefix)")));
    }
}
