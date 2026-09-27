export type ActivityCategory = 'Homeowners' | 'Services' | 'Payments' | 'Events' | 'Announcements' | 'Configuration' | 'Account';

export const ACTIVITY_CATEGORY_ICONS: Record<ActivityCategory, string> = {
  Homeowners: 'people',
  Services: 'tools',
  Payments: 'wallet2',
  Events: 'calendar-event',
  Announcements: 'megaphone',
  Configuration: 'gear',
  Account: 'person-circle',
};

export interface ActivityLogEntry {
  id: string;
  occurredAt: string;
  actorName: string;
  category: ActivityCategory;
  description: string;
}
