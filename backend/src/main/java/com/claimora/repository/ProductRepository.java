package com.claimora.repository;

import com.claimora.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Spring Data repository for Product entity.
 * Owner: Shaili (Product)
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySerialNumber(String serialNumber);

    boolean existsBySerialNumber(String serialNumber);

    @Query("SELECT p FROM Product p WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(p.serialNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.model) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    /**
     * Returns true if any Claim references this product.
     * Used to guard serial number changes in updateProduct —
     * modifying the serial when claims exist would corrupt fraud-detection findings.
     */
    @Query("SELECT COUNT(c) > 0 FROM Claim c WHERE c.product.productId = :productId")
    boolean hasClaimsForProduct(@Param("productId") Long productId);

    /**
     * Returns the count of claims associated with a given product.
     * Useful for displaying claim activity on the product list.
     */
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.product.productId = :productId")
    long countClaimsByProductId(@Param("productId") Long productId);

    /**
     * Finds products whose warranty ends on or before the given date (expired warranties).
     * Useful for audit queries and dashboard statistics.
     */
    long countByWarrantyEndBefore(LocalDate date);
}
