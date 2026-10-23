import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Claim, CreateClaimRequest } from '../models/claim.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private readonly endpoint = '/claims';

  constructor(private api: ApiService) {}

  getClaims(status?: string): Observable<Claim[]> {
    const params = status ? { status } : {};
    return this.api.get<Claim[]>(this.endpoint, params);
  }

  getClaimById(id: number): Observable<Claim> {
    return this.api.get<Claim>(`${this.endpoint}/${id}`);
  }

  createClaim(request: CreateClaimRequest): Observable<Claim> {
    return this.api.post<Claim>(this.endpoint, request);
  }
}
