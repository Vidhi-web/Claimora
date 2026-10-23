package com.claimora.repository;

import com.claimora.entity.EvidenceDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data repository for EvidenceDocument entity.
 * Owner: Kalp (EvidenceDocument)
 */
@Repository
public interface EvidenceDocumentRepository extends JpaRepository<EvidenceDocument, Long> {

    List<EvidenceDocument> findByClaimClaimId(Long claimId);

    List<EvidenceDocument> findByFileHash(String fileHash);
}
