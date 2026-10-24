package com.claimora.repository;

import com.claimora.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
