# Admin Starter (Dark)

A dark-theme **React 18 + Vite + Tailwind** admin console starter: Cloudgate IdP login, a
responsive shell (desktop sidebar, mobile flyout + top bar), a dashboard with stat cards, and
sample **server-paginated table pages** (Users, Orders) with search — all calling Cloudgate
workflow endpoints through [`@cloudgatedevs/cloudgate-client`](https://github.com/cloudgatedevs/client).

Available in the Cloudgate hub under **Web Coder → Quick Start** as *Admin Starter (Dark)*.

## What's inside

- **Dark theme** — an `ink`/`mist`/`accent` palette in `tailwind.config.js`, ambient gradient
  background, `color-scheme: dark` so native controls render dark, and shared `card` / `input` /
  `btn-primary` / `btn-ghost` component classes in `src/index.css`.
- **Responsive shell** — fixed sidebar on desktop; on mobile a slide-in nav drawer and a top bar
  with back-button handling for drill-down routes. Safe-area insets are respected for notched
  devices. Tables render as stacked cards on phones (no sideways scrolling) via the shared
  `<Table />`, with `<Pager />` and `<SearchBar />` built to stay usable at 360px.
- **Cloudgate SDK** — auth and signed API calls come from `@cloudgatedevs/cloudgate-client`
  (`src/services/auth.js`, `src/services/api.js`): hosted-login redirect, token storage + silent
  refresh, HMAC request signing, envelope unwrapping, and a one-retry 401 refresh wrapper.
- **Sample pages** — Dashboard (stat cards + recent orders), Users and Orders (paginated,
  searchable tables), and Profile (view/edit the IdP account).

## Scripts

```bash
npm install
npm run dev        # start the dev server (http://localhost:3000)
npm run build      # production build -> dist/
npm run build:dev  # development-mode build (unminified, easier to debug) -> dist/
npm run preview    # preview a build locally
```

## Wire up the data

The pages call workflow endpoints in the project named by `VITE_CLOUDGATE_API_PROJECT`
(request base: `{VITE_CLOUDGATE_API_URL}/{VITE_CLOUDGATE_API_ENV}/{VITE_CLOUDGATE_API_PROJECT}/{route}`).
Publish these routes and the app lights up — until then the tables show their empty states:

| Route | Params | Returns (one row per record) |
| --- | --- | --- |
| `GET /dashboard` | — | `{ Users, Orders, Revenue30d, PendingOrders }` |
| `GET /users` | `search`, `skip`, `take` | `{ Id, Name, Surname, Email, Role, Status, CreatedAt, TotalCount }` |
| `GET /orders` | `search`, `status`, `skip`, `take` | `{ Id, Reference, CustomerName, CustomerEmail, Items, Total, Status, CreatedAt, TotalCount }` |

Paging convention: the client sends `skip`/`take`; every returned row carries a `TotalCount`
column with the full result-set size (`COUNT(*) OVER ()` in SQLite). See `src/services/admin.js`
for the exact shapes and a sample query, and rename routes/columns there to fit your API.

To repurpose the template, edit `src/services/admin.js` (endpoints), `src/components/navConfig.jsx`
(nav items + icons), and the pages in `src/pages/` — the shell and UI kit don't need to change.

## Configuration

Creating this template from Quick Start writes a ready-to-run `.env` for your tenant (IdP URLs,
tenancy name, dev preview return URL, and a sandbox API key). Cloning the folder yourself? Copy
`.env.example` to `.env` and fill in the values — the variables are documented inline there.

Restart the dev server after changing `.env`; Vite inlines these values at build time.

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
    api.js             # signed workflow API client — URL from gateway + env + project
    admin.js           # the app's endpoint wrappers (dashboard, users, orders)
  components/
    Layout.jsx         # responsive shell: sidebar, mobile drawer, top bar
    navConfig.jsx      # nav items, icons, mobile titles / back targets
    Brand.jsx          # placeholder logo — swap for the real one
    ui.jsx             # Table, Pager, SearchBar, StatCard, Badge, useAsync, formatters
    ScreenLoader.jsx
  pages/
    Dashboard.jsx      # stat cards + recent orders
    Users.jsx          # paginated, searchable users table
    Orders.jsx         # paginated, searchable orders table with status filter
    Profile.jsx        # view/edit name, surname, email
  App.jsx              # router
  main.jsx             # entry
```
