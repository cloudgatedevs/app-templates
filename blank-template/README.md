# Cloudgate blank template

A small React app composed with `@cloudgatedevs/cloudgate-client`. The SDK owns authentication,
native Cloudgate APIs and the shared back-office UI. Dashboard and Orders remain app-owned
placeholders for your own logic. No workflow controller is needed for the shared features.

## Run

```sh
npm install
npm run dev
```

Cloudgate Quick Start fills `.env.example` placeholders into `.env`. For manual setup, supply
the hub URL, API URL, tenant and local web app ID. Published site metadata overrides the local
web app/environment defaults. Allow the app origin in the tenant's IdP return URLs. Sign in as
an IdP `Admin`. Native features send an IdP bearer token; do not put signing secrets in `VITE_` values.

## Develop the SDK locally

```sh
npm run dev:sdk
```

This resolves `../../client`, matching the normal `GitHub/client` and `GitHub/app templates/blank-template`
layout. It serves SDK source directly with Vite updates for JS, JSX and CSS, without publishing,
pushing, rebuilding the SDK, changing your package dependency or using a global npm link.
React and other UI peers resolve from this app to avoid duplicate React installations.

```sh
npm run dev:sdk -- --sdk "D:/repos/GitHub/client" --port 3000
```

Alternatively set `CLOUDGATE_SDK_PATH`. The local checkout needs the 0.6 source structure;
its own node_modules are not needed to run this mode. Restart the dev server after changing
SDK build/theme configuration. Ordinary `npm run dev` and `npm run build` use the installed
dependency, making it easy to compare a release with local changes.

This review includes a portable `vendor/cloudgatedevs-cloudgate-client-0.6.0.tgz` dependency
so a clean checkout also builds before 0.6 is published. Once released, replace it using
`npm install @cloudgatedevs/cloudgate-client@0.6.0` and commit the updated lockfile.

## Add your app logic

- `src/services/cloudgate.js`: your Cloudgate configuration.
- `src/App.jsx`: your routes and navigation, composed with `CloudgateBackoffice`.
- `src/pages/Dashboard.jsx` and `Orders.jsx`: replace with your domain logic.
- `template.json`: application metadata supplied to the shared About screen.
- `src/index.css`: your Tailwind utilities. Shared SDK CSS is imported after utilities so
  responsive rules stay in order. Import separate app-specific overrides after shared CSS if needed.

Use `useCloudgate()` to access native clients from your own components. Domain workflow clients
belong in your app; privileged signing should live on your server. The optional project setting
only scopes the shared native Logs screen and has no implicit `admin` default.

### Navigation that grows with your app

Your modules are the primary navigation. Cloudgate's shared controls are grouped under a
collapsed **Administration** menu beneath them. The template demonstrates a `Commerce` module
containing Orders. Add links or nested modules in `src/App.jsx`:

```jsx
{ id: 'inventory', label: 'Inventory', defaultExpanded: true, children: [
  { to: '/products', label: 'Products', keywords: ['stock', 'catalog'] },
  { to: '/suppliers', label: 'Suppliers' },
] }
```

Add matching React Router routes for your pages. Use stable group IDs; `icon` is optional.
Existing flat links and `group` captions still work. The SDK supplies expandable menus,
search, active-route breadcrumbs, saved expansion state and a hideable desktop sidebar.
Desktop spacing is compact, while the mobile drawer keeps comfortable touch targets.
These shared behaviors update through npm and work with `npm run dev:sdk`.

## Link a Cloudgate account

Open Profile and choose **Link Cloudgate account**. Sign in to Cloudgate in the popup and
approve the two displayed identities. The popup closes automatically after approval.
A busy **Linking…** button is shown while approval is pending.
If popups are blocked, Cloudgate opens in the current window automatically.
The SDK completes the request using the original IdP session. The relationship persists on the
server between sign-ins. **Detach Cloudgate account** removes it and invalidates pending approvals.
This requires the backend `AddIdpCloudgateAccountLink` migration and hub `/account-link` screen.
Linking is an optional identity association. All back-office controls use the current IdP Admin role;
linking or detaching does not change access and no ABP token is used for settings changes.

## Email template

For app-user email layouts, use **Administration → Content & email → Email template** (`/email-template`).
The shared SDK includes the HTML editor, merge fields, default restoration, live sample preview and
enable/disable control. Save changes to apply the layout tenant-wide. Disabling retains your HTML.
This needs the updated backend email-template endpoints and an active IdP user with the Admin role. SMTP configuration is separate. Use `npm run dev:sdk` to test SDK edits
locally without publishing.

## Allow self-registration

Open **Administration → People & access → Registration**, change **Allow self-registration**, and
choose **Save changes**. The setting persists on Cloudgate and affects all apps in the tenant,
including sandbox and production. Existing users can still sign in when registration is disabled.
Your IdP account must have the Admin role. Both the API client and screen live in the SDK. Deploy
the updated backend endpoints before using the control; an older backend shows an unavailable message.
Account linking is optional and has no effect on this permission check.

## Create app notifications

Open **Administration → People & access → App notifications** (`/app-notifications`) to create
notifications, view sent history and inspect read receipts. Choose Sandbox or Production, select one
app user or all current users, enter a plain-text message, and review it before sending. Four alert styles
and optional action links are supported. The personal inbox links to this management page.

The UI and native API client live in the SDK and use the existing IdP Admin notification endpoints.
Notification creation needs an active IdP Admin, with no ABP link or new backend migration required.
Broadcasts apply to current app users across the tenant. Test local SDK edits with `npm run dev:sdk`.

## Developer workspace

The bottom **Developers** bar comes from the SDK. Sign in as an IdP Admin, link the corresponding
Cloudgate account under **Profile**, then open the bar. It frames Cloudgate's workflow editor and
development tools with the project fixed to this app's tenant. Workflow controllers within that
project remain selectable. API metrics, databases, WebSockets, schedules, keys, tests, releases and
logs use the linked ABP user's actual permissions. Ordinary backoffice controls still use IdP Admin.

Minimize the panel to return to your app without discarding the open workflow. **End developer
session** closes it. Developer sessions expire after 20 minutes; save before closing or reconnecting.
Set `developerMode={false}` on `CloudgateBackoffice` if an app should not show this entry point.

Deploy the matching Cloudgate backend and React hub changes. Add this app's origin to the tenant's
IdP allowed redirect URLs, allow the hub origin in backend CORS, and allow this app in the hub's
`frame-ancestors` policy specifically for `/developer`. The hub's configured API must point at the
same backend as this app. No npm publication is needed for testing: use `npm run dev:sdk`.

## Validate and release

```sh
npm run build
npm run test:ui
```

Browser checks build the real app and mock APIs; they do not change tenant data. They cover
account linking, responsive pages, dialogs, permissions, settings, users, media, notifications,
analytics and payment readiness. Install Playwright Chromium once if needed, or set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to a locally installed Chromium browser. Port 3199 is used.
Set `ADMIN_TEST_OUTPUT_DIR` to retain screenshots.

Quick Start uses the `app-templates/templates.json` catalog. App Store uses a separate catalog
(normally `cloudgatedevs/apps/apps.json`). Updating this template does not update the other catalog
or applications already copied by customers. Release the SDK, update the template dependency and
catalog entry, and explicitly update any App Store listing that should offer this template.
Existing apps adopt shared features by updating their npm dependency and rebuilding.
