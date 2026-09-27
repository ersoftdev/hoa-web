import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { ApiError, isApiError, unknownApiError } from './api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const body: unknown = error.error;
        const apiError: ApiError = isApiError(body)
          ? { ...body, status: error.status }
          : unknownApiError(error.status);
        return throwError(() => apiError);
      }
      return throwError(() => error);
    }),
  );
