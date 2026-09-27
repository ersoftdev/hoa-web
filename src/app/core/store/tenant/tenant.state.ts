export type TenantInitStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface TenantState {
  associationId: string | null;
  associationName: string | null;
  associationSlug: string | null;
  status: TenantInitStatus;
  error: string | null;
}

export const initialTenantState: TenantState = {
  associationId: null,
  associationName: null,
  associationSlug: null,
  status: 'idle',
  error: null,
};
