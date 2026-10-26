package com.claimora.service;

import com.claimora.dto.EvidenceDocumentResponse;
import com.claimora.dto.UpdateExtractedDataRequest;
import com.claimora.entity.*;
import com.claimora.exception.ResourceNotFoundException;
import com.claimora.exception.ValidationException;
import com.claimora.ocr.OcrResult;
import com.claimora.ocr.OcrService;
import com.claimora.repository.*;
import com.claimora.security.CustomUserDetails;
import com.claimora.storage.DocumentStorageService;
import com.claimora.storage.StoredFileInfo;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

/**
 * Service for evidence document management, secure upload, protected storage,
 * and OCR field extraction.
 * Owner: Kalp (EvidenceDocument)
 */
@Service
public class EvidenceDocumentService {

    private final EvidenceDocumentRepository documentRepository;
    private final ClaimRepository claimRepository;
    private final EvidenceLinkRepository evidenceLinkRepository;
    private final InvestigationActionRepository actionRepository;
    private final UserRepository userRepository;
    private final DocumentStorageService storageService;
    private final OcrService ocrService;

    public EvidenceDocumentService(EvidenceDocumentRepository documentRepository,
                                   ClaimRepository claimRepository,
                                   EvidenceLinkRepository evidenceLinkRepository,
                                   InvestigationActionRepository actionRepository,
                                   UserRepository userRepository,
                                   DocumentStorageService storageService,
                                   OcrService ocrService) {
        this.documentRepository = documentRepository;
        this.claimRepository = claimRepository;
        this.evidenceLinkRepository = evidenceLinkRepository;
        this.actionRepository = actionRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.ocrService = ocrService;
    }

    @Transactional
    public EvidenceDocumentResponse uploadDocument(Long claimId, MultipartFile file, DocumentType documentType, CustomUserDetails userDetails) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Uploaded file cannot be empty");
        }
        if (documentType == null) {
            throw new ValidationException("Document type is required");
        }

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            if (!claim.getUser().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to upload evidence for this claim");
            }
        }

        // Store file on protected disk and calculate SHA-256
        StoredFileInfo storedInfo = storageService.storeFile(file, claimId);

        // Run OCR text extraction and field extraction
        Path absolutePath = storageService.resolveAbsolutePath(storedInfo.filePath());
        OcrResult ocrResult = ocrService.processDocument(absolutePath, storedInfo.mimeType());

        EvidenceDocument document = new EvidenceDocument(
                claim,
                documentType,
                storedInfo.filePath(),
                storedInfo.fileHash(),
                storedInfo.originalFilename(),
                storedInfo.mimeType(),
                storedInfo.fileSize(),
                ocrResult.ocrStatus(),
                ocrResult.extractedDataJson()
        );

        EvidenceDocument saved = documentRepository.save(document);
        return EvidenceDocumentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<EvidenceDocumentResponse> getDocumentsForClaim(Long claimId, CustomUserDetails userDetails) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            if (!claim.getUser().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to access documents for this claim");
            }
        }

        return documentRepository.findByClaimIdWithClaim(claimId)
                .stream()
                .map(EvidenceDocumentResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EvidenceDocumentResponse> getDocuments(Long claimId, CustomUserDetails userDetails) {
        if (claimId != null) {
            return getDocumentsForClaim(claimId, userDetails);
        }

        if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            return documentRepository.findByUserIdWithClaim(userDetails.getUserId())
                    .stream()
                    .map(EvidenceDocumentResponse::fromEntity)
                    .toList();
        }

        return documentRepository.findAllWithClaim()
                .stream()
                .map(EvidenceDocumentResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EvidenceDocumentResponse getDocumentById(Long documentId, CustomUserDetails userDetails) {
        EvidenceDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Evidence document not found with id: " + documentId));

        if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            if (!doc.getClaim().getUser().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to view this document");
            }
        }

        return EvidenceDocumentResponse.fromEntity(doc);
    }

    @Transactional(readOnly = true)
    public DocumentDownload loadDocumentFile(Long documentId, CustomUserDetails userDetails) {
        EvidenceDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Evidence document not found with id: " + documentId));

        if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            if (!doc.getClaim().getUser().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to download this document");
            }
        }

        Resource resource = storageService.loadFileAsResource(doc.getFilePath());
        return new DocumentDownload(resource, doc.getOriginalFilename(), doc.getMimeType());
    }

    @Transactional
    public EvidenceDocumentResponse updateExtractedData(Long documentId, UpdateExtractedDataRequest request, CustomUserDetails userDetails) {
        EvidenceDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Evidence document not found with id: " + documentId));

        if (userDetails != null && userDetails.getRole() == Role.STAFF) {
            if (!doc.getClaim().getUser().getUserId().equals(userDetails.getUserId())) {
                throw new AccessDeniedException("You do not have permission to modify this document");
            }
        }

        doc.setExtractedData(request.getExtractedData().trim());
        doc.setOcrStatus("MANUAL");
        EvidenceDocument saved = documentRepository.save(doc);

        // Audit Trail: Record a CORRECT_VALUE action for all findings linked to this document
        if (userDetails != null) {
            User actingUser = userRepository.findById(userDetails.getUserId()).orElse(null);
            if (actingUser != null) {
                List<EvidenceLink> links = evidenceLinkRepository.findById_DocumentId(documentId);
                for (EvidenceLink link : links) {
                    Finding finding = link.getFinding();
                    String reason = request.getReason() != null && !request.getReason().isBlank()
                            ? request.getReason()
                            : "Manual correction of OCR extracted fields on document #" + documentId;
                    InvestigationAction action = new InvestigationAction(
                            finding,
                            actingUser,
                            ActionType.CORRECT_VALUE,
                            reason,
                            finding.getStatus(),
                            finding.getStatus()
                    );
                    actionRepository.save(action);
                }
            }
        }

        return EvidenceDocumentResponse.fromEntity(saved);
    }

    public record DocumentDownload(Resource resource, String filename, String mimeType) {}
}
