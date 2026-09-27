export const SERVICE_ICONS = [
  'car-front-fill', // parking
  'building', // clubhouse / facility
  'house-door-fill', // venue / hall
  'tools', // maintenance
  'cash-coin', // dues / fees
  'truck', // moving / delivery
  'water', // pool
  'trophy', // sports court
  'book', // library / study room
  'camera-video-fill', // event hall / AV
  'shield-check', // gate pass / security
  'file-earmark-text', // document request
  'calendar-check', // generic fallback
] as const;

export type ServiceIcon = (typeof SERVICE_ICONS)[number];
