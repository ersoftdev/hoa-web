# Reports

Read-only reporting UI over `apps/hoa-api`'s `modules/reports` — an
"Available Reports" landing page (`GET /reports/types`, already
permission-filtered server-side) plus one page per report type, each with
its own filters and an Export ▾ (PDF/Excel/CSV) button.

**Implemented**: `report-list` (the landing page) and one page per report
— `homeowners-report`/`board-member-report` (Admin-only, gated per-route
via `CAN_MANAGE_HOMEOWNERS`, same pattern as `services.routes.ts`) and
`service-request-report`/`service-payment-report`/`user-activity-report`
(open to every role — the backend force-scopes a Homeowner/BoardMember
caller to their own records, so these pages never check role or send a
"mine" flag themselves).

Shared pieces added for this feature, reusable by anything else that
needs them later: `core/api/hoa-api.service.ts`'s `getBlob()`,
`shared/services/download-file.service.ts`, and
`shared/components/export-menu`.

Filters that would ideally be a homeowner-picker dropdown
(`homeownerName` on the Service Request/Payment/User Activity reports)
are plain free-text search instead — there's no such picker component in
the app yet (see `apps/hoa-api`'s `modules/reports/README.md` for the
backend side of this and other tradeoffs, e.g. the User Activity Report's
name-based "mine" scoping).
