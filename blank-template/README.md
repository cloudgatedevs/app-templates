# Blank Template

A polished React back office for Cloudgate with native user management, analytics, branding and themes, SMTP, media, logs, About and Wallet readiness. Responsive layouts, soft surfaces and smooth transitions support light, dark and system modes. Dashboard and Orders are clean placeholders for your own application features. Built with React 18, Vite, Tailwind and the Cloudgate client SDK.

[View the live app](https://admin.app.cloudgate.dev/)

## Included sections

| Section | Capability | Data source |
| --- | --- | --- |
| Dashboard | Placeholder for application-specific metrics and activity. | None |
| Orders | Placeholder for application-specific order management. | None |
| Notifications | Bell popup with the five latest updates and a full-inbox link, live unread badge, read receipts, all/unread filters and optional link actions. | Tenant IdP notifications API and native WebSocket |
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

This folder is the deployable Blank Template application. The startup wizard lives in the separate Cloudgate Launcher repository; this app never starts onboarding or writes environment files.

Quick Start and App Store installations supply connection settings before the build. For local development, copy `.env.example` to `.env`, replace its placeholders, and set `VITE_CLOUDGATE_WEB_APP_ID` to a web app in your tenant. Choose `VITE_CLOUDGATE_API_ENV` and leave `VITE_CLOUDGATE_API_PROJECT` empty unless you add workflows. Restart/rebuild after changing environment values.

Normal sign-in uses an active tenant **IdpUser** with the **Admin** role. The admin template does not use a Cloudgate hub account. If IdP settings are missing, it displays its existing **Sign-in not configured** state rather than opening the wizard. The published return URL must be allowed in the tenant's IdP settings.

Built-in back-office features use IdP bearer tokens. Any `CLOUDGATE_API_KEY` / `CLOUDGATE_API_SECRET` values are for server-side integrations only and must never be prefixed with `VITE_` or compiled into the browser bundle.

The single app entry is `/`; all routes use the same `index.html`. Static hosting must fall back to `index.html` for routes such as `/users`, `/analytics` and `/appearance`.

## Cloudgate setup and upgrading an existing installation

1. Deploy/restart Cloudgate and apply the **WebDbContext** migrations, including `20260923023151_web_app_native_appearance_scope`. It adds web-app-scoped appearance storage while keeping legacy settings. Payments uses the existing tenant Wallet and needs no additional Wallet migration.
2. Publish this app from Quick Start / the code editor or the App Store. There is no bundled controller, workflow or app database. Cloudgate publishes `cg-analytics.json` with the web app ID and environment; the skeleton reads those public selectors and authenticates API calls with the tenant IdP Admin session.
3. For local development or hosting outside Cloudgate, open **Web Apps → Apps** in Cloudgate, click the app’s **Edit** pencil button, and select the **General** tab. Click the copy icon beside **Web app ID**, paste it into `VITE_CLOUDGATE_WEB_APP_ID`, and set `VITE_CLOUDGATE_API_ENV` to `sbx` or `prod`. You can also copy the ID beside the app’s path in the Apps list. Restart/rebuild after changing build variables. Publishing metadata takes precedence over these defaults.
4. Sign in with an active tenant IdP account with an administrator role. Grant initial administrator access in the Cloudgate hub under App users.
5. Rebuild and republish older skeletons to use the new API selectors. You do not need to create an empty `admin` controller to fix **No application uses that controller path in this environment**. Backend deployment alone does not change an older frontend's appearance requests. If you never added workflows, clear the old `VITE_CLOUDGATE_API_PROJECT=admin` setting; retain an existing media library by setting `VITE_CLOUDGATE_MEDIA_FOLDER=admin` first.
6. Existing App Store installs preserve controller-scoped native branding through their saved installation mapping and copy it into web-app storage on the first save. Legacy clients remain supported. For a manually deployed app without an installation mapping, read its old settings using the legacy `projectPath` selector and explicitly save those values using the desired `webAppId` and its current revision. No settings or remote controllers are deleted automatically.
7. Branding from an old custom workflow or SQLite table still needs a one-time transfer through the native appearance API. Only retire old workflows after checking their other consumers.

User management and SMTP are **tenant-wide**. Appearance belongs to the **web app and environment**. Payments belongs to the **tenant and environment**. Analytics uses the published web app ID. Only workflow logs require an optional controller; without one, the Logs page explains that no workflows are configured.

Media uses `apps/<webAppId>/media` and `apps/<webAppId>/branding`. Set `VITE_CLOUDGATE_MEDIA_FOLDER` to an existing prefix (for example `admin`) to retain an older library. An existing `VITE_CLOUDGATE_API_PROJECT` is also accepted as a legacy media prefix. These are file folders, not controller requirements. Media deletion checks saved branding before removing an image.

## Backend contract

Notifications use the signed-in **IdP user** within the tenant and environment. Apply the `AddIdpNotifications` and `AddIdpNotificationStyle` **ZeroDbContext** migrations and restart the backend before publishing this version. The inbox is shared by apps in the same tenant/environment. `POST /api/idp/{tenant}/notifications/{list|unread-count|read|read-all}` uses the IdP bearer token and `{ environment }`; list also accepts skip/take/unreadOnly, and read requires the notification GUID. IdP Admins can send through `/admin/notifications/send` and inspect `/history` and `/recipients`. Workflows can send using the **IdP Notification** node. Broadcasts snapshot all current non-deleted IdP users; offline recipients retain unread messages.

The browser connects using native WebSocket at `/ws-idp-notifications?environment=sbx&access_token=…`. Each ready/change event refreshes the authenticated inbox; reconnect, focus and periodic refresh recover missed events. For a backend running multiple instances, all instances must use the same existing `Abp:RedisCache:ConnectionString`. Delivery uses the `websocket:idp-notifications` Redis channel; no SignalR client or hub is used. Without Redis only local-instance sockets receive live events. The proxy must forward WebSocket upgrades, and its logs must redact `access_token`. Redis Pub/Sub channels are shared across database indexes, so separate deployments should use separate Redis endpoints.

Notification title/body are plain text. Optional `style` accepts `info` (default), `success`, `warning` or `danger`; the bell popup and inbox show a matching color, icon and label. Existing notifications default to info. Choose the alert style in the hub's create modal or the workflow node (`Param7`); inbox and history responses include it. Actions accept a local `/path` or absolute HTTP(S) URL, and clicking an action marks the message read before navigation. Read state is stored per recipient and synchronized across sessions. The hub's **Web Apps → App Notifications** page shows sent messages and recipient read timestamps. See the tenant's `/idp/{tenant}/api` documentation for request/response examples, WebSocket integration and workflow configuration.

Back-office features use native Cloudgate APIs with IdP bearer authentication and server-side administrator authorization. The React guard provides the corresponding UI gate. Dashboard and Orders have no backend contract until you implement those domain features.

Appearance uses `POST {idpApi}/api/idp/{tenant}/admin/appearance/{details|update|reset}` with the IdP bearer token. All requests carry `{ webAppId, environment }`; `details` returns `{ values, revision }`. `update` adds `{ values: { ...changedFields }, revision }`; `reset` adds `{ revision }` to restore defaults. Both writes return the complete values and a new revision. Only the twelve supported appearance/theme fields are accepted. A stale revision returns 409 and requires a reload. No workflow signing key is used for these requests.

Payments uses `POST {idpApi}/api/idp/{tenant}/admin/payments/status` with an active tenant IdP Admin bearer token and `{ environment }`. It returns `{ ready, provider, status, chargesEnabled, payoutsEnabled, currency, country, production, reason }`, optionally wrapped in `result`. The authenticated tenant is checked before reading the Wallet; apps in the same tenant/environment share a Wallet, while sandbox and production are separate. Missing/incomplete Wallet setup returns HTTP 200 with `ready: false` and a setup reason. Invalid environment returns 400; an undeployed native endpoint returns 404; invalid/non-admin identities receive 401/403. The status API does not provision Wallets or move money. It requires no HMAC key, workflow or app database. Provider setup and transactions remain in the Cloudgate hub's Wallet page.

SMTP secrets are managed by the native tenant email settings API. The skeleton does not provision an app database.

## Extending the skeleton

- `src/components/navConfig.jsx` and `src/App.jsx`: navigation and routes.
- `src/integrations/`: adapted shared Shop Analytics, Logs, SMTP and About components.
- `src/services/`: signed workflows and bearer-authenticated tenant APIs.
- `src/settings/`: saved settings, branding updates and contrast-aware theme application.
- `src/pages/`: back-office screens and Dashboard/Orders placeholders.
- `src/components/PlaceholderPage.jsx`: shared placeholder presentation.

Replace the placeholders with your application's metrics and order management when their domain APIs are ready. If you add workflow APIs, `src/services/api.js` provides the optional signed workflow client; enforce administrator authorization in the backend and add a workflow bundle to your template manifest when needed. Appearance and payment readiness are implemented by the native backend.

## Checks

```sh
npm test                   # API refresh/errors, theme validation and Analytics clients
npm run test:ui            # Playwright; real app with intercepted Cloudgate APIs
npm run build
```

Install a browser for UI checks once with `npx playwright install chromium` if needed. UI checks bind local port 3199 and supply fixture configuration; they never change tenant accounts, settings, media or send real email. Set `ADMIN_TEST_OUTPUT_DIR` to save screenshots. The browser checks cover placeholders without sample API calls, account operations, confirmation/cancellation, branding persistence, themes, SMTP, media, Analytics/Logs/Payments/About, non-admin access and a 360px mobile viewport.
