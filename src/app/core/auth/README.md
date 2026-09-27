# Auth

`AuthService` is the only thing feature code should inject for session
state/actions — never `Store`, `TokenStorageService`, or `IdentityApiService`
directly for anything auth-related. Its public surface
(`currentUser()`/`isAuthenticated()`/`hasPermission()`/
`login()`/`logout()`/`refresh()`/`register()`/...) is unchanged by the NgRx
integration; it's now a thin facade over `core/store/auth/` — see that
directory's README and `docs/architecture/web.md` for the actual state,
actions, reducer, selectors, and effects.

`TokenStorageService` holds the access token in memory only, deliberately
outside the store (state must stay serializable/devtools-inspectable; a
bearer token has no business appearing in a Redux DevTools log) — see its own
doc comment.

`models/permission.model.ts` is the role→permission map every guard,
`hasPermission()` call, and the sidebar's visibility filter reads from.
