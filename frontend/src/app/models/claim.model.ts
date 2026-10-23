import { Finding } from './finding.model';

export type ClaimStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'FLAGGED' | 'RESOLVED';

export interface Claim {
  claimId: number;
  productId: number;
  productModel?: string;
  productSerialNumber?: string;
  userId: number;
  claimantName?: string;
  claimantEmail?: string;
  claimNumber: string;
  claimDate: string;
  status: ClaimStatus;
  issueDescription: string;
  createdAt?: string;
  updatedAt?: string;
  openFindingsCount?: number;
}

export interface ClaimRequest {
  productId: number;
  claimNumber: string;
  claimDate?: string;
  issueDescription: string;
}

export interface AnalysisResultResponse {
  claimId: number;
  claimNumber: string;
  claimStatus: string;
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  findingsCreated: number;
  activeFindingsCount: number;
  triggeredRuleCodes: string[];
  findings: Finding[];
}
