import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OutboundStockRequest,
  RestockProductRequest,
  StockMovementRequest,
  StockMovementResponse,
} from '../../shared/models/stock-movement.models';

@Injectable({ providedIn: 'root' })
export class StockMovementsApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/api/stock-movements`;

  getAll(): Observable<StockMovementResponse[]> {
    return this.http.get<StockMovementResponse[]>(this.endpoint);
  }

  getById(id: number): Observable<StockMovementResponse> {
    return this.http.get<StockMovementResponse>(`${this.endpoint}/${id}`);
  }

  getByProductId(productId: number): Observable<StockMovementResponse[]> {
    return this.http.get<StockMovementResponse[]>(`${this.endpoint}/products/${productId}`);
  }

  create(request: StockMovementRequest): Observable<StockMovementResponse> {
    return this.http.post<StockMovementResponse>(this.endpoint, request);
  }

  restock(productId: number, request: RestockProductRequest): Observable<StockMovementResponse> {
    return this.http.post<StockMovementResponse>(
      `${this.endpoint}/products/${productId}/restock`,
      request,
    );
  }

  outbound(productId: number, request: OutboundStockRequest): Observable<StockMovementResponse> {
    return this.http.post<StockMovementResponse>(
      `${this.endpoint}/products/${productId}/outbound`,
      request,
    );
  }

  update(id: number, request: StockMovementRequest): Observable<StockMovementResponse> {
    return this.http.put<StockMovementResponse>(`${this.endpoint}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
