export type ContentStatus = 'Draft' | 'Published' | 'Cancelled' | 'Archived';

export type Visibility = 'PUBLIC' | 'HOMEOWNERS' | 'BOARD' | 'OFFICERS' | 'ADMIN';

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  PUBLIC: 'Public',
  HOMEOWNERS: 'Homeowners',
  BOARD: 'Board Members',
  OFFICERS: 'Officers',
  ADMIN: 'Admin',
};

export type ContentLifecycleAction = 'publish' | 'cancel' | 'archive';
