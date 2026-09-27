/** Standard server-side pagination envelope — every list endpoint across
 * hoa-api is expected to return this shape (§24: paginate/filter
 * server-side, don't load large datasets into the browser). */
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
