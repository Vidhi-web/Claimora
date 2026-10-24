import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Finding, FindingSeverity, FindingStatus, AssignFindingRequest } from '../models/finding.model';
import { InvestigationAction, InvestigationActionRequest } from '../models/investigation.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class FindingService {
  private readonly endpoint = '/findings';

  constructor(private api: ApiService) {}

  getFindings(params: {
    status?: FindingStatus;
    severity?: FindingSeverity;
    assignedTo?: number;
    claimId?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  } = {}): Observable<PaginatedResponse<Finding>> {
    return this.api.get<PaginatedResponse<Finding>>(this.endpoint, params as Record<string, string | number | boolean | undefined>);
  }

  getFindingById(id: number): Observable<Finding> {
    return this.api.get<Finding>(`${this.endpoint}/${id}`);
  }

  assignFinding(findingId: number, assignedToUserId: number): Observable<Finding> {
    const body: AssignFindingRequest = { assignedToUserId };
    return this.api.put<Finding>(`${this.endpoint}/${findingId}/assign`, body);
  }

  getActionsForFinding(findingId: number): Observable<InvestigationAction[]> {
    return this.api.get<InvestigationAction[]>(`${this.endpoint}/${findingId}/actions`);
  }

  addAction(findingId: number, request: InvestigationActionRequest): Observable<InvestigationAction> {
    return this.api.post<InvestigationAction>(`${this.endpoint}/${findingId}/actions`, request);
  }
}
