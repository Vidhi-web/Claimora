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

    List<InvestigationAction> findTop10ByOrderByActionTimeDesc();

    List<InvestigationAction> findTop10ByFinding_Claim_User_UserIdOrderByActionTimeDesc(Long userId);

    long countByFinding_FindingId(Long findingId);
}
