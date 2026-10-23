package com.claimora.repository;

import com.claimora.entity.EvidenceLink;
import com.claimora.entity.EvidenceLinkId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data repository for EvidenceLink join entity.
 * Shared / Integration.
 */
@Repository
public interface EvidenceLinkRepository extends JpaRepository<EvidenceLink, EvidenceLinkId> {

    List<EvidenceLink> findById_FindingId(Long findingId);

    List<EvidenceLink> findById_DocumentId(Long documentId);

    List<EvidenceLink> findByFinding_Claim_ClaimId(Long claimId);
}
