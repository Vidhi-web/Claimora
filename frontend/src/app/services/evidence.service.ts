import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EvidenceDocument, UpdateExtractedDataRequest } from '../models/evidence.model';

@Injectable({
  providedIn: 'root'
})
export class EvidenceService {
  private readonly endpoint = '/documents';

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) {}

  getDocuments(claimId?: number): Observable<EvidenceDocument[]> {
    const params = claimId ? { claimId } : undefined;
    return this.api.get<EvidenceDocument[]>(this.endpoint, params as Record<string, string | number | boolean | undefined>);
  }

  getDocumentById(id: number): Observable<EvidenceDocument> {
    return this.api.get<EvidenceDocument>(`${this.endpoint}/${id}`);
  }

  downloadDocumentFile(id: number): Observable<Blob> {
    return this.http.get(`/api${this.endpoint}/${id}/file`, { responseType: 'blob' });
  }

  updateExtractedData(id: number, request: UpdateExtractedDataRequest): Observable<EvidenceDocument> {
    return this.api.put<EvidenceDocument>(`${this.endpoint}/${id}/extracted-data`, request);
  }
}
