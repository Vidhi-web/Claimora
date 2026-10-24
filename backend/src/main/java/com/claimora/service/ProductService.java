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
        if (request.getWarrantyEnd().isBefore(request.getWarrantyStart())) {
            throw new ValidationException("Warranty end date must be on or after warranty start date");
        }

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
}
