import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { EvidenceDocument, UpdateExtractedDataRequest } from '../models/evidence.model';

@Injectable({
  providedIn: 'root'
})
export class EvidenceService {
  private readonly endpoint = '/documents';
  private cachedDocuments: EvidenceDocument[] | null = null;
  private cacheTime = 0;

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) {}

  getDocuments(claimId?: number, forceRefresh = false): Observable<EvidenceDocument[]> {
    const now = Date.now();
    if (!claimId && !forceRefresh && this.cachedDocuments && (now - this.cacheTime) < 30000) {
      return of(this.cachedDocuments);
    }
    const params = claimId ? { claimId } : undefined;
    return this.api.get<EvidenceDocument[]>(this.endpoint, params as Record<string, string | number | boolean | undefined>).pipe(
      tap(docs => {
        if (!claimId) {
          this.cachedDocuments = docs;
          this.cacheTime = Date.now();
        }
      })
    );
  }

  getDocumentById(id: number): Observable<EvidenceDocument> {
    return this.api.get<EvidenceDocument>(`${this.endpoint}/${id}`);
  }

  downloadDocumentFile(id: number): Observable<Blob> {
    return this.http.get(`/api${this.endpoint}/${id}/file`, { responseType: 'blob' });
  }

  updateExtractedData(id: number, request: UpdateExtractedDataRequest): Observable<EvidenceDocument> {
    this.cachedDocuments = null;
    return this.api.put<EvidenceDocument>(`${this.endpoint}/${id}/extracted-data`, request);
  }

  clearCache(): void {
    this.cachedDocuments = null;
  }
}
