export type EntitlementsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface EntitlementsState {
  enabledFeatureKeys: string[];
  status: EntitlementsStatus;
  error: string | null;
}

export const initialEntitlementsState: EntitlementsState = {
  enabledFeatureKeys: [],
  status: 'idle',
  error: null,
};
