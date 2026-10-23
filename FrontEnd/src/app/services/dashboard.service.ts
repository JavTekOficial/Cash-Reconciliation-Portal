import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardSummary, DepositFilter } from '../models/deposit.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  constructor(private readonly http: HttpClient) {}

  getSummary(filters?: DepositFilter): Observable<DashboardSummary> {
    let params = new HttpParams();

    if (filters) {
      if (filters.depositNumber?.trim()) {
        params = params.set('depositNumber', filters.depositNumber.trim());
      }
      if (filters.storeNumber?.trim()) {
        params = params.set('storeNumber', filters.storeNumber.trim());
      }
      if (filters.status?.trim()) {
        params = params.set('status', filters.status.trim());
      }
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate);
      }
    }

    return this.http.get<DashboardSummary>(this.baseUrl, { params });
  }
}
