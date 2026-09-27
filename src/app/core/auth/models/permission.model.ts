export type Role = 'Homeowner' | 'BoardMember' | 'Admin';

export type Permission =
  | 'CAN_MANAGE_HOMEOWNERS'
  | 'CAN_MANAGE_SERVICES'
  | 'CAN_REQUEST_SERVICES'
  | 'CAN_REVIEW_SERVICE_REQUESTS'
  | 'CAN_REVIEW_PAYMENTS'
  | 'CAN_MANAGE_EVENTS'
  | 'CAN_APPROVE_EVENTS'
  | 'CAN_MANAGE_ANNOUNCEMENTS'
  | 'CAN_VIEW_ACTIVITIES'
  | 'CAN_MANAGE_CONFIGURATION';

const BOARD_MEMBER_PERMISSIONS: Permission[] = [
  'CAN_MANAGE_SERVICES',
  'CAN_REQUEST_SERVICES',
  'CAN_MANAGE_EVENTS',
  'CAN_MANAGE_ANNOUNCEMENTS',
  'CAN_VIEW_ACTIVITIES',
];

const ADMIN_ONLY_PERMISSIONS: Permission[] = [
  'CAN_MANAGE_HOMEOWNERS',
  'CAN_REVIEW_SERVICE_REQUESTS',
  'CAN_REVIEW_PAYMENTS',
  'CAN_APPROVE_EVENTS',
  'CAN_MANAGE_CONFIGURATION',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Homeowner: ['CAN_REQUEST_SERVICES'],
  BoardMember: BOARD_MEMBER_PERMISSIONS,
  Admin: [...BOARD_MEMBER_PERMISSIONS, ...ADMIN_ONLY_PERMISSIONS],
};

export function permissionsForRoles(roles: readonly Role[]): Set<Permission> {
  const permissions = new Set<Permission>();
  for (const role of roles) {
    for (const permission of ROLE_PERMISSIONS[role] ?? []) {
      permissions.add(permission);
    }
  }
  return permissions;
}
