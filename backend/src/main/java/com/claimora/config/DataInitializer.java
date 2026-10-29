package com.claimora.config;

import com.claimora.entity.*;
import com.claimora.repository.*;
import com.claimora.storage.DocumentStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Startup seeder creating default accounts, realistic baseline warranty/fraud records,
 * and ensuring sample evidence files exist on disk for download.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ClaimRepository claimRepository;
    private final EvidenceDocumentRepository documentRepository;
    private final FindingRepository findingRepository;
    private final EvidenceLinkRepository evidenceLinkRepository;
    private final InvestigationActionRepository actionRepository;
    private final PasswordEncoder passwordEncoder;
    private final DocumentStorageService storageService;

    @Value("${claimora.admin.email:${ADMIN_EMAIL:admin@claimora.internal}}")
    private String adminEmail;

    @Value("${claimora.admin.password:${ADMIN_PASSWORD:AdminPass123!}}")
    private String adminPassword;

    @Value("${claimora.admin.name:${ADMIN_NAME:Claimora Administrator}}")
    private String adminName;

    public DataInitializer(UserRepository userRepository,
                           ProductRepository productRepository,
                           ClaimRepository claimRepository,
                           EvidenceDocumentRepository documentRepository,
                           FindingRepository findingRepository,
                           EvidenceLinkRepository evidenceLinkRepository,
                           InvestigationActionRepository actionRepository,
                           PasswordEncoder passwordEncoder,
                           DocumentStorageService storageService) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.claimRepository = claimRepository;
        this.documentRepository = documentRepository;
        this.findingRepository = findingRepository;
        this.evidenceLinkRepository = evidenceLinkRepository;
        this.actionRepository = actionRepository;
        this.passwordEncoder = passwordEncoder;
        this.storageService = storageService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedBaselineData();
        ensureSampleFilesExist();
    }

    private void seedUsers() {
        if (!userRepository.existsByRole(Role.ADMIN)) {
            log.info("No ADMIN account detected. Seeding default ADMIN from environment configuration...");
            User admin = new User(
                    adminName.trim(),
                    adminEmail.trim().toLowerCase(),
                    passwordEncoder.encode(adminPassword),
                    Role.ADMIN,
                    UserStatus.ACTIVE
            );
            userRepository.save(admin);
            log.info("Default ADMIN successfully created: {}", adminEmail);
        }

        if (userRepository.findByEmail("alex.investigator@claimora.internal").isEmpty()) {
            User investigator = new User(
                    "Alex Investigator",
                    "alex.investigator@claimora.internal",
                    passwordEncoder.encode("InvestigatorPass123!"),
                    Role.INVESTIGATOR,
                    UserStatus.ACTIVE
            );
            userRepository.save(investigator);
            log.info("Default INVESTIGATOR successfully created: alex.investigator@claimora.internal");
        }

        if (userRepository.findByEmail("staff@claimora.internal").isEmpty()) {
            User staff = new User(
                    "Sarah Staff",
                    "staff@claimora.internal",
                    passwordEncoder.encode("StaffPass123!"),
                    Role.STAFF,
                    UserStatus.ACTIVE
            );
            userRepository.save(staff);
            log.info("Default STAFF successfully created: staff@claimora.internal");
        }
    }

    private void seedBaselineData() {
        if (productRepository.count() > 0) {
            return;
        }

        log.info("Seeding baseline products, claims, and planted fraud scenarios...");

        // Products
        Product p1 = new Product("SN-DELL-XPS15-001", "Dell XPS 15 9530", LocalDate.of(2025, 1, 10), LocalDate.of(2025, 1, 10), LocalDate.of(2027, 1, 10));
        Product p2 = new Product("SN-APPL-MBP16-002", "Apple MacBook Pro 16 M3", LocalDate.of(2025, 5, 15), LocalDate.of(2025, 5, 15), LocalDate.of(2026, 5, 15));
        Product p3 = new Product("SN-SAMS-S24U-003", "Samsung Galaxy S24 Ultra", LocalDate.of(2025, 2, 1), LocalDate.of(2025, 2, 1), LocalDate.of(2027, 2, 1));
        Product p4 = new Product("SN-LENO-X1C-004", "Lenovo ThinkPad X1 Carbon", LocalDate.of(2023, 8, 1), LocalDate.of(2023, 8, 1), LocalDate.of(2024, 8, 1));
        Product p5 = new Product("SN-SONY-WH5-005", "Sony WH-1000XM5 Headphones", LocalDate.of(2025, 6, 20), LocalDate.of(2025, 6, 20), LocalDate.of(2026, 6, 20));
        productRepository.saveAll(List.of(p1, p2, p3, p4, p5));

        User staffUser = userRepository.findByEmail("staff@claimora.internal").orElse(null);
        User investigatorUser = userRepository.findByEmail("alex.investigator@claimora.internal").orElse(null);
        if (staffUser == null) return;

        // Claims
        Claim c1 = new Claim(p1, staffUser, "CLM-2026-000101", LocalDate.of(2026, 2, 10), ClaimStatus.FLAGGED, "Intermittent display blacking out under GPU load.");
        Claim c2 = new Claim(p1, staffUser, "CLM-2026-000102", LocalDate.of(2026, 2, 28), ClaimStatus.UNDER_REVIEW, "Re-claim on same Dell XPS: Battery charging port unstable.");
        Claim c3 = new Claim(p2, staffUser, "CLM-2026-000103", LocalDate.of(2026, 3, 1), ClaimStatus.SUBMITTED, "Keyboard keycap detached and logic board overheating.");
        Claim c4 = new Claim(p4, staffUser, "CLM-2026-000104", LocalDate.of(2026, 1, 15), ClaimStatus.FLAGGED, "Laptop will not power on; battery replaced by 3rd party.");
        Claim c5 = new Claim(p5, staffUser, "CLM-2026-000105", LocalDate.of(2026, 1, 28), ClaimStatus.RESOLVED, "Right hinge broken due to material fatigue.");
        claimRepository.saveAll(List.of(c1, c2, c3, c4, c5));

        // Evidence Documents
        String hashDup = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        String hashExp = "c4ca4238a0b923820dcc509a6f75849b2938a924b172a3e5c94295f128e4e501";

        EvidenceDocument d1 = new EvidenceDocument(
                c1, DocumentType.INVOICE, "storage/uploads/inv_101.pdf", hashDup,
                "invoice_dell_official.pdf", "application/pdf", 102400L, "PROCESSED",
                "{\"invoiceNumber\": \"INV-2025-00101\", \"invoiceDate\": \"2025-01-10\", \"serialNumber\": \"SN-DELL-XPS15-001\", \"totalAmount\": 1899.99}"
        );
        EvidenceDocument d2 = new EvidenceDocument(
                c2, DocumentType.INVOICE, "storage/uploads/inv_dup.pdf", hashDup,
                "invoice_duplicate_scan.pdf", "application/pdf", 102400L, "PROCESSED",
                "{\"invoiceNumber\": \"INV-2025-00101\", \"invoiceDate\": \"2025-01-10\", \"serialNumber\": \"SN-DELL-XPS15-001\", \"totalAmount\": 1899.99}"
        );
        EvidenceDocument d3 = new EvidenceDocument(
                c4, DocumentType.INVOICE, "storage/uploads/inv_expired.pdf", hashExp,
                "lenovo_store_invoice.pdf", "application/pdf", 84200L, "PROCESSED",
                "{\"invoiceNumber\": \"INV-2023-08819\", \"invoiceDate\": \"2023-08-01\", \"serialNumber\": \"SN-LENO-X1C-004\", \"totalAmount\": 1499.00}"
        );
        documentRepository.saveAll(List.of(d1, d2, d3));

        // Findings
        Finding f1 = new Finding(
                c1, investigatorUser, "DUPLICATE_INVOICE", FindingSeverity.HIGH, FindingStatus.OPEN,
                "Invoice number INV-2025-00101 and identical SHA-256 digest submitted in Claim CLM-2026-000101 also appears in Claim CLM-2026-000102."
        );
        Finding f2 = new Finding(
                c2, investigatorUser, "SERIAL_REUSE", FindingSeverity.HIGH, FindingStatus.UNDER_INVESTIGATION,
                "Multiple repeat claims filed on serial number SN-DELL-XPS15-001 within 18 days."
        );
        Finding f3 = new Finding(
                c4, null, "DATE_CONFLICT", FindingSeverity.HIGH, FindingStatus.OPEN,
                "Claim filed on 2026-01-15, but product warranty expired on 2024-08-01 (outside warranty coverage window)."
        );
        findingRepository.saveAll(List.of(f1, f2, f3));

        // Evidence Links
        EvidenceLink l1 = new EvidenceLink(f1, d1, EvidenceRole.CONFLICTING_VALUE);
        EvidenceLink l2 = new EvidenceLink(f1, d2, EvidenceRole.DUPLICATE_OF);
        EvidenceLink l3 = new EvidenceLink(f2, d1, EvidenceRole.SUPPORTING_EVIDENCE);
        EvidenceLink l4 = new EvidenceLink(f3, d3, EvidenceRole.CONFLICTING_VALUE);
        evidenceLinkRepository.saveAll(List.of(l1, l2, l3, l4));

        // Investigation Actions
        InvestigationAction act1 = new InvestigationAction(
                f2, investigatorUser != null ? investigatorUser : staffUser,
                ActionType.STATUS_CHANGE, "Commencing deep forensic review of repeat claim history.",
                FindingStatus.OPEN, FindingStatus.UNDER_INVESTIGATION
        );
        actionRepository.save(act1);

        log.info("Baseline seed successfully initialized.");
    }

    private void ensureSampleFilesExist() {
        try {
            List<EvidenceDocument> docs = documentRepository.findAll();
            for (EvidenceDocument doc : docs) {
                String claimNumber = "Claim";
                String productModel = "Unknown Product";
                if (doc.getClaim() != null) {
                    claimNumber = doc.getClaim().getClaimNumber();
                    if (doc.getClaim().getProduct() != null) {
                        productModel = doc.getClaim().getProduct().getModel();
                    }
                }
                String docType = doc.getDocumentType() != null ? doc.getDocumentType().name() : "EVIDENCE";
                storageService.loadOrCreateDocumentResource(
                        doc.getFilePath(),
                        doc.getOriginalFilename(),
                        doc.getMimeType(),
                        docType,
                        claimNumber,
                        productModel,
                        doc.getFileHash(),
                        doc.getExtractedData()
                );
            }
            log.info("Ensured {} baseline evidence files exist on disk in storage repository.", docs.size());
        } catch (Exception e) {
            log.warn("Non-fatal: could not pre-seed all sample evidence files: {}", e.getMessage());
        }
    }
}
