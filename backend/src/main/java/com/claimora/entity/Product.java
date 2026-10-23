package com.claimora.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;

/**
 * Covered product entity with warranty terms.
 * Owner: Shaili (Product)
 */
@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "warranty_start", nullable = false)
    private LocalDate warrantyStart;

    @Column(name = "warranty_end", nullable = false)
    private LocalDate warrantyEnd;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Product() {
    }

    public Product(String serialNumber, String model, LocalDate purchaseDate, LocalDate warrantyStart, LocalDate warrantyEnd) {
        this.serialNumber = serialNumber;
        this.model = model;
        this.purchaseDate = purchaseDate;
        this.warrantyStart = warrantyStart;
        this.warrantyEnd = warrantyEnd;
        this.createdAt = Instant.now();
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
