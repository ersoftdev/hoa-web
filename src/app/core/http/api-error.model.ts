export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  traceId?: string;
  status?: number;
}

export function unknownApiError(status?: number): ApiError {
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong. Please try again.',
    status,
  };
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiError).code === 'string' &&
    typeof (value as ApiError).message === 'string'
  );
}
