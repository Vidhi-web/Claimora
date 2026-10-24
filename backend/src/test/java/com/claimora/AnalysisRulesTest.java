package com.claimora;

import com.claimora.analysis.AnalysisContext;
import com.claimora.analysis.FindingDraft;
import com.claimora.analysis.rules.*;
import com.claimora.entity.*;
import com.claimora.repository.ClaimRepository;
import com.claimora.repository.EvidenceDocumentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnalysisRulesTest {

    @Mock
    private EvidenceDocumentRepository documentRepository;

    @Mock
    private ClaimRepository claimRepository;

    private ObjectMapper objectMapper;
    private Product product;
    private User claimant;
    private Claim claim;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        product = new Product("SN-DELL-XPS15-001", "Dell XPS 15 9530",
                LocalDate.of(2025, 1, 10),
                LocalDate.of(2025, 1, 10),
                LocalDate.of(2027, 1, 10));
        product.setProductId(1L);

        claimant = new User("John Doe", "john@example.com", "hash", Role.STAFF, UserStatus.ACTIVE);
        claimant.setUserId(10L);

        claim = new Claim(product, claimant, "CLM-2026-001", LocalDate.of(2025, 8, 14), ClaimStatus.SUBMITTED, "Test issue");
        claim.setClaimId(100L);
    }

    // --- Rule 1: DuplicateInvoiceRule Tests ---
    @Test
    void testDuplicateInvoiceRule_Clean_NoFindings() {
        DuplicateInvoiceRule rule = new DuplicateInvoiceRule();
        EvidenceDocument invoice = new EvidenceDocument(claim, DocumentType.INVOICE, "/path/inv.pdf",
                "hash111", "inv.pdf", "application/pdf", 1000L, "PROCESSED",
                "{\"invoiceNumber\": \"INV-UNIQUE-1\"}");
        invoice.setDocumentId(201L);

        when(documentRepository.findByDocumentType(DocumentType.INVOICE)).thenReturn(List.of(invoice));
        when(documentRepository.findByFileHashAndClaim_ClaimIdNot("hash111", 100L)).thenReturn(List.of());

        AnalysisContext context = new AnalysisContext(claim, List.of(invoice), documentRepository, claimRepository, objectMapper);
        List<FindingDraft> findings = rule.evaluate(context);

        assertTrue(findings.isEmpty());
    }

    @Test
    void testDuplicateInvoiceRule_DuplicateInvoiceNumberFound() {
        DuplicateInvoiceRule rule = new DuplicateInvoiceRule();
        EvidenceDocument invoice = new EvidenceDocument(claim, DocumentType.INVOICE, "/path/inv1.pdf",
                "hash111", "inv1.pdf", "application/pdf", 1000L, "PROCESSED",
                "{\"invoiceNumber\": \"INV-DUP-99201\"}");
        invoice.setDocumentId(201L);

        Claim otherClaim = new Claim(product, claimant, "CLM-2026-002", LocalDate.of(2025, 9, 2), ClaimStatus.FLAGGED, "Other");
        otherClaim.setClaimId(101L);

        EvidenceDocument otherInvoice = new EvidenceDocument(otherClaim, DocumentType.INVOICE, "/path/inv2.pdf",
                "hash222", "inv2.pdf", "application/pdf", 1000L, "PROCESSED",
                "{\"invoiceNumber\": \"INV-DUP-99201\"}");
        otherInvoice.setDocumentId(202L);

        when(documentRepository.findByDocumentType(DocumentType.INVOICE)).thenReturn(List.of(invoice, otherInvoice));
        when(documentRepository.findByFileHashAndClaim_ClaimIdNot("hash111", 100L)).thenReturn(List.of());

        AnalysisContext context = new AnalysisContext(claim, List.of(invoice), documentRepository, claimRepository, objectMapper);
        List<FindingDraft> findings = rule.evaluate(context);

        assertEquals(1, findings.size());
        FindingDraft finding = findings.get(0);
        assertEquals(DuplicateInvoiceRule.RULE_CODE, finding.getRuleCode());
        assertEquals(FindingSeverity.HIGH, finding.getSeverity());
        assertTrue(finding.getDescription().contains("INV-DUP-99201"));
        assertEquals(2, finding.getEvidenceLinks().size());
        assertEquals(EvidenceRole.CONFLICTING_VALUE, finding.getEvidenceLinks().get(0).getRole());
        assertEquals(EvidenceRole.DUPLICATE_OF, finding.getEvidenceLinks().get(1).getRole());
    }

    // --- Rule 2: SerialReuseRule Tests ---
    @Test
    void testSerialReuseRule_RepeatClaimDetected() {
        SerialReuseRule rule = new SerialReuseRule();

        Claim priorClaim = new Claim(product, claimant, "CLM-2026-000", LocalDate.of(2025, 8, 1), ClaimStatus.SUBMITTED, "Prior");
        priorClaim.setClaimId(99L);

        EvidenceDocument doc = new EvidenceDocument(claim, DocumentType.REPAIR_REPORT, "/path/rep.pdf",
                "hashRep", "rep.pdf", "application/pdf", 1000L, "PROCESSED", "{}");
        doc.setDocumentId(301L);

        when(claimRepository.findByProduct_SerialNumber("SN-DELL-XPS15-001")).thenReturn(List.of(claim, priorClaim));
        when(documentRepository.findByClaim_ClaimId(99L)).thenReturn(List.of());

        AnalysisContext context = new AnalysisContext(claim, List.of(doc), documentRepository, claimRepository, objectMapper);
        List<FindingDraft> findings = rule.evaluate(context);

        assertEquals(1, findings.size());
        FindingDraft draft = findings.get(0);
        assertEquals(SerialReuseRule.RULE_CODE, draft.getRuleCode());
        assertEquals(FindingSeverity.HIGH, draft.getSeverity());
        assertTrue(draft.getDescription().contains("already claimed in CLM-2026-000"));
    }

    // --- Rule 3: DateConflictRule Tests ---
    @Test
    void testDateConflictRule_WarrantyExpired() {
        DateConflictRule rule = new DateConflictRule();
        claim.setClaimDate(LocalDate.of(2028, 5, 1)); // Warranty ended 2027-01-10

        AnalysisContext context = new AnalysisContext(claim, List.of(), documentRepository, claimRepository, objectMapper);
        List<FindingDraft> findings = rule.evaluate(context);

        assertEquals(1, findings.size());
        FindingDraft draft = findings.get(0);
        assertEquals(DateConflictRule.RULE_CODE, draft.getRuleCode());
        assertEquals(FindingSeverity.HIGH, draft.getSeverity());
        assertTrue(draft.getDescription().contains("outside the manufacturer warranty window"));
    }

    @Test
    void testDateConflictRule_InvoiceDateAfterClaim() {
        DateConflictRule rule = new DateConflictRule();
        claim.setClaimDate(LocalDate.of(2025, 8, 14));

        EvidenceDocument invoice = new EvidenceDocument(claim, DocumentType.INVOICE, "/path/inv.pdf",
                "hashInv", "inv.pdf", "application/pdf", 1000L, "PROCESSED",
                "{\"invoiceDate\": \"2025-09-01\"}"); // invoice date after claim date!
        invoice.setDocumentId(205L);

        AnalysisContext context = new AnalysisContext(claim, List.of(invoice), documentRepository, claimRepository, objectMapper);
        List<FindingDraft> findings = rule.evaluate(context);

        assertEquals(1, findings.size());
        assertTrue(findings.get(0).getDescription().contains("after claim submission date"));
    }

    // --- Rule 4: InvoiceMismatchRule Tests ---
    @Test
    void testInvoiceMismatchRule_ConflictingSerialAndModel() {
        InvoiceMismatchRule rule = new InvoiceMismatchRule();

        EvidenceDocument invoice = new EvidenceDocument(claim, DocumentType.INVOICE, "/path/inv.pdf",
                "hashInv", "inv.pdf", "application/pdf", 1000L, "PROCESSED",
                "{\"serialNumber\": \"SN-DELL-WRONG-999\", \"model\": \"Dell Alienware M16\"}");
        invoice.setDocumentId(206L);

        AnalysisContext context = new AnalysisContext(claim, List.of(invoice), documentRepository, claimRepository, objectMapper);
        List<FindingDraft> findings = rule.evaluate(context);

        assertEquals(1, findings.size());
        FindingDraft draft = findings.get(0);
        assertEquals(InvoiceMismatchRule.RULE_CODE, draft.getRuleCode());
        assertEquals(FindingSeverity.MEDIUM, draft.getSeverity());
        assertTrue(draft.getDescription().contains("SN-DELL-WRONG-999"));
        assertTrue(draft.getDescription().contains("Dell Alienware M16"));
    }

    // --- Rule 5: DuplicatePhotoRule Tests ---
    @Test
    void testDuplicatePhotoRule_DuplicateHashFound() {
        DuplicatePhotoRule rule = new DuplicatePhotoRule();

        EvidenceDocument photo = new EvidenceDocument(claim, DocumentType.PHOTO, "/path/photo1.jpg",
                "sha256photoHash", "photo1.jpg", "image/jpeg", 5000L, "PROCESSED", "{}");
        photo.setDocumentId(401L);

        Claim otherClaim = new Claim(product, claimant, "CLM-2026-009", LocalDate.of(2025, 12, 10), ClaimStatus.FLAGGED, "Headphone");
        otherClaim.setClaimId(109L);

        EvidenceDocument otherPhoto = new EvidenceDocument(otherClaim, DocumentType.PHOTO, "/path/photo2.jpg",
                "sha256photoHash", "photo2.jpg", "image/jpeg", 5000L, "PROCESSED", "{}");
        otherPhoto.setDocumentId(402L);

        when(documentRepository.findByFileHashAndClaim_ClaimIdNot("sha256photoHash", 100L)).thenReturn(List.of(otherPhoto));

        AnalysisContext context = new AnalysisContext(claim, List.of(photo), documentRepository, claimRepository, objectMapper);
        List<FindingDraft> findings = rule.evaluate(context);

        assertEquals(1, findings.size());
        FindingDraft draft = findings.get(0);
        assertEquals(DuplicatePhotoRule.RULE_CODE, draft.getRuleCode());
        assertEquals(FindingSeverity.HIGH, draft.getSeverity());
        assertTrue(draft.getDescription().contains("CLM-2026-009"));
        assertEquals(2, draft.getEvidenceLinks().size());
        assertEquals(EvidenceRole.CONFLICTING_VALUE, draft.getEvidenceLinks().get(0).getRole());
        assertEquals(EvidenceRole.DUPLICATE_OF, draft.getEvidenceLinks().get(1).getRole());
    }

    // --- Rule 6: RepairPartsMismatchRule Tests ---
    @Test
    void testRepairPartsMismatchRule_DiscrepantParts() {
        RepairPartsMismatchRule rule = new RepairPartsMismatchRule();

        EvidenceDocument repairReport = new EvidenceDocument(claim, DocumentType.REPAIR_REPORT, "/path/rep.pdf",
                "hashRep", "rep.pdf", "application/pdf", 1000L, "PROCESSED",
                "{\"repairPart\": \"Liquid Retina XDR Display Module\"}");
        repairReport.setDocumentId(501L);

        EvidenceDocument partsInvoice = new EvidenceDocument(claim, DocumentType.PARTS_INVOICE, "/path/parts.pdf",
                "hashParts", "parts.pdf", "application/pdf", 1000L, "PROCESSED",
                "{\"billedPart\": \"Li-Ion Battery Pack 99.6Wh\"}");
        partsInvoice.setDocumentId(502L);

        AnalysisContext context = new AnalysisContext(claim, List.of(repairReport, partsInvoice), documentRepository, claimRepository, objectMapper);
        List<FindingDraft> findings = rule.evaluate(context);

        assertEquals(1, findings.size());
        FindingDraft draft = findings.get(0);
        assertEquals(RepairPartsMismatchRule.RULE_CODE, draft.getRuleCode());
        assertEquals(FindingSeverity.MEDIUM, draft.getSeverity());
        assertTrue(draft.getDescription().contains("Liquid Retina XDR Display Module"));
        assertTrue(draft.getDescription().contains("Li-Ion Battery Pack 99.6Wh"));
        assertEquals(2, draft.getEvidenceLinks().size());
    }

    @Test
    void testRepairPartsMismatchRule_MatchingParts_NoFinding() {
        RepairPartsMismatchRule rule = new RepairPartsMismatchRule();

        EvidenceDocument repairReport = new EvidenceDocument(claim, DocumentType.REPAIR_REPORT, "/path/rep.pdf",
                "hashRep", "rep.pdf", "application/pdf", 1000L, "PROCESSED",
                "{\"repairPart\": \"OLED Display Assembly\"}");

        EvidenceDocument partsInvoice = new EvidenceDocument(claim, DocumentType.PARTS_INVOICE, "/path/parts.pdf",
                "hashParts", "parts.pdf", "application/pdf", 1000L, "PROCESSED",
                "{\"billedPart\": \"Display Assembly Screen\"}");

        AnalysisContext context = new AnalysisContext(claim, List.of(repairReport, partsInvoice), documentRepository, claimRepository, objectMapper);
        List<FindingDraft> findings = rule.evaluate(context);

        assertTrue(findings.isEmpty());
    }
}
