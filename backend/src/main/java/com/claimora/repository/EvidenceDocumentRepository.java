package com.claimora.repository;

import com.claimora.entity.DocumentType;
import com.claimora.entity.EvidenceDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data repository for EvidenceDocument entity.
 * Owner: Kalp (EvidenceDocument)
 */
@Repository
public interface EvidenceDocumentRepository extends JpaRepository<EvidenceDocument, Long> {

    List<EvidenceDocument> findByClaim_ClaimId(Long claimId);

    List<EvidenceDocument> findByFileHash(String fileHash);

    List<EvidenceDocument> findByFileHashAndClaim_ClaimIdNot(String fileHash, Long claimId);

    List<EvidenceDocument> findByDocumentType(DocumentType documentType);

    @Query("SELECT d FROM EvidenceDocument d WHERE d.claim.claimId = :claimId AND d.documentType = :documentType")
    List<EvidenceDocument> findByClaimIdAndDocumentType(@Param("claimId") Long claimId, @Param("documentType") DocumentType documentType);

    long countByFileHash(String fileHash);

    long countByOcrStatus(String ocrStatus);

    long countByClaim_User_UserId(Long userId);

    List<EvidenceDocument> findByClaim_User_UserId(Long userId);
}
