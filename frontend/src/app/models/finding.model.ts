import { User } from './user.model';

export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type FindingStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';
export type EvidenceRole = 'CONFLICTING_VALUE' | 'DUPLICATE_OF' | 'SUPPORTING_EVIDENCE';

export interface EvidenceLink {
  findingId: number;
  documentId: number;
  documentType?: string;
  originalFilename?: string;
  fileHash?: string;
  evidenceRole: EvidenceRole;
  createdAt?: string;
}

export interface Finding {
  findingId: number;
  claimId: number;
  claimNumber?: string;
  claimStatus?: string;
  productModel?: string;
  productSerialNumber?: string;
  assignedTo?: User;
  ruleCode: string;
  severity: FindingSeverity;
  status: FindingStatus;
  description: string;
  createdAt?: string;
  linkedDocuments?: EvidenceLink[];
  actionsCount?: number;
}

export interface AssignFindingRequest {
  assignedToUserId: number;
}
