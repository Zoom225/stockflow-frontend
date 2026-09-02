import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupplierRequest, SupplierResponse } from '../../shared/models/supplier.models';

@Injectable({ providedIn: 'root' })
export class SuppliersApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/api/suppliers`;

  getAll(): Observable<SupplierResponse[]> {
    return this.http.get<SupplierResponse[]>(this.endpoint);
  }

  getById(id: number): Observable<SupplierResponse> {
    return this.http.get<SupplierResponse>(`${this.endpoint}/${id}`);
  }

  create(request: SupplierRequest): Observable<SupplierResponse> {
    return this.http.post<SupplierResponse>(this.endpoint, request);
  }

  update(id: number, request: SupplierRequest): Observable<SupplierResponse> {
    return this.http.put<SupplierResponse>(`${this.endpoint}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
