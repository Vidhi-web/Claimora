package com.claimora.analysis;

import com.claimora.entity.Claim;
import com.claimora.entity.DocumentType;
import com.claimora.entity.EvidenceDocument;
import com.claimora.repository.ClaimRepository;
import com.claimora.repository.EvidenceDocumentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Encapsulates the execution context, data lookups, and OCR extraction helpers for fraud analysis rules.
 */
public class AnalysisContext {

    private final Claim claim;
    private final List<EvidenceDocument> claimDocuments;
    private final EvidenceDocumentRepository documentRepository;
    private final ClaimRepository claimRepository;
    private final ObjectMapper objectMapper;

    public AnalysisContext(Claim claim,
                           List<EvidenceDocument> claimDocuments,
                           EvidenceDocumentRepository documentRepository,
                           ClaimRepository claimRepository,
                           ObjectMapper objectMapper) {
        this.claim = claim;
        this.claimDocuments = claimDocuments != null ? claimDocuments : new ArrayList<>();
        this.documentRepository = documentRepository;
        this.claimRepository = claimRepository;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    public Claim getClaim() {
        return claim;
    }

    public List<EvidenceDocument> getClaimDocuments() {
        return claimDocuments;
    }

    public List<EvidenceDocument> findDocumentsByClaimId(Long claimId) {
        if (claimId == null) {
            return List.of();
        }
        return documentRepository.findByClaim_ClaimId(claimId);
    }

    public List<EvidenceDocument> getClaimDocumentsByType(DocumentType type) {
        return claimDocuments.stream()
                .filter(d -> d.getDocumentType() == type)
                .collect(Collectors.toList());
    }

    public List<EvidenceDocument> findOtherDocumentsByHash(String hash) {
        if (hash == null || hash.isBlank() || claim.getClaimId() == null) {
            return List.of();
        }
        return documentRepository.findByFileHashAndClaim_ClaimIdNot(hash, claim.getClaimId());
    }

    public List<Claim> findOtherClaimsByProductSerial(String serialNumber) {
        if (serialNumber == null || serialNumber.isBlank()) {
            return List.of();
        }
        return claimRepository.findByProduct_SerialNumber(serialNumber).stream()
                .filter(c -> !c.getClaimId().equals(claim.getClaimId()))
                .collect(Collectors.toList());
    }

    public List<EvidenceDocument> findOtherInvoicesWithInvoiceNumber(String invoiceNumber) {
        if (invoiceNumber == null || invoiceNumber.isBlank()) {
            return List.of();
        }
        String normalizedTarget = invoiceNumber.trim().toUpperCase();
        List<EvidenceDocument> allInvoices = documentRepository.findByDocumentType(DocumentType.INVOICE);
        return allInvoices.stream()
                .filter(d -> d.getClaim() != null && !d.getClaim().getClaimId().equals(claim.getClaimId()))
                .filter(d -> {
                    String otherInvNum = getExtractedString(d, "invoiceNumber");
                    return otherInvNum != null && otherInvNum.trim().equalsIgnoreCase(normalizedTarget);
                })
                .collect(Collectors.toList());
    }

    public String getExtractedString(EvidenceDocument doc, String fieldName) {
        if (doc == null || doc.getExtractedData() == null || fieldName == null) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(doc.getExtractedData());
            if (root.hasNonNull(fieldName)) {
                return root.get(fieldName).asText();
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    public LocalDate getExtractedLocalDate(EvidenceDocument doc, String fieldName) {
        String val = getExtractedString(doc, fieldName);
        if (val == null || val.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(val.trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    public Double getExtractedDouble(EvidenceDocument doc, String fieldName) {
        if (doc == null || doc.getExtractedData() == null || fieldName == null) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(doc.getExtractedData());
            if (root.hasNonNull(fieldName)) {
                return root.get(fieldName).asDouble();
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
