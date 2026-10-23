export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FindingStatus = 'OPEN' | 'INVESTIGATING' | 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE' | 'RESOLVED';

export interface Finding {
  findingId: number;
  claimId: number;
  ruleCode: string;
  severity: FindingSeverity;
  status: FindingStatus;
  description: string;
  createdAt?: string;
}

export interface RiskAnalysisResult {
  claimId: number;
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  triggeredRuleCodes: string[];
}
