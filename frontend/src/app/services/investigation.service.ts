import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { InvestigationAction, InvestigationActionRequest } from '../models/investigation.model';

@Injectable({
  providedIn: 'root'
})
export class InvestigationService {
  private readonly endpoint = '/investigations';
  private cachedActions: InvestigationAction[] | null = null;
  private cacheTime = 0;

  constructor(private api: ApiService) {}

  getAllActions(forceRefresh = false): Observable<InvestigationAction[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedActions && (now - this.cacheTime) < 30000) {
      return of(this.cachedActions);
    }
    return this.api.get<InvestigationAction[]>(this.endpoint).pipe(
      tap(actions => {
        this.cachedActions = actions;
        this.cacheTime = Date.now();
      })
    );
  }

  getActionsForFinding(findingId: number): Observable<InvestigationAction[]> {
    return this.api.get<InvestigationAction[]>(`${this.endpoint}/finding/${findingId}`);
  }

  clearCache(): void {
    this.cachedActions = null;
  }
}
