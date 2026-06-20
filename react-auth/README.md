# Cloudgate React IdP Auth Portal

A standalone Vite + React auth portal that replaces Cloudgate's hosted `/idp/{tenant}/login` pages with your own branded UI. The portal calls the Cloudgate IdP API directly (Login, Register, password reset) and redirects external apps back with token query parameters.

Use the **`react/`** template if you need a consumer app that redirects to a hosted IdP login page. Use **`react-auth`** when you want to host the login UI yourself.

## How it works

```text
External app  →  GET {portal}/login?returnUrl=https://myapp.example/callback
Auth portal   →  POST /api/idp/{tenant}/Login
Cloudgate API →  { accessToken, refreshToken, expiresIn, returnUrl }
Auth portal   →  Redirect https://myapp.example/callback?access_token=...&refresh_token=...
```

When no `returnUrl` is provided, the portal shows a success screen with copyable tokens (useful for API testing).

## IdP Settings prerequisites

Configure these in Cloudgate under **Identity → Settings** (`/flows/identity/settings`):

| Setting | Purpose |
| --- | --- |
| `recaptchaSecret` | Required for Login, Register, and password reset API calls |
| `allowedRedirectUrls` | Whitelist of URLs the portal may redirect to after login (one per line or comma-separated) |
| Branding logo | Optional; loaded from `GET /api/idp/{tenant}/branding/logo` |

See the in-app API guide at `/idp/{tenant}/api` on your Cloudgate instance for full endpoint documentation.

## Integration

Point your apps to this portal instead of the hosted IdP login:

```text
https://auth.example.com/login?returnUrl=https://myapp.example/callback
```

After successful login, the portal redirects to the backend-approved `returnUrl` with:

```text
?access_token=...&refresh_token=...&expires_in=3600
```

Your app should read these query params on load, store the tokens, and strip them from the URL (see the `react/` template's `AuthProvider` for a reference implementation).

### Password reset links

Configure your IdP email templates or reset flow so reset links point to this portal:

```text
https://auth.example.com/reset-password?userId=...&resetCode=...&expireDate=...&tenantId=...
```

## Configuration

Copy `.env.example` to `.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_IDP_API_URL` | Yes | Cloudgate API base URL (e.g. `http://localhost:44301`) |
| `VITE_IDP_TENANCY_NAME` | Yes | Tenant slug (e.g. `apps`); override at runtime with `?idp_tenant=` |
| `VITE_IDP_APP_NAME` | No | Display name when no tenant logo is configured |
| `VITE_IDP_RECAPTCHA_SECRET` | Yes | Same value as **recaptchaSecret** in Cloudgate IdP Settings (`/flows/identity/settings`) |

Copy **recaptchaSecret** from IdP Settings into `VITE_IDP_RECAPTCHA_SECRET`. The portal sends it in API request bodies to satisfy the IdP reCAPTCHA requirement.

## Scripts

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run preview  # preview production build
```

## Routes

| Route | Description |
| --- | --- |
| `/login` | Sign in (`?returnUrl=` supported) |
| `/signup` | Create account |
| `/forgot-password` | Request password reset email |
| `/reset-password` | Complete reset from email link query params |
| `/success` | Token redirect or copy screen (internal) |

## Structure

```text
src/
  api/idpApi.js           # Login, Register, password reset API calls
  config/idpConfig.js     # Environment configuration
  components/             # AuthLayout, BrandedLogo, FormField, Alert
  pages/                  # Login, Register, ForgotPassword, ResetPassword, Success
  utils/
    recaptcha.js          # Tenant recaptchaSecret payload for API calls
    redirectWithTokens.js # returnUrl redirect with token query params
    errors.js             # API error parsing
    useReturnUrl.js       # Preserve returnUrl across navigation
```

## Contrast with `react/` template

| | `react-auth` (this template) | `react/` |
| --- | --- | --- |
| Role | Auth portal (login UI) | Consumer app |
| Login UI | Built-in pages | Redirects to hosted IdP |
| After login | Redirects external app with tokens | Receives tokens via URL params |
| Protected routes | None | Home + Profile pages |
