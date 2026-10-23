import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardStatsResponse, ReportSummaryResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService) {}

  getStats(): Observable<DashboardStatsResponse> {
    return this.api.get<DashboardStatsResponse>('/dashboard/stats');
  }

  getSummaryReport(): Observable<ReportSummaryResponse> {
    return this.api.get<ReportSummaryResponse>('/reports/summary');
  }
}
