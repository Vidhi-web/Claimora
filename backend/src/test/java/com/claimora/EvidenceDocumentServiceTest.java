package com.claimora;

import com.claimora.dto.EvidenceDocumentResponse;
import com.claimora.dto.UpdateExtractedDataRequest;
import com.claimora.entity.*;
import com.claimora.ocr.OcrResult;
import com.claimora.ocr.OcrService;
import com.claimora.repository.*;
import com.claimora.security.CustomUserDetails;
import com.claimora.service.EvidenceDocumentService;
import com.claimora.storage.DocumentStorageService;
import com.claimora.storage.StoredFileInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvidenceDocumentServiceTest {

    @Mock
    private EvidenceDocumentRepository documentRepository;

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private EvidenceLinkRepository evidenceLinkRepository;

    @Mock
    private InvestigationActionRepository actionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DocumentStorageService storageService;

    @Mock
    private OcrService ocrService;

    private EvidenceDocumentService documentService;

    private User staffUser;
    private CustomUserDetails staffDetails;
    private Claim claim;

    @BeforeEach
    void setUp() {
        documentService = new EvidenceDocumentService(
                documentRepository,
                claimRepository,
                evidenceLinkRepository,
                actionRepository,
                userRepository,
                storageService,
                ocrService
        );

        staffUser = new User("Staff", "staff@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        staffUser.setUserId(10L);
        staffDetails = new CustomUserDetails(staffUser);

        Product product = new Product("SN-1", "Model A", LocalDate.now(), LocalDate.now(), LocalDate.now().plusYears(1));
        claim = new Claim(product, staffUser, "CLM-100", LocalDate.now(), ClaimStatus.SUBMITTED, "Issue");
        claim.setClaimId(1L);
    }

    @Test
    @DisplayName("Should successfully store file, perform OCR, and persist EvidenceDocument")
    void testUploadDocumentSuccess() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "invoice.pdf",
                "application/pdf",
                "Invoice text".getBytes(StandardCharsets.UTF_8)
        );

        StoredFileInfo storedInfo = new StoredFileInfo(
                "claims/1/invoice.pdf",
                "a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef",
                "invoice.pdf",
                "application/pdf",
                12L
        );

        Path dummyPath = Path.of("dummy/path/invoice.pdf");
        OcrResult ocrResult = new OcrResult("raw", "{\"invoiceNumber\":\"INV-1\"}", "PROCESSED");

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));
        when(storageService.storeFile(file, 1L)).thenReturn(storedInfo);
        when(storageService.resolveAbsolutePath("claims/1/invoice.pdf")).thenReturn(dummyPath);
        when(ocrService.processDocument(dummyPath, "application/pdf")).thenReturn(ocrResult);
        when(documentRepository.save(any(EvidenceDocument.class))).thenAnswer(i -> {
            EvidenceDocument doc = i.getArgument(0);
            doc.setDocumentId(500L);
            return doc;
        });

        EvidenceDocumentResponse response = documentService.uploadDocument(1L, file, DocumentType.INVOICE, staffDetails);

        assertNotNull(response);
        assertEquals(500L, response.getDocumentId());
        assertEquals("invoice.pdf", response.getOriginalFilename());
        assertEquals("PROCESSED", response.getOcrStatus());
        assertEquals("{\"invoiceNumber\":\"INV-1\"}", response.getExtractedData());
        verify(documentRepository).save(any(EvidenceDocument.class));
    }

    @Test
    @DisplayName("Staff user uploading to another user's claim should receive AccessDeniedException")
    void testStaffCannotUploadToOtherClaim() {
        User otherUser = new User("Other", "other@claimora.internal", "hash", Role.STAFF, UserStatus.ACTIVE);
        otherUser.setUserId(99L);
        claim.setUser(otherUser);

        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "data".getBytes());

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        assertThrows(AccessDeniedException.class, () -> {
            documentService.uploadDocument(1L, file, DocumentType.INVOICE, staffDetails);
        });
        verify(storageService, never()).storeFile(any(), any());
    }

    @Test
    @DisplayName("Updating extracted data should set ocrStatus to MANUAL and record CORRECT_VALUE audit action")
    void testUpdateExtractedDataSuccess() {
        EvidenceDocument doc = new EvidenceDocument(
                claim,
                DocumentType.INVOICE,
                "claims/1/doc.pdf",
                "hash",
                "doc.pdf",
                "application/pdf",
                100L,
                "PROCESSED",
                "{}"
        );
        doc.setDocumentId(200L);

        Finding finding = new Finding(claim, staffUser, "DUPLICATE_INVOICE", FindingSeverity.HIGH, FindingStatus.OPEN, "alert");
        finding.setFindingId(300L);

        EvidenceLink link = new EvidenceLink(finding, doc, EvidenceRole.CONFLICTING_VALUE);

        when(documentRepository.findById(200L)).thenReturn(Optional.of(doc));
        when(documentRepository.save(any(EvidenceDocument.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById(10L)).thenReturn(Optional.of(staffUser));
        when(evidenceLinkRepository.findById_DocumentId(200L)).thenReturn(List.of(link));

        UpdateExtractedDataRequest request = new UpdateExtractedDataRequest("{\"amount\": 1500.00}", "Corrected invoice total");

        EvidenceDocumentResponse response = documentService.updateExtractedData(200L, request, staffDetails);

        assertNotNull(response);
        assertEquals("MANUAL", response.getOcrStatus());
        assertEquals("{\"amount\": 1500.00}", response.getExtractedData());
        verify(actionRepository).save(any(InvestigationAction.class));
    }
}
