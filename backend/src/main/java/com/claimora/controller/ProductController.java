package com.claimora.controller;

import com.claimora.dto.ProductRequest;
import com.claimora.dto.ProductResponse;
import com.claimora.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.*;

/** REST controller for Product warranty records. Owner: Shaili (Product) */
@Tag(name = "Products", description = "Warranty product registry - create, update, and lookup")
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private static final Logger log = LoggerFactory.getLogger(ProductController.class);
    private final ProductService productService;

    public ProductController(ProductService productService) { this.productService = productService; }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List products")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "productId") String sortBy,
            @RequestParam(name = "direction", defaultValue = "DESC") String direction) {
        log.debug("GET /api/products query={} page={}", query, page);
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(productService.getProducts(query, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Register new product")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        log.info("Creating product serial={}", request.getSerialNumber());
        return new ResponseEntity<>(productService.createProduct(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Update product")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable("id") Long id, @Valid @RequestBody ProductRequest request) {
        log.info("Updating product id={}", id);
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }
}