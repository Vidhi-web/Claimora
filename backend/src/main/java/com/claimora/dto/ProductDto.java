package com.claimora.dto;

import java.time.LocalDate;

/**
 * Data Transfer Object for Product warranty details.
 * Owner: Shaili (Product)
 */
public class ProductDto {

    private Long productId;
    private String serialNumber;
    private String model;
    private LocalDate purchaseDate;
    private LocalDate warrantyStart;
    private LocalDate warrantyEnd;

    public ProductDto() {
    }

    public ProductDto(Long productId, String serialNumber, String model, LocalDate purchaseDate, LocalDate warrantyStart, LocalDate warrantyEnd) {
        this.productId = productId;
        this.serialNumber = serialNumber;
        this.model = model;
        this.purchaseDate = purchaseDate;
        this.warrantyStart = warrantyStart;
        this.warrantyEnd = warrantyEnd;
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
}
