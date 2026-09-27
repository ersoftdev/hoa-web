import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { PayableItem, Payment, PaymentStatus, SubmitPaymentPayload } from '../models/payment.model';

export interface PaymentListQuery {
  page: number;
  pageSize: number;
  status?: PaymentStatus | 'All';
  mine?: boolean;
  isDownpayment?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PaymentsApiService {
  private readonly hoaApi = inject(HoaApiService);

  list(query: PaymentListQuery): Observable<PagedResult<Payment>> {
    const params: Record<string, string | number | boolean> = {
      page: query.page,
      pageSize: query.pageSize,
    };
    if (query.status && query.status !== 'All') params['status'] = query.status;
    if (query.mine) params['mine'] = true;
    if (query.isDownpayment !== undefined) params['isDownpayment'] = query.isDownpayment;

    return this.hoaApi.get<PagedResult<Payment>>('/payments', params);
  }

  get(id: string): Observable<Payment> {
    return this.hoaApi.get<Payment>(`/payments/${id}`);
  }

  listPayableItems(): Observable<PayableItem[]> {
    return this.hoaApi.get<PayableItem[]>('/payments/payable-items');
  }

  submit(payload: SubmitPaymentPayload): Observable<Payment> {
    return this.hoaApi.post<Payment>('/payments', payload);
  }

  approve(id: string, adminNotes?: string): Observable<Payment> {
    return this.hoaApi.post<Payment>(`/payments/${id}/approve`, { adminNotes });
  }

  reject(id: string, adminNotes: string): Observable<Payment> {
    return this.hoaApi.post<Payment>(`/payments/${id}/reject`, { adminNotes });
  }
}
