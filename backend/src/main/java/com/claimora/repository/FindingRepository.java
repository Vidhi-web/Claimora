package com.claimora.repository;

import com.claimora.entity.Finding;
import com.claimora.entity.FindingSeverity;
import com.claimora.entity.FindingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data repository for Finding entity.
 * Owner: Chinmay (Finding + analysis)
 */
@Repository
public interface FindingRepository extends JpaRepository<Finding, Long> {

    List<Finding> findByClaim_ClaimId(Long claimId);

    List<Finding> findByClaim_ClaimIdAndStatus(Long claimId, FindingStatus status);

    boolean existsByClaim_ClaimIdAndRuleCode(Long claimId, String ruleCode);

    long countByStatus(FindingStatus status);

    long countBySeverity(FindingSeverity severity);

    long countByAssignedTo_UserId(Long userId);

    long countByAssignedTo_UserIdAndStatus(Long userId, FindingStatus status);

    long countByClaim_User_UserId(Long userId);

    long countByClaim_User_UserIdAndStatus(Long userId, FindingStatus status);

    @Query("SELECT f.ruleCode, COUNT(f) FROM Finding f GROUP BY f.ruleCode ORDER BY COUNT(f) DESC")
    List<Object[]> countGroupByRuleCode();

    /** Single query: all status counts in one DB round-trip */
    @Query("SELECT f.status, COUNT(f) FROM Finding f GROUP BY f.status")
    List<Object[]> countGroupedByStatus();

    /** Single query: all severity counts in one DB round-trip */
    @Query("SELECT f.severity, COUNT(f) FROM Finding f GROUP BY f.severity")
    List<Object[]> countGroupedBySeverity();

    /** Single query: status counts scoped to a user's claims */
    @Query("SELECT f.status, COUNT(f) FROM Finding f WHERE f.claim.user.userId = :userId GROUP BY f.status")
    List<Object[]> countGroupedByStatusForUser(@Param("userId") Long userId);

    @Query("SELECT f.claim.claimId, COUNT(f) FROM Finding f WHERE f.claim.claimId IN :claimIds AND f.status = :status GROUP BY f.claim.claimId")
    List<Object[]> countByClaimIdsAndStatus(@Param("claimIds") List<Long> claimIds, @Param("status") FindingStatus status);

    @Query(value = "SELECT f FROM Finding f " +
           "LEFT JOIN FETCH f.claim c " +
           "LEFT JOIN FETCH c.product " +
           "LEFT JOIN FETCH c.user " +
           "LEFT JOIN FETCH f.assignedTo " +
           "WHERE (:assignedToId IS NULL OR (f.assignedTo IS NOT NULL AND f.assignedTo.userId = :assignedToId)) AND " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(:severity IS NULL OR f.severity = :severity) AND " +
           "(:claimId IS NULL OR f.claim.claimId = :claimId)",
           countQuery = "SELECT COUNT(f) FROM Finding f WHERE " +
           "(:assignedToId IS NULL OR (f.assignedTo IS NOT NULL AND f.assignedTo.userId = :assignedToId)) AND " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(:severity IS NULL OR f.severity = :severity) AND " +
           "(:claimId IS NULL OR f.claim.claimId = :claimId)")
    Page<Finding> findFilteredFindings(
            @Param("assignedToId") Long assignedToId,
            @Param("status") FindingStatus status,
            @Param("severity") FindingSeverity severity,
            @Param("claimId") Long claimId,
            Pageable pageable
    );
}
