# Admin Back Office

A polished React back office for Cloudgate with native user management, analytics, branding and themes, SMTP, media, logs, About and Wallet readiness. Responsive layouts, soft surfaces and smooth transitions support light, dark and system modes. Dashboard and Orders are clean placeholders for your own application features. Built with React 18, Vite, Tailwind and the Cloudgate client SDK.

## Included sections

| Section | Capability | Data source |
| --- | --- | --- |
| Dashboard | Placeholder for application-specific metrics and activity. | None |
| Orders | Placeholder for application-specific order management. | None |
| User management | Search, create, edit, enable/disable, delete and request a password reset. Administrator accounts are read-only here. | Tenant IdP admin user APIs |
| Analytics | Website views, sessions, visitors, periods, pages, countries, sources and devices; visitor workflow calls. | Cloudgate Web App Insights |
| Theme styling | Colour presets, custom primary/secondary colours, light/dark/system mode and density. | Native Cloudgate appearance API |
| Appearance | Application name, tagline, description, logo, favicon, app URL, support email and footer. | Native Cloudgate appearance API |
| SMTP settings | Cloudgate delivery or tenant SMTP override, preserved encrypted password, removal confirmation and explicit test send. | Tenant IdP email settings APIs |
| Media server | Paginated image folders, multiple uploads, previews, public URLs and confirmed deletion. Branding images in use are protected. | Cloudgate IdP files APIs |
| Logs | App-scoped workflow calls, timing, outcomes, filters, payload details and node logs. | Tenant IdP workflow logs APIs |
| About us | App/version, configured identity/contact details, tenancy information and Cloudgate links. | Manifest, appearance settings and IdP profile |
| Payments | Wallet provider, onboarding, charges/payouts, environment and readiness; open Wallet to manage transactions and setup. | Native Cloudgate payments status API |

Dashboard and Orders are clearly labelled placeholders. They make no domain API calls and display no fabricated metrics, users or orders. `/users` manages **real tenant IdP identities**; the old `/sample-users` URL redirects there. Checkout, charging cards and refund processing are extension work, not part of this generic skeleton.

## Run

```sh
npm install
npm run dev
npm run build
npm run preview
```

Copy `.env.example` to `.env` for a manual installation and fill in your tenant values. The App Store / Quick Start supplies the environment automatically. Keep `VITE_CLOUDGATE_API_PROJECT` aligned with the actual imported controller path (normally `admin`). Vite embeds environment values at build time; restart/rebuild after changes. Never use browser-embedded signing credentials as the administrator authorization boundary.

The single app entry is `/`; all routes use the same `index.html`. Static hosting must fall back to `index.html` for routes such as `/users`, `/analytics` and `/appearance`.

## Cloudgate setup and upgrading an existing installation

1. Deploy/restart Cloudgate with its native appearance and payments status APIs. Apply the appearance API's `20260921050037_web_app_appearance_settings` **WebDbContext** migration if not already installed. Payments reuses the existing platform Wallet service and needs no additional migration on a Wallet-enabled host.
2. Use an existing non-private tenant controller or import `.template/workflow-template.json` to create the empty `admin` controller. It provides application scope for the native APIs; there are no bundled workflow actions, database connections, schema or seeded records. The App Store imports it automatically. For manual installations and Quick Start, import it through Cloudgate's template import if the controller does not already exist. Quick Start's action selection does not import empty controllers.
3. Set `VITE_CLOUDGATE_API_PROJECT` to that controller's actual path and select `sbx` or `prod` with `VITE_CLOUDGATE_API_ENV`. No workflow publication or app database is required. Existing installations should retain their controller path so their appearance settings and app scope continue to resolve.
4. Use an active tenant IdP account with an administrator role. Grant initial administrator access in the Cloudgate hub, under App users.
5. For existing custom branding, export the old settings workflow's `values` (or the SQLite settings table from a backup). Read the native appearance `details` endpoint and send those twelve appearance/theme fields to `update` with the returned revision. This is a one-time transfer; the new frontend never reads the old workflow. Rebuild the frontend, check Appearance/Theme and Wallet readiness, then retire the obsolete settings workflow separately.
6. The updated frontend reads payment readiness through the native API. There is no payment data to migrate: the old workflow also read Cloudgate's existing Wallet. Retire any previously published `payments` action only after other clients have moved to the native endpoint. Updating the local bundle does not delete deployed workflows or Wallet data.

