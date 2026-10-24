package com.claimora;

import com.claimora.entity.Product;
import com.claimora.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for ProductController.
 * Owner: Shaili (Product)
 *
 * Tests use @WithMockUser to simulate RBAC without requiring a real JWT.
 * The H2 dev database is seeded with 5 products by DataInitializer;
 * we add our own test product in @BeforeEach and use a unique prefix
 * so we don't conflict with seeded data.
 */
@SpringBootTest
class ProductControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ProductRepository productRepository;

    // A test product inserted before each test
    private Product testProduct;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Remove any leftover test product from a previous run (serial unique constraint)
        productRepository.findBySerialNumber("SN-TEST-INTEG-001")
                .ifPresent(productRepository::delete);
        productRepository.findBySerialNumber("SN-TEST-INTEG-002")
                .ifPresent(productRepository::delete);

        testProduct = productRepository.save(new Product(
                "SN-TEST-INTEG-001",
                "Test Device Model A",
                LocalDate.of(2024, 1, 15),
                LocalDate.of(2024, 1, 15),
                LocalDate.of(2026, 1, 15)
        ));
    }

    // ─── GET /api/products ──────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/products - returns paginated list when authenticated")
    @WithMockUser(username = "staff@claimora.internal", roles = "STAFF")
    void getProducts_authenticated_returnsPage() throws Exception {
        mockMvc.perform(get("/api/products").param("page", "0").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("GET /api/products - returns 401 when unauthenticated")
    void getProducts_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/products?query=Test - search filters correctly")
    @WithMockUser(username = "staff@claimora.internal", roles = "STAFF")
    void getProducts_withQuery_filtersResults() throws Exception {
        mockMvc.perform(get("/api/products").param("query", "Test Device Model A"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].serialNumber", is("SN-TEST-INTEG-001")));
    }

    // ─── GET /api/products/{id} ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/products/{id} - returns correct product")
    @WithMockUser(username = "staff@claimora.internal", roles = "STAFF")
    void getProductById_existing_returnsProduct() throws Exception {
        mockMvc.perform(get("/api/products/{id}", testProduct.getProductId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serialNumber", is("SN-TEST-INTEG-001")))
                .andExpect(jsonPath("$.model", is("Test Device Model A")));
    }

    @Test
    @DisplayName("GET /api/products/{id} - returns 404 for unknown id")
    @WithMockUser(username = "staff@claimora.internal", roles = "STAFF")
    void getProductById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/products/{id}", 999999L))
                .andExpect(status().isNotFound());
    }

    // ─── POST /api/products ─────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/products - creates product with valid payload (STAFF)")
    @WithMockUser(username = "staff@claimora.internal", roles = "STAFF")
    void createProduct_validPayload_returns201() throws Exception {
        String body = """
                {
                  "serialNumber": "SN-TEST-INTEG-002",
                  "model": "Test Device Model B",
                  "purchaseDate": "2024-03-01",
                  "warrantyStart": "2024-03-01",
                  "warrantyEnd": "2026-03-01"
                }
                """;
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.serialNumber", is("SN-TEST-INTEG-002")))
                .andExpect(jsonPath("$.productId", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/products - returns 400 when warrantyStart before purchaseDate")
    @WithMockUser(username = "admin@claimora.internal", roles = "ADMIN")
    void createProduct_warrantyStartBeforePurchase_returns400() throws Exception {
        String body = """
                {
                  "serialNumber": "SN-VALIDATION-FAIL-001",
                  "model": "Invalid Date Device",
                  "purchaseDate": "2024-06-01",
                  "warrantyStart": "2024-05-01",
                  "warrantyEnd": "2026-06-01"
                }
                """;
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Warranty start date must be on or after purchase date")));
    }

    @Test
    @DisplayName("POST /api/products - returns 400 when warrantyEnd before warrantyStart")
    @WithMockUser(username = "admin@claimora.internal", roles = "ADMIN")
    void createProduct_warrantyEndBeforeStart_returns400() throws Exception {
        String body = """
                {
                  "serialNumber": "SN-VALIDATION-FAIL-002",
                  "model": "Invalid Date Device",
                  "purchaseDate": "2024-01-01",
                  "warrantyStart": "2024-01-01",
                  "warrantyEnd": "2023-12-31"
                }
                """;
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Warranty end date must be on or after warranty start date")));
    }

    @Test
    @DisplayName("POST /api/products - returns 400 for duplicate serial number")
    @WithMockUser(username = "admin@claimora.internal", roles = "ADMIN")
    void createProduct_duplicateSerial_returns400() throws Exception {
        String body = """
                {
                  "serialNumber": "SN-TEST-INTEG-001",
                  "model": "Duplicate Serial Device",
                  "purchaseDate": "2024-01-01",
                  "warrantyStart": "2024-01-01",
                  "warrantyEnd": "2026-01-01"
                }
                """;
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("POST /api/products - returns 403 when INVESTIGATOR role attempts to create")
    @WithMockUser(username = "investigator@claimora.internal", roles = "INVESTIGATOR")
    void createProduct_investigatorRole_returns403() throws Exception {
        String body = """
                {
                  "serialNumber": "SN-ROLE-DENIED-001",
                  "model": "Unauthorized Device",
                  "purchaseDate": "2024-01-01",
                  "warrantyStart": "2024-01-01",
                  "warrantyEnd": "2026-01-01"
                }
                """;
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    // ─── PUT /api/products/{id} ─────────────────────────────────────────────

    @Test
    @DisplayName("PUT /api/products/{id} - updates model name successfully (ADMIN)")
    @WithMockUser(username = "admin@claimora.internal", roles = "ADMIN")
    void updateProduct_validPayload_returnsUpdated() throws Exception {
        String body = """
                {
                  "serialNumber": "SN-TEST-INTEG-001",
                  "model": "Test Device Model A - Revised",
                  "purchaseDate": "2024-01-15",
                  "warrantyStart": "2024-01-15",
                  "warrantyEnd": "2026-01-15"
                }
                """;
        mockMvc.perform(put("/api/products/{id}", testProduct.getProductId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model", is("Test Device Model A - Revised")))
                .andExpect(jsonPath("$.serialNumber", is("SN-TEST-INTEG-001")));
    }

    @Test
    @DisplayName("PUT /api/products/{id} - returns 404 for non-existent product")
    @WithMockUser(username = "admin@claimora.internal", roles = "ADMIN")
    void updateProduct_notFound_returns404() throws Exception {
        String body = """
                {
                  "serialNumber": "SN-GHOST-999",
                  "model": "Ghost Device",
                  "purchaseDate": "2024-01-01",
                  "warrantyStart": "2024-01-01",
                  "warrantyEnd": "2026-01-01"
                }
                """;
        mockMvc.perform(put("/api/products/{id}", 999999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/products/{id} - returns 403 when INVESTIGATOR role attempts to update")
    @WithMockUser(username = "investigator@claimora.internal", roles = "INVESTIGATOR")
    void updateProduct_investigatorRole_returns403() throws Exception {
        String body = """
                {
                  "serialNumber": "SN-TEST-INTEG-001",
                  "model": "Unauthorized Update",
                  "purchaseDate": "2024-01-15",
                  "warrantyStart": "2024-01-15",
                  "warrantyEnd": "2026-01-15"
                }
                """;
        mockMvc.perform(put("/api/products/{id}", testProduct.getProductId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/products/{id} - returns 400 for invalid date range on update")
    @WithMockUser(username = "admin@claimora.internal", roles = "ADMIN")
    void updateProduct_invalidDates_returns400() throws Exception {
        String body = """
                {
                  "serialNumber": "SN-TEST-INTEG-001",
                  "model": "Test Device Model A",
                  "purchaseDate": "2024-06-01",
                  "warrantyStart": "2024-05-01",
                  "warrantyEnd": "2026-06-01"
                }
                """;
        mockMvc.perform(put("/api/products/{id}", testProduct.getProductId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Warranty start date must be on or after purchase date")));
    }
}
