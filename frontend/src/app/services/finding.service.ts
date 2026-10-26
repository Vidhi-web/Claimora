import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Finding, FindingSeverity, FindingStatus, AssignFindingRequest } from '../models/finding.model';
import { InvestigationAction, InvestigationActionRequest } from '../models/investigation.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class FindingService {
  private readonly endpoint = '/findings';
  private cachedDefaultFindings: PaginatedResponse<Finding> | null = null;
  private cacheTime = 0;

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
  } = {}, forceRefresh = false): Observable<PaginatedResponse<Finding>> {
    const isDefault = !params.status && !params.severity && !params.assignedTo && !params.claimId && (!params.page || params.page === 0);
    const now = Date.now();
    if (!forceRefresh && isDefault && this.cachedDefaultFindings && (now - this.cacheTime) < 30000) {
      return of(this.cachedDefaultFindings);
    }

    return this.api.get<PaginatedResponse<Finding>>(this.endpoint, params as Record<string, string | number | boolean | undefined>).pipe(
      tap(res => {
        if (isDefault) {
          this.cachedDefaultFindings = res;
          this.cacheTime = Date.now();
        }
      })
    );
  }

  getFindingById(id: number): Observable<Finding> {
    return this.api.get<Finding>(`${this.endpoint}/${id}`);
  }

  assignFinding(findingId: number, assignedToUserId: number): Observable<Finding> {
    this.cachedDefaultFindings = null;
    const body: AssignFindingRequest = { assignedToUserId };
    return this.api.put<Finding>(`${this.endpoint}/${findingId}/assign`, body);
  }

  getActionsForFinding(findingId: number): Observable<InvestigationAction[]> {
    return this.api.get<InvestigationAction[]>(`${this.endpoint}/${findingId}/actions`);
  }

  addAction(findingId: number, request: InvestigationActionRequest): Observable<InvestigationAction> {
    this.cachedDefaultFindings = null;
    return this.api.post<InvestigationAction>(`${this.endpoint}/${findingId}/actions`, request);
  }
}
