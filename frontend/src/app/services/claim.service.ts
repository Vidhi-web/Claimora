import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Claim, ClaimRequest, ClaimStatus, AnalysisResultResponse } from '../models/claim.model';
import { EvidenceDocument, DocumentType } from '../models/evidence.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private readonly endpoint = '/claims';

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) {}

  getClaims(params: {
    search?: string;
    status?: ClaimStatus;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  } = {}): Observable<PaginatedResponse<Claim>> {
    return this.api.get<PaginatedResponse<Claim>>(this.endpoint, params as Record<string, string | number | boolean | undefined>);
  }

  getClaimById(id: number): Observable<Claim> {
    return this.api.get<Claim>(`${this.endpoint}/${id}`);
  }

  createClaim(request: ClaimRequest): Observable<Claim> {
    return this.api.post<Claim>(this.endpoint, request);
  }

  getClaimDocuments(id: number): Observable<EvidenceDocument[]> {
    return this.api.get<EvidenceDocument[]>(`${this.endpoint}/${id}/documents`);
  }

  uploadDocument(claimId: number, file: File, documentType: DocumentType): Observable<EvidenceDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post<EvidenceDocument>(`/api${this.endpoint}/${claimId}/documents`, formData);
  }

  analyzeClaim(claimId: number): Observable<AnalysisResultResponse> {
    return this.api.post<AnalysisResultResponse>(`${this.endpoint}/${claimId}/analyze`, {});
  }
}
