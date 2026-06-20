# Cloudgate React

A minimal Vite + React + Tailwind app that supports the **IdP user login flow** only, with a
placeholder Home page and a Profile page after login. It is a stripped-down port of the IdP auth
pieces from `Cloudweb Apps` (no ABP/admin login, signup, 2FA, reset-password, Google, or reCAPTCHA).

## Login flow

1. An unauthenticated visitor hitting any route is redirected by `RequireAuth` to the hosted IdP
   login page: `{VITE_IDP_BASE_URL}/idp/{tenancy}/login`.
2. After authenticating, the IdP redirects back to the app with
   `?access_token=...&refresh_token=...&expires_in=...`.
3. `AuthProvider` validates the token, stores it in `localStorage`, sets the axios `Authorization`
   header, strips the params from the URL, and loads the profile from
   `/api/idp/{tenancy}/profile`.
4. The session is kept alive by a proactive refresh before expiry and a 401 interceptor, both
   calling `/api/idp/{tenancy}/Refresh`. Sign-out clears storage and returns to the login page.

## Configuration

Copy `.env.example` to `.env` and fill in:

| Variable                 | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `VITE_IDP_BASE_URL`      | Base URL of the IdP (used to build the hosted login URL).                   |
| `VITE_IDP_API_URL`       | Optional separate API base for profile/refresh. Falls back to base URL.     |
| `VITE_IDP_TENANCY_NAME`  | Tenancy name. Override at runtime with `?idp_tenant=`; otherwise this value wins, falling back to the subdomain when unset. |

## Scripts

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build
npm run preview  # preview the production build
```

## Structure

```
src/
  auth/
    idpAuthConfig.js   # env + tenancy resolution, login URL
    idpProfileApi.js   # profile get/update + token refresh
    jwtUtils.js        # token validation / decode helpers
    authHelpers.js     # token storage keys + axios request interceptor
    AuthProvider.jsx   # bootstrap, refresh, logout, profile state
    RequireAuth.jsx    # route guard -> redirects to IdP login
    useAuthContext.js
  components/
    Layout.jsx         # header with user menu + sign out
    ScreenLoader.jsx
  pages/
    Home.jsx           # placeholder home
    Profile.jsx        # view/edit name, surname, email
  App.jsx              # router
  main.jsx             # entry, axios setup
```
