import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HOA_API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class HoaApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(HOA_API_BASE_URL) private readonly baseUrl: string,
  ) {}

  get<T>(path: string, params?: HttpParams | Record<string, string | number | boolean>): Observable<T> {
    return this.http.get<T>(this.url(path), { params });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.url(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path));
  }

  getBlob(
    path: string,
    params?: HttpParams | Record<string, string | number | boolean>,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(this.url(path), { params, responseType: 'blob', observe: 'response' });
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
