package com.claimora.analysis.rules;

import com.claimora.analysis.AnalysisContext;
import com.claimora.analysis.AnalysisRule;
import com.claimora.analysis.FindingDraft;
import com.claimora.entity.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Rule 4: Flags discrepancies between invoice OCR extracted details (serial number, model) and the registered product.
 */
@Component
public class InvoiceMismatchRule implements AnalysisRule {

    public static final String RULE_CODE = "INVOICE_MISMATCH";

    @Override
    public String getRuleCode() {
        return RULE_CODE;
    }

    @Override
    public String getRuleName() {
        return "Invoice Data vs Product Record Mismatch";
    }

    @Override
    public int getWeight() {
        return 30;
    }

    @Override
    public List<FindingDraft> evaluate(AnalysisContext context) {
        List<FindingDraft> findings = new ArrayList<>();
        Product product = context.getClaim().getProduct();
        if (product == null) {
            return findings;
        }

        List<EvidenceDocument> invoices = context.getClaimDocumentsByType(DocumentType.INVOICE);
        for (EvidenceDocument inv : invoices) {
            String extractedSerial = context.getExtractedString(inv, "serialNumber");
            String extractedModel = context.getExtractedString(inv, "model");

            boolean serialMismatch = false;
            if (extractedSerial != null && !extractedSerial.isBlank() && product.getSerialNumber() != null) {
                String s1 = extractedSerial.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
                String s2 = product.getSerialNumber().replaceAll("[^A-Za-z0-9]", "").toUpperCase();
                if (!s1.equals(s2)) {
                    serialMismatch = true;
                }
            }

            boolean modelMismatch = false;
            if (extractedModel != null && !extractedModel.isBlank() && product.getModel() != null) {
                String m1 = extractedModel.toLowerCase().trim();
                String m2 = product.getModel().toLowerCase().trim();
                if (!m1.equals(m2) && !m1.contains(m2) && !m2.contains(m1)) {
                    modelMismatch = true;
                }
            }

            if (serialMismatch || modelMismatch) {
                String description;
                if (serialMismatch && modelMismatch) {
                    description = String.format(
                            "Invoice serial %s and model \"%s\" conflict with product record %s (%s).",
                            extractedSerial, extractedModel, product.getSerialNumber(), product.getModel()
                    );
                } else if (serialMismatch) {
                    description = String.format(
                            "Invoice serial %s conflicts with registered product record %s (%s).",
                            extractedSerial, product.getSerialNumber(), product.getModel()
                    );
                } else {
                    description = String.format(
                            "Invoice model \"%s\" conflicts with registered product record %s.",
                            extractedModel, product.getModel()
                    );
                }

                FindingDraft draft = new FindingDraft(RULE_CODE, FindingSeverity.MEDIUM, description);
                draft.addEvidenceLink(inv, EvidenceRole.CONFLICTING_VALUE);
                findings.add(draft);
                break;
            }
        }

        return findings;
    }
}
