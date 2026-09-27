import { Permission } from '../auth/models/permission.model';

export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  permission?: Permission;
  badge?: string;
  children?: NavItem[];
  activePrefixes?: readonly string[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', icon: 'speedometer2', route: 'dashboard' },
  { label: 'Events', icon: 'calendar-event', route: 'events' },
  { label: 'Announcements', icon: 'megaphone', route: 'announcements' },
  { label: 'Calendar', icon: 'calendar3', route: 'calendar' },
  {
    label: 'Homeowners',
    icon: 'people',
    permission: 'CAN_MANAGE_HOMEOWNERS',
    children: [
      { label: 'All Homeowners', icon: 'list-ul', route: 'homeowners' },
      { label: 'Board Members', icon: 'person-badge', route: 'homeowners/board-members' },
      { label: 'Officers', icon: 'person-vcard', route: 'homeowners/officers' },
      { label: 'Officer Positions', icon: 'bookmark', route: 'homeowners/officer-positions' },
    ],
  },
  {
    label: 'Community Services',
    icon: 'tools',
    children: [
      { label: 'Services', icon: 'list-ul', route: 'services', permission: 'CAN_MANAGE_SERVICES' },
      { label: 'Service Request', icon: 'inbox', route: 'services/requests', permission: 'CAN_REVIEW_SERVICE_REQUESTS' },
      {
        label: 'My Requests',
        icon: 'clock-history',
        route: 'services/my-requests',
        activePrefixes: ['services/request/new'],
      },
    ],
  },
  {
    label: 'Payment',
    icon: 'wallet2',
    children: [
      {
        label: 'My Payments',
        icon: 'wallet2',
        route: 'payments/my',
        activePrefixes: ['payments/new', 'payments/submit'],
      },
      { label: 'Payment Review', icon: 'credit-card-2-front', route: 'payments', permission: 'CAN_REVIEW_PAYMENTS' },
      { label: 'Rejected Payments', icon: 'x-circle', route: 'payments/rejected' },
    ],
  },
  {
    label: 'Reports',
    icon: 'bar-chart',
    children: [
      { label: 'Available Reports', icon: 'list-ul', route: 'reports' },
      { label: 'Homeowners', icon: 'people', route: 'reports/homeowners', permission: 'CAN_MANAGE_HOMEOWNERS' },
      { label: 'Board Member', icon: 'person-badge', route: 'reports/board-members', permission: 'CAN_MANAGE_HOMEOWNERS' },
      { label: 'Service Request', icon: 'inbox', route: 'reports/service-requests' },
      { label: 'Service Payment', icon: 'wallet2', route: 'reports/service-payments' },
      { label: 'User Activity', icon: 'clock-history', route: 'reports/user-activities' },
    ],
  },
  { label: 'System Activities', icon: 'clock-history', permission: 'CAN_VIEW_ACTIVITIES', route: 'activities' },
  { label: 'Configuration', icon: 'gear', permission: 'CAN_MANAGE_CONFIGURATION', route: 'configuration' },
];
