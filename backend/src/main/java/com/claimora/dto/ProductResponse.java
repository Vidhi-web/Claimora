package com.claimora.dto;

import com.claimora.entity.Product;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Response payload for Product details.
 * Owner: Shaili (Product)
 */
public class ProductResponse {

    private Long productId;
    private String serialNumber;
    private String model;
    private LocalDate purchaseDate;
    private LocalDate warrantyStart;
    private LocalDate warrantyEnd;
    private Instant createdAt;

    public ProductResponse() {
    }

    public ProductResponse(Long productId, String serialNumber, String model, LocalDate purchaseDate,
                           LocalDate warrantyStart, LocalDate warrantyEnd, Instant createdAt) {
        this.productId = productId;
        this.serialNumber = serialNumber;
        this.model = model;
        this.purchaseDate = purchaseDate;
        this.warrantyStart = warrantyStart;
        this.warrantyEnd = warrantyEnd;
        this.createdAt = createdAt;
    }

    public static ProductResponse fromEntity(Product product) {
        if (product == null) return null;
        return new ProductResponse(
                product.getProductId(),
                product.getSerialNumber(),
                product.getModel(),
                product.getPurchaseDate(),
                product.getWarrantyStart(),
                product.getWarrantyEnd(),
                product.getCreatedAt()
        );
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDate getWarrantyStart() {
        return warrantyStart;
    }

    public void setWarrantyStart(LocalDate warrantyStart) {
        this.warrantyStart = warrantyStart;
    }

    public LocalDate getWarrantyEnd() {
        return warrantyEnd;
    }

    public void setWarrantyEnd(LocalDate warrantyEnd) {
        this.warrantyEnd = warrantyEnd;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
