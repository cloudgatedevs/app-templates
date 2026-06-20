# Cloudgate App Skeleton

A minimal React starter (Vite + React + Tailwind) wired to Cloudgate. Use it as the
base to build a new app on. It ships with the cross-cutting plumbing already in place:

- **Cloudgate IdP auth** — hosted login redirect, token storage, silent refresh, 401
  retry, and a profile load/update flow.
- **Theming** — glassmorphism look, animated background, Poppins type, shared UI
  primitives (`Card`, `Badge`, `StatCard`, `Spinner`, …).
- **Profile page** — view and update IdP profile details.
- **Workflow API client** — a signed Cloudgate gateway client; the React client talks
  ONLY to Cloudgate workflow endpoints.

## Architecture

The client never calls a backend or database directly. All data is fetched from
**Cloudgate workflow endpoints**, with requests HMAC-signed in the browser and the IdP
bearer token attached automatically.

```
Browser (React)  ──signed HTTP──>  Cloudgate /sbx/api/<project>/<route>
```

## Structure

```
src/
  auth/                 # Cloudgate IdP auth (login, refresh, profile, guards)
    AuthProvider.jsx    #   session bootstrap, refresh, 401 retry
    RequireAuth.jsx     #   route guard -> redirects to the IdP login
    idpAuthConfig.js    #   tenancy + login URL resolution
    idpProfileApi.js    #   profile GET/PUT + token refresh
    authHelpers.js      #   token storage + axios bearer injection
    jwtUtils.js         #   JWT validation/expiry helpers
  services/
    api.js              # signed Cloudgate workflow client (api.get/post/put/del)
    apiClient.js        # HMAC request signing (Web Crypto)
    config.js           # APP_NAME
  components/
    Layout.jsx          # header, nav, user menu, footer
    AnimatedBackground.jsx
    ui.jsx              # Card, Badge, StatCard, Spinner, DetailRow, icons
    ScreenLoader.jsx
  hooks/useAsync.js     # tiny async/loading hook
  pages/
    Home.jsx            # placeholder landing page (replace me)
    Profile.jsx         # IdP profile (auth-gated)
  App.jsx               # routes
  main.jsx              # entry
```

## Calling a workflow endpoint

```js
import { api } from '@/services/api';

const rows = await api.get('/my-project/items', { take: 20 });
const created = await api.post('/my-project/items', { name: 'Acme' });
```

## Configuration

Copy `.env.example` to `.env` and set:

| Variable                 | Description                                              |
| ------------------------ | ------------------------------------------------------- |
| `VITE_APP_NAME`          | Display name (header, footer, tab title)                |
| `VITE_IDP_BASE_URL`      | IdP host used to build the hosted login URL             |
| `VITE_IDP_API_URL`       | Optional separate base for profile/refresh calls        |
| `VITE_IDP_TENANCY_NAME`  | Tenancy (overridable via `?idp_tenant=` or subdomain)   |
| `VITE_IDP_RETURN_URL`    | Where the IdP redirects back after login                |
| `VITE_CLOUDGATE_API_URL` | Cloudgate gateway base for workflow endpoints           |
| `VITE_API_KEY` / `VITE_API_SECRET` | Gateway HMAC signing credentials              |

## Scripts

```bash
npm install
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # production build
npm run preview  # preview the production build
```
