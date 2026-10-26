package com.claimora.repository;

import com.claimora.entity.InvestigationAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data repository for InvestigationAction entity.
 * Append-only audit trail logging.
 * Owner: Anuj (InvestigationAction)
 */
@Repository
public interface InvestigationActionRepository extends JpaRepository<InvestigationAction, Long> {

    List<InvestigationAction> findByFinding_FindingIdOrderByActionTimeAsc(Long findingId);

    List<InvestigationAction> findByFinding_Claim_ClaimIdOrderByActionTimeAsc(Long claimId);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM InvestigationAction a LEFT JOIN FETCH a.user LEFT JOIN FETCH a.finding f LEFT JOIN FETCH f.claim ORDER BY a.actionTime DESC")
    List<InvestigationAction> findTop10WithDetails(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM InvestigationAction a LEFT JOIN FETCH a.user LEFT JOIN FETCH a.finding f LEFT JOIN FETCH f.claim c WHERE c.user.userId = :userId ORDER BY a.actionTime DESC")
    List<InvestigationAction> findTopByUserIdWithDetails(@org.springframework.data.repository.query.Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM InvestigationAction a LEFT JOIN FETCH a.user LEFT JOIN FETCH a.finding f LEFT JOIN FETCH f.claim WHERE f.findingId = :findingId ORDER BY a.actionTime ASC")
    List<InvestigationAction> findByFindingIdWithDetails(@org.springframework.data.repository.query.Param("findingId") Long findingId);

    List<InvestigationAction> findTop10ByOrderByActionTimeDesc();

    List<InvestigationAction> findTop10ByFinding_Claim_User_UserIdOrderByActionTimeDesc(Long userId);

    long countByFinding_FindingId(Long findingId);

    @org.springframework.data.jpa.repository.Query("SELECT a.finding.findingId, COUNT(a) FROM InvestigationAction a WHERE a.finding.findingId IN :findingIds GROUP BY a.finding.findingId")
    List<Object[]> countActionsByFindingIds(@org.springframework.data.repository.query.Param("findingIds") List<Long> findingIds);
}
