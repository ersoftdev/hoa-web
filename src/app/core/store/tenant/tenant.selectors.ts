import { tenantFeature } from './tenant.reducer';

export const {
  selectTenantState,
  selectAssociationId,
  selectAssociationName,
  selectAssociationSlug,
  selectStatus: selectTenantStatus,
  selectError: selectTenantError,
} = tenantFeature;
