import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { InvestigationAction, InvestigationActionRequest } from '../models/investigation.model';

@Injectable({
  providedIn: 'root'
})
export class InvestigationService {
  private readonly endpoint = '/investigations';

  constructor(private api: ApiService) {}

  getAllActions(): Observable<InvestigationAction[]> {
    return this.api.get<InvestigationAction[]>(this.endpoint);
  }

  getActionsForFinding(findingId: number): Observable<InvestigationAction[]> {
    return this.api.get<InvestigationAction[]>(`${this.endpoint}/finding/${findingId}`);
  }
}
