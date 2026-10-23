import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateDepositRequest, Deposit, DepositAuditLog, DepositFilter, ReconcileDepositRequest } from '../models/deposit.model';

@Injectable({
  providedIn: 'root'
})
export class DepositService {
  private readonly baseUrl = `${environment.apiUrl}/deposits`;

  constructor(private readonly http: HttpClient) {}

  getDeposits(filters?: DepositFilter): Observable<Deposit[]> {
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

    return this.http.get<Deposit[]>(this.baseUrl, { params });
  }

  getDepositById(id: number): Observable<Deposit> {
    return this.http.get<Deposit>(`${this.baseUrl}/${id}`);
  }

  getAuditLogs(depositId: number): Observable<DepositAuditLog[]> {
    return this.http.get<DepositAuditLog[]>(`${this.baseUrl}/${depositId}/audit-logs`);
  }

  exportDepositsToCsv(filters?: DepositFilter): Observable<Blob> {
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

    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  createDeposit(deposit: CreateDepositRequest): Observable<Deposit> {
    return this.http.post<Deposit>(this.baseUrl, deposit);
  }

  reconcileDeposit(id: number, request: ReconcileDepositRequest): Observable<Deposit> {
    return this.http.put<Deposit>(`${this.baseUrl}/${id}/reconcile`, request);
  }
}
