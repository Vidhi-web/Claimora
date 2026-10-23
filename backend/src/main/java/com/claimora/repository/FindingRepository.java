package com.claimora.repository;

import com.claimora.entity.Finding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data repository for Finding entity.
 * Owner: Chinmay (Finding + analysis)
 */
@Repository
public interface FindingRepository extends JpaRepository<Finding, Long> {

    List<Finding> findByClaimClaimId(Long claimId);

    List<Finding> findBySeverity(String severity);

    List<Finding> findByStatus(String status);
}
