import { Claim } from './claim.model';
import { InvestigationAction } from './investigation.model';

export interface RuleTriggerStat {
  ruleCode: string;
  ruleName: string;
  count: number;
}

export interface ClaimMetrics {
  totalClaims: number;
  submitted: number;
  underReview: number;
  flagged: number;
  resolved: number;
  fraudRatePercentage: number;
}

export interface FindingMetrics {
  totalFindings: number;
  open: number;
  underInvestigation: number;
  resolved: number;
  dismissed: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
}

export interface SystemMetrics {
  totalProducts: number;
  totalEvidenceDocuments: number;
  manualOcrCorrections: number;
}

export interface DashboardStatsResponse {
  claimMetrics: ClaimMetrics;
  findingMetrics: FindingMetrics;
  topTriggeredRules: RuleTriggerStat[];
  recentActivities: InvestigationAction[];
  systemMetrics: SystemMetrics;
}

export interface ReportSummaryResponse {
  reportId: string;
  generatedAt: string;
  generatedBy: string;
  stats: DashboardStatsResponse;
  flaggedClaims: Claim[];
  recentAuditLog: InvestigationAction[];
}
