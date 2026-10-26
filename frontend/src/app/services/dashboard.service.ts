import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DashboardStatsResponse, ReportSummaryResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private cachedStats: DashboardStatsResponse | null = null;
  private cachedStatsTime = 0;
  private cachedReport: ReportSummaryResponse | null = null;
  private cachedReportTime = 0;

  constructor(private api: ApiService) {}

  getStats(forceRefresh = false): Observable<DashboardStatsResponse> {
    const now = Date.now();
    if (!forceRefresh && this.cachedStats && (now - this.cachedStatsTime) < 30000) {
      return of(this.cachedStats);
    }
    return this.api.get<DashboardStatsResponse>('/dashboard/stats').pipe(
      tap(data => {
        this.cachedStats = data;
        this.cachedStatsTime = Date.now();
      })
    );
  }

  getSummaryReport(forceRefresh = false): Observable<ReportSummaryResponse> {
    const now = Date.now();
    if (!forceRefresh && this.cachedReport && (now - this.cachedReportTime) < 30000) {
      return of(this.cachedReport);
    }
    return this.api.get<ReportSummaryResponse>('/reports/summary').pipe(
      tap(data => {
        this.cachedReport = data;
        this.cachedReportTime = Date.now();
      })
    );
  }

  clearCache(): void {
    this.cachedStats = null;
    this.cachedReport = null;
  }
}