The old sample `dashboard`, `users` and `orders` actions are no longer called. This template update does not delete existing remote workflows, databases or records; review other consumers before retiring those resources separately.

User management, appearance, payments, SMTP and files use native tenant APIs. Appearance, Payments and Logs resolve the installation's controller (with a non-private tenant-controller fallback for manually deployed skeletons). Analytics requires the corresponding published website scope and also resolves Cloudgate's `cg-analytics.json`. Unavailable host features display errors rather than fabricated data. No additional browser credentials are required.

User management and SMTP are **tenant-wide**. Appearance/theme settings are specific to the app's controller and environment, with separate sandbox and production values. Media uses `<controller-path>/media` and `<controller-path>/branding`, so copies of the skeleton do not mix their libraries. Media deletion checks current branding; manually embedded image URLs in future custom pages must also be considered before deleting files.

## Backend contract

Back-office features use native Cloudgate APIs with IdP bearer authentication and server-side administrator authorization. The React guard provides the corresponding UI gate. Dashboard and Orders have no backend contract until you implement those domain features.

Appearance uses `POST {idpApi}/api/idp/{tenant}/admin/appearance/{details|update|reset}` with the IdP bearer token. All requests carry `{ projectPath, environment }`; `details` returns `{ values, revision }`. `update` adds `{ values: { ...changedFields }, revision }`; `reset` adds `{ revision }` to restore defaults. Both writes return the complete values and a new revision. Only the twelve supported appearance/theme fields are accepted. A stale revision returns 409 and requires a reload. No workflow signing key is used for these requests.

Payments uses `POST {idpApi}/api/idp/{tenant}/admin/payments/status` with an active tenant IdP Admin bearer token and `{ projectPath, environment }`. It returns `{ ready, provider, status, chargesEnabled, payoutsEnabled, currency, country, production, reason }`, optionally wrapped in `result`. The application scope is checked before reading the Wallet; apps in the same tenant/environment share a Wallet, while sandbox and production are separate. Missing/incomplete Wallet setup returns HTTP 200 with `ready: false` and a setup reason. Invalid scope returns 400; missing/inaccessible applications or an undeployed native endpoint return 404; invalid/non-admin identities receive 401/403. The status API does not provision Wallets or move money. It requires no HMAC key, workflow or app database. Provider setup and transactions remain in the Cloudgate hub's Wallet page.

SMTP secrets are managed by the native tenant email settings API. The skeleton does not provision an app database.

## Extending the skeleton

- `src/components/navConfig.jsx` and `src/App.jsx`: navigation and routes.
- `src/integrations/`: adapted shared Shop Analytics, Logs, SMTP and About components.
- `src/services/`: signed workflows and bearer-authenticated tenant APIs.
- `src/settings/`: saved settings, branding updates and contrast-aware theme application.
- `src/pages/`: back-office screens and Dashboard/Orders placeholders.
- `src/components/PlaceholderPage.jsx`: shared placeholder presentation.
- `.template/workflow-template.json`: empty controller definition for native API scope.

Replace the placeholders with your application's metrics and order management when their domain APIs are ready. If you add workflow APIs, `src/services/api.js` provides the optional signed workflow client; enforce administrator authorization in the backend and export the new actions into the bundle. Appearance and payment readiness are implemented by the native backend.

## Checks

```sh
npm test                   # API refresh/errors, theme validation and Analytics clients
npm run test:ui            # Playwright; real app with intercepted Cloudgate APIs
npm run build
```

Install a browser for UI checks once with `npx playwright install chromium` if needed. UI checks bind local port 3199 and supply fixture configuration; they never change tenant accounts, settings, media or send real email. Set `ADMIN_TEST_OUTPUT_DIR` to save screenshots. The browser checks cover placeholders without sample API calls, account operations, confirmation/cancellation, branding persistence, themes, SMTP, media, Analytics/Logs/Payments/About, non-admin access and a 360px mobile viewport.
