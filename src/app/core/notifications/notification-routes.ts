const ENTITY_ROUTES: Record<string, (id: string) => string[]> = {
  ServiceRequest: (id) => ['/app/services/requests', id],
  Payment: (id) => ['/app/payments', id],
  Service: (id) => ['/app/services', id],
  Event: (id) => ['/app/events', id],
  Announcement: (id) => ['/app/announcements', id],
  Configuration: () => ['/app/configuration'],
};

export function notificationRoute(entityType: string, entityId: string | null): string[] | null {
  const build = ENTITY_ROUTES[entityType];
  if (!build) return null;
  return build(entityId ?? '');
}
