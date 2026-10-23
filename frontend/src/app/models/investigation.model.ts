export interface InvestigationAction {
  actionId: number;
  findingId: number;
  userId: number;
  userName?: string;
  actionType: string;
  explanation: string;
  previousStatus?: string;
  newStatus: string;
  actionTime: string;
}

export interface CreateInvestigationActionRequest {
  actionType: string;
  explanation: string;
  previousStatus?: string;
  newStatus: string;
}
