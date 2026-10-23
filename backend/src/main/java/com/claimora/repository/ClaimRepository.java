package com.claimora.repository;

import com.claimora.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Data repository for Claim entity.
 * Owner: Tanishka (Claim)
 */
@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    Optional<Claim> findByClaimNumber(String claimNumber);

    boolean existsByClaimNumber(String claimNumber);

    List<Claim> findByStatus(String status);

    List<Claim> findByProductProductId(Long productId);

    List<Claim> findByUserUserId(Long userId);
}
