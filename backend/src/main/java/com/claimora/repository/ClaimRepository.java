package com.claimora.repository;

import com.claimora.entity.Claim;
import com.claimora.entity.ClaimStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Spring Data repository for Claim entity.
 * Owner: Tanishka (Claim)
 */
@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    Optional<Claim> findByClaimNumber(String claimNumber);

    boolean existsByClaimNumber(String claimNumber);

    List<Claim> findByProduct_ProductId(Long productId);

    List<Claim> findByProduct_SerialNumber(String serialNumber);

    long countByStatus(ClaimStatus status);

    long countByUser_UserId(Long userId);

    long countByUser_UserIdAndStatus(Long userId, ClaimStatus status);

    List<Claim> findTop5ByStatusOrderByCreatedAtDesc(ClaimStatus status);

    /** Single query: returns [[status, count], ...] for ALL statuses — one DB round-trip */
    @Query("SELECT c.status, COUNT(c) FROM Claim c GROUP BY c.status")
    List<Object[]> countGroupedByStatus();

    /** Single query: returns [[status, count], ...] scoped to a user */
    @Query("SELECT c.status, COUNT(c) FROM Claim c WHERE c.user.userId = :userId GROUP BY c.status")
    List<Object[]> countGroupedByStatusForUser(@Param("userId") Long userId);

    @Query(value = "SELECT c FROM Claim c " +
           "LEFT JOIN FETCH c.product " +
           "LEFT JOIN FETCH c.user " +
           "WHERE (:userId IS NULL OR c.user.userId = :userId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(c.claimNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.product.serialNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.product.model) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(c) FROM Claim c WHERE " +
           "(:userId IS NULL OR c.user.userId = :userId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(c.claimNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.product.serialNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.product.model) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Claim> findFilteredClaims(
            @Param("userId") Long userId,
            @Param("status") ClaimStatus status,
            @Param("search") String search,
            Pageable pageable
    );
}
