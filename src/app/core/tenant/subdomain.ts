const PRODUCTION_DOMAIN_SUFFIX = '.ersoftdev-hoa.co';
const DEFAULT_DEV_SLUG = 'default';

export function resolveAssociationSlug(): string {
  const { hostname, search } = window.location;
  if (hostname.endsWith(PRODUCTION_DOMAIN_SUFFIX)) {
    return hostname.slice(0, -PRODUCTION_DOMAIN_SUFFIX.length);
  }
  return new URLSearchParams(search).get('association') ?? DEFAULT_DEV_SLUG;
}
