# React Starter

A minimal Vite + React + Tailwind app that supports the **IdP user login flow** only, with a
placeholder Home page and a Profile page after login. It is a stripped-down port of the IdP auth
pieces from `Cloudweb Apps` (no ABP/admin login, signup, 2FA, reset-password, Google, or reCAPTCHA).

Available in the Cloudgate hub under **Web Coder → Quick Start** as *React Starter*.

## Login flow

1. An unauthenticated visitor hitting any route is redirected by `RequireAuth` to the hosted IdP
   login page: `{VITE_IDP_BASE_URL}/idp/{tenancy}/login`.
2. After authenticating, the IdP redirects back to the app with
   `?access_token=...&refresh_token=...&expires_in=...`.
3. [`@cloudgatedevs/cloudgate-client`](https://github.com/cloudgatedevs/client) validates the
   token, stores it in `localStorage`, strips the params from the URL, and `AuthProvider` loads
   the profile from `/api/idp/{tenancy}/profile`.
4. The session is kept alive by a proactive refresh before expiry (the package's
   `auth.refresh()`, calling `/api/idp/{tenancy}/Refresh`). Sign-out clears storage and returns
   to the login page.

## Configuration

Creating this template from Quick Start writes a ready-to-run `.env` for your tenant (IdP URLs,
tenancy name, dev preview return URL, and a sandbox API key). Cloning the folder yourself? Copy
`.env.example` to `.env` and fill in:

| Variable                 | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `VITE_IDP_BASE_URL`      | Base URL of the IdP (used to build the hosted login URL).                   |
| `VITE_IDP_API_URL`       | Optional separate API base for profile/refresh. Falls back to base URL.     |
| `VITE_IDP_TENANCY_NAME`  | Tenancy name. Override at runtime with `?idp_tenant=`; otherwise this value wins, falling back to the subdomain when unset. |
| `VITE_IDP_RETURN_URL`    | Optional URL the IdP redirects back to after login. Defaults to this app's origin. |
| `VITE_CLOUDGATE_API_URL` | Gateway base URL for workflow endpoints you add. Unused by the starter itself. |
| `VITE_API_KEY` / `VITE_API_SECRET` | Gateway request-signing credentials for those endpoints.           |

## Scripts

```bash
npm install
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # production build
npm run preview  # preview the production build
```

## Structure

```
src/
  auth/
    idpProfileApi.js   # profile get/update (outside the package's scope)
    AuthProvider.jsx   # bootstrap, refresh, logout, profile state (package-backed)
    RequireAuth.jsx    # route guard -> redirects to IdP login
    useAuthContext.js
  services/
    auth.js            # createCloudgateAuth() — tokens, refresh, login redirects
  components/
    Layout.jsx         # header with user menu + sign out
    ScreenLoader.jsx
  pages/
    Home.jsx           # placeholder home
    Profile.jsx        # view/edit name, surname, email
  App.jsx              # router
  main.jsx             # entry
```
