package com.claimora.repository;

import com.claimora.entity.InvestigationAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data repository for InvestigationAction entity.
 * Owner: Anuj (InvestigationAction)
 * Note: Investigation actions represent an append-only timeline.
 */
@Repository
public interface InvestigationActionRepository extends JpaRepository<InvestigationAction, Long> {

    List<InvestigationAction> findByFindingFindingIdOrderByActionTimeAsc(Long findingId);

    List<InvestigationAction> findByUserUserIdOrderByActionTimeDesc(Long userId);
}
