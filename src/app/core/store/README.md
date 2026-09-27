# Store

Global NgRx state — see `docs/architecture/web.md` for the full rationale
and what does/doesn't belong here. Three slices, each `{slice}/{slice}.state,
actions,reducer,selectors,effects}.ts`:

- `auth/` — session status, current user, roles, permissions. The only slice
  with effects today (`auth.effects.ts`) — real HTTP calls via
  `IdentityApiService`, the token/notifications side effects, then a
  Success/Failure action for the reducer.
- `tenant/` — current association id/name/slug + init status. Structure
  only; no effect resolves a real tenant yet (single-tenant today).
- `entitlements/` — enabled feature keys for the current association.
  Structure only; no subscription/DLC backend exists yet.

`app.state.ts` is the combined root shape, registered in `app.config.ts` via
`provideStore()`/`provideEffects(authEffects)`. `AuthService`
(`core/auth/auth.service.ts`) is the only thing outside this directory that
dispatches auth actions directly — it's the facade the rest of the app keeps
calling (`login()`/`logout()`/`refresh()`/`hasPermission()`, all unchanged
signatures), now backed by the store instead of a local signal.
