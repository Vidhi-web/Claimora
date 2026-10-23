import { FindingStatus } from './finding.model';

export type ActionType = 'COMMENT' | 'REQUEST_EVIDENCE' | 'CORRECT_VALUE' | 'STATUS_CHANGE' | 'RESOLVE' | 'DISMISS' | 'REOPEN';

export interface InvestigationAction {
  actionId: number;
  findingId: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  actionType: ActionType;
  explanation: string;
  previousStatus?: FindingStatus;
  newStatus: FindingStatus;
  actionTime: string;
}

export interface InvestigationActionRequest {
  actionType: ActionType;
  explanation: string;
  newStatus?: FindingStatus;
}
