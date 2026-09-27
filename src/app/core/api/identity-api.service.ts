import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IDENTITY_API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class IdentityApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(IDENTITY_API_BASE_URL) private readonly baseUrl: string,
  ) {}

  get<T>(path: string, params?: HttpParams | Record<string, string | number | boolean>): Observable<T> {
    return this.http.get<T>(this.url(path), { params, withCredentials: true });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body, { withCredentials: true });
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.url(path), body, { withCredentials: true });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path), { withCredentials: true });
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
