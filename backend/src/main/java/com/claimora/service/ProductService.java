package com.claimora.service;

import com.claimora.dto.ProductRequest;
import com.claimora.dto.ProductResponse;
import com.claimora.entity.Product;
import com.claimora.exception.ResourceNotFoundException;
import com.claimora.exception.ValidationException;
import com.claimora.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for Product catalog management and warranty verification.
 * Owner: Shaili (Product)
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(String query, Pageable pageable) {
        return productRepository.searchProducts(query, pageable)
                .map(ProductResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return ProductResponse.fromEntity(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        // Validation: warranty_start must be >= purchase_date
        if (request.getWarrantyStart().isBefore(request.getPurchaseDate())) {
            throw new ValidationException("Warranty start date must be on or after purchase date");
        }
        // Validation: warranty_end must be >= warranty_start
        if (request.getWarrantyEnd().isBefore(request.getWarrantyStart())) {
            throw new ValidationException("Warranty end date must be on or after warranty start date");
        }
        // Validation: serial number uniqueness
        if (productRepository.existsBySerialNumber(request.getSerialNumber().trim())) {
            throw new ValidationException("Product with serial number " + request.getSerialNumber() + " already exists");
        }

        Product product = new Product(
                request.getSerialNumber().trim(),
                request.getModel().trim(),
                request.getPurchaseDate(),
                request.getWarrantyStart(),
                request.getWarrantyEnd()
        );

        Product saved = productRepository.save(product);
        return ProductResponse.fromEntity(saved);
    }

    /**
     * Updates an existing product.
     *
     * Serial number changes are blocked if the product already has associated claims —
     * changing the serial would invalidate existing fraud-detection findings
     * (SERIAL_REUSE, INVOICE_MISMATCH rules depend on the serial being immutable
     * once claims exist). This guard keeps Claim and Analysis module integrity intact.
     *
     * Owner: Shaili (Product)
     */
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        String incomingSerial = request.getSerialNumber().trim();

        // Guard: disallow serial number change when claims already exist for this product
        if (!existing.getSerialNumber().equals(incomingSerial)) {
            if (productRepository.hasClaimsForProduct(id)) {
                throw new ValidationException(
                    "Serial number cannot be changed: this product already has associated claims. " +
                    "Changing the serial number would invalidate existing fraud-detection findings."
                );
            }
            // New serial — check uniqueness against other products
            if (productRepository.existsBySerialNumber(incomingSerial)) {
                throw new ValidationException(
                    "Product with serial number '" + incomingSerial + "' already exists"
                );
            }
        }

        // Validation: warranty_start must be >= purchase_date
        if (request.getWarrantyStart().isBefore(request.getPurchaseDate())) {
            throw new ValidationException("Warranty start date must be on or after purchase date");
        }
        // Validation: warranty_end must be >= warranty_start
        if (request.getWarrantyEnd().isBefore(request.getWarrantyStart())) {
            throw new ValidationException("Warranty end date must be on or after warranty start date");
        }

        existing.setSerialNumber(incomingSerial);
        existing.setModel(request.getModel().trim());
        existing.setPurchaseDate(request.getPurchaseDate());
        existing.setWarrantyStart(request.getWarrantyStart());
        existing.setWarrantyEnd(request.getWarrantyEnd());

        Product saved = productRepository.save(existing);
        return ProductResponse.fromEntity(saved);
    }
}
