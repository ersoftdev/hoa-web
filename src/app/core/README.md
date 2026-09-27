# Core

Singleton, app-wide concerns: `auth/` (token storage, auth state), `http/`
(interceptors), `guards/` (route guards), `layout/` (shell/nav). Imported
once by the root app config, never by feature modules directly.
