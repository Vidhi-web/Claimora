package com.claimora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Request payload for creating or registering a product.
 * Owner: Shaili (Product)
 */
public class ProductRequest {

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    @NotBlank(message = "Model name is required")
    private String model;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Warranty start date is required")
    private LocalDate warrantyStart;

    @NotNull(message = "Warranty end date is required")
    private LocalDate warrantyEnd;

    public ProductRequest() {
    }

    public ProductRequest(String serialNumber, String model, LocalDate purchaseDate, LocalDate warrantyStart, LocalDate warrantyEnd) {
        this.serialNumber = serialNumber;
        this.model = model;
        this.purchaseDate = purchaseDate;
        this.warrantyStart = warrantyStart;
        this.warrantyEnd = warrantyEnd;
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
