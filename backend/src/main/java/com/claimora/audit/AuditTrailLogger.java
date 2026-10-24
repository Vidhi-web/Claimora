package com.claimora.audit;

import com.claimora.entity.ActionType;
import com.claimora.entity.Finding;
import com.claimora.entity.FindingStatus;
import com.claimora.entity.InvestigationAction;
import com.claimora.entity.User;
import com.claimora.repository.InvestigationActionRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Append-only audit trail logger recording investigator actions and status transitions.
 * Owner: Anuj (InvestigationAction)
 */
@Component
public class AuditTrailLogger {

    private final InvestigationActionRepository actionRepository;

    public AuditTrailLogger(InvestigationActionRepository actionRepository) {
        this.actionRepository = actionRepository;
    }

    /**
     * Appends an immutable audit entry to the investigation timeline.
     */
    public InvestigationAction logAction(Finding finding, User user, ActionType actionType,
                                         String explanation, FindingStatus previousStatus, FindingStatus newStatus) {
        InvestigationAction action = new InvestigationAction(
                finding,
                user,
                actionType,
                explanation,
                previousStatus,
                newStatus
        );
        action.setActionTime(Instant.now());
        return actionRepository.save(action);
    }
}
