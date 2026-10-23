package com.claimora;

import com.claimora.dto.ProductRequest;
import com.claimora.dto.ProductResponse;
import com.claimora.entity.Product;
import com.claimora.exception.ValidationException;
import com.claimora.repository.ProductRepository;
import com.claimora.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    private ProductService productService;

    @BeforeEach
    void setUp() {
        productService = new ProductService(productRepository);
    }

    @Test
    @DisplayName("Should successfully create product when warranty dates are valid")
    void testCreateProductSuccess() {
        ProductRequest request = new ProductRequest(
                "SN-TEST-12345",
                "ThinkPad T14",
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2027, 1, 1)
        );

        when(productRepository.existsBySerialNumber("SN-TEST-12345")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setProductId(10L);
            return p;
        });

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals(10L, response.getProductId());
        assertEquals("SN-TEST-12345", response.getSerialNumber());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw ValidationException when warrantyEnd is before warrantyStart")
    void testCreateProductInvalidDates() {
        ProductRequest request = new ProductRequest(
                "SN-TEST-12345",
                "ThinkPad T14",
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 6, 1),
                LocalDate.of(2025, 5, 1) // Before start date
        );

        ValidationException ex = assertThrows(ValidationException.class, () -> productService.createProduct(request));
        assertTrue(ex.getMessage().contains("Warranty end date must be on or after warranty start date"));
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw ValidationException when serial number is duplicate")
    void testCreateProductDuplicateSerial() {
        ProductRequest request = new ProductRequest(
                "SN-EXISTING-99",
                "Dell XPS",
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2026, 1, 1)
        );

        when(productRepository.existsBySerialNumber("SN-EXISTING-99")).thenReturn(true);

        ValidationException ex = assertThrows(ValidationException.class, () -> productService.createProduct(request));
        assertTrue(ex.getMessage().contains("already exists"));
        verify(productRepository, never()).save(any(Product.class));
    }
}
