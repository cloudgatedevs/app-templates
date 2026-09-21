# Admin Back Office

A reusable Cloudgate back-office skeleton based on the Shop application's administration experience. React 18, Vite, Tailwind and the Cloudgate client SDK; a compact light theme by default, with saved dark/system mode and custom colours.

## Included sections

| Section | Capability | Data source |
| --- | --- | --- |
| User management | Search, create, edit, enable/disable, delete and request a password reset. Administrator accounts are read-only here. | Tenant IdP admin user APIs |
| Analytics | Website views, sessions, visitors, periods, pages, countries, sources and devices; visitor workflow calls. | Cloudgate Web App Insights |
| Theme styling | Colour presets, custom primary/secondary colours, light/dark/system mode and density. | Native Cloudgate appearance API |
| Appearance | Application name, tagline, description, logo, favicon, app URL, support email and footer. | Native Cloudgate appearance API |
| SMTP settings | Cloudgate delivery or tenant SMTP override, preserved encrypted password, removal confirmation and explicit test send. | Tenant IdP email settings APIs |
| Media server | Paginated image folders, multiple uploads, previews, public URLs and confirmed deletion. Branding images in use are protected. | Cloudgate IdP files APIs |
| Logs | App-scoped workflow calls, timing, outcomes, filters, payload details and node logs. | Tenant IdP workflow logs APIs |
| About us | App/version, configured identity/contact details, tenancy information and Cloudgate links. | Manifest, appearance settings and IdP profile |
| Payments | Wallet provider, onboarding, charges/payouts, environment and readiness; open Wallet to manage transactions and setup. | Native Cloudgate payments status API |

The existing Dashboard, Orders and sample database users remain examples for building domain features. `/users` now manages **real tenant IdP identities**. The original sample users are at `/sample-users`, linked from the Dashboard; they do not control sign-in. Orders remain sample business records, separate from Wallet transactions. Checkout, charging cards and refund processing are extension work, not part of this generic skeleton.

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
2. Import `.template/workflow-template.json`. The bundle contains only the three sample actions (`dashboard`, `users`, `orders`), all guarded by an **IdP Authorize / Admin** entry node. Its `admin_db` schema contains only sample domain data. Re-running `.template/schema.sql` preserves existing data and does not create or delete any legacy settings table.
3. Update and publish those three sample actions in the chosen environment. For an existing controller, update its actions rather than creating a second installation; retain its database binding. The packaged database uses the starter's existing sandbox binding; configure a separate production database and each Database node's production binding before production publishing. Payments and appearance need no workflow publication or database-node binding.
4. Use an active tenant IdP account with an administrator role. Grant initial administrator access in the Cloudgate hub, under App users.
5. For existing custom branding, export the old settings workflow's `values` (or the SQLite settings table from a backup). Read the native appearance `details` endpoint and send those twelve appearance/theme fields to `update` with the returned revision. This is a one-time transfer; the new frontend never reads the old workflow. Rebuild the frontend, check Appearance/Theme and Wallet readiness, then retire the obsolete settings workflow separately.
6. The updated frontend reads payment readiness through the native API. There is no payment data to migrate: the old workflow also read Cloudgate's existing Wallet. Retire any previously published `payments` action only after other clients have moved to the native endpoint. Updating the local bundle does not delete deployed workflows or Wallet data.

User management, appearance, payments, SMTP and files use native tenant APIs. Appearance, Payments and Logs resolve the installation's controller (with a non-private tenant-controller fallback for manually deployed skeletons). Analytics requires the corresponding published website scope and also resolves Cloudgate's `cg-analytics.json`. Unavailable host features display errors rather than fabricated data. No additional browser credentials are required.

User management and SMTP are **tenant-wide**. Appearance/theme settings are specific to the app's controller and environment, with separate sandbox and production values. Media uses `<controller-path>/media` and `<controller-path>/branding`, so copies of the skeleton do not mix their libraries. Media deletion checks current branding; manually embedded image URLs in future custom pages must also be considered before deleting files.

## Backend contract

All workflow calls use `POST {gateway}/{sbx|prod}/{projectPath}/{route}` with `{ "op": "..." }`. The SDK signs requests and attaches the IdP bearer token. The server's IdP authorization nodes enforce administrator access; the React guard is only the corresponding UI gate.

| Action | Operations |
| --- | --- |
| `dashboard` | `stats`, `recent` (sample application data) |
| `users` | `list`, `get`, `create`, `update`, `disable`, `enable`, `delete` (sample SQLite records) |
| `orders` | `list`, `get`, `create`, `update`, `status`, `delete` (sample SQLite records) |

Appearance uses `POST {idpApi}/api/idp/{tenant}/admin/appearance/{details|update|reset}` with the IdP bearer token. All requests carry `{ projectPath, environment }`; `details` returns `{ values, revision }`. `update` adds `{ values: { ...changedFields }, revision }`; `reset` adds `{ revision }` to restore defaults. Both writes return the complete values and a new revision. Only the twelve supported appearance/theme fields are accepted. A stale revision returns 409 and requires a reload. No workflow signing key is used for these requests.

Payments uses `POST {idpApi}/api/idp/{tenant}/admin/payments/status` with an active tenant IdP Admin bearer token and `{ projectPath, environment }`. It returns `{ ready, provider, status, chargesEnabled, payoutsEnabled, currency, country, production, reason }`, optionally wrapped in `result`. The application scope is checked before reading the Wallet; apps in the same tenant/environment share a Wallet, while sandbox and production are separate. Missing/incomplete Wallet setup returns HTTP 200 with `ready: false` and a setup reason. Invalid scope returns 400; missing/inaccessible applications or an undeployed native endpoint return 404; invalid/non-admin identities receive 401/403. The status API does not provision Wallets or move money. It requires no HMAC key, workflow or app database. Provider setup and transactions remain in the Cloudgate hub's Wallet page.

SMTP secrets are never stored in the app database. All three sample workflow actions enable logging. Keep the sample domain's validation/business rules under review when replacing demo records with real operations.

## Extending the skeleton

- `src/components/navConfig.jsx` and `src/App.jsx`: navigation and routes.
- `src/integrations/`: adapted shared Shop Analytics, Logs, SMTP and About components.
- `src/services/`: signed workflows and bearer-authenticated tenant APIs.
- `src/settings/`: saved settings, branding updates and contrast-aware theme application.
- `src/pages/`: back-office screens and example business pages.
- `.template/scripts/`: readable node scripts and shared Cloudgate helpers.
- `scripts/package-workflows.py`: refreshes script/schema contents in the checked-in export; it does not deploy or change node wiring.

After editing node scripts or schema, run `npm run cloudgate:package`. Structural graph changes should use Cloudgate's workflow tooling and be re-exported. Appearance and payment readiness are implemented by the backend, outside this workflow bundle.

## Checks

```sh
npm test                   # API refresh/errors, theme validation and Analytics clients
npm run test:workflows     # Python 3; sample SQLite data, guards and legacy preservation
npm run test:ui            # Playwright; real app with intercepted Cloudgate APIs
npm run build
```

Install a browser for UI checks once with `npx playwright install chromium` if needed. UI checks bind local port 3199 and supply fixture configuration; they never change tenant accounts, settings, media or send real email. Set `ADMIN_TEST_OUTPUT_DIR` to save screenshots. The browser checks cover account operations, confirmation/cancellation, branding persistence, themes, SMTP, media, Analytics/Logs/Payments/About, non-admin access and a 360px mobile viewport.
