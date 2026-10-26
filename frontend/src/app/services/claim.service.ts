import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Claim, ClaimRequest, ClaimStatus, AnalysisResultResponse } from '../models/claim.model';
import { EvidenceDocument, DocumentType } from '../models/evidence.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private readonly endpoint = '/claims';
  private cachedDefaultClaims: PaginatedResponse<Claim> | null = null;
  private cacheTime = 0;

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
  } = {}, forceRefresh = false): Observable<PaginatedResponse<Claim>> {
    const isDefault = (!params.search || params.search.trim().length === 0) &&
                      !params.status &&
                      (!params.page || params.page === 0);

    const now = Date.now();
    if (!forceRefresh && isDefault && this.cachedDefaultClaims && (now - this.cacheTime) < 30000) {
      return of(this.cachedDefaultClaims);
    }

    return this.api.get<PaginatedResponse<Claim>>(this.endpoint, params as Record<string, string | number | boolean | undefined>).pipe(
      tap(res => {
        if (isDefault) {
          this.cachedDefaultClaims = res;
          this.cacheTime = Date.now();
        }
      })
    );
  }

  getClaimById(id: number): Observable<Claim> {
    return this.api.get<Claim>(`${this.endpoint}/${id}`);
  }

  createClaim(request: ClaimRequest): Observable<Claim> {
    this.cachedDefaultClaims = null;
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
