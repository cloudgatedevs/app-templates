# Admin Starter (Dark) workflow bundle

This folder is the Cloudgate import payload for the **Admin Starter (Dark)** backend: a
SQLite database and the workflow endpoints the React app calls at runtime.

| File | Purpose |
| --- | --- |
| [`workflow-template.json`](./workflow-template.json) | Cloudgate import payload — creates the **Admin** project (path `admin`) with each endpoint and its Function → Database workflow nodes. |
| [`schema.sql`](./schema.sql) | Creates the `admin_db` SQLite tables (`users`, `orders`) and loads demo data (12 users, 20 orders spread over ~90 days so the 30-day revenue stat is meaningful). Safe to re-run. |
| [`env.example`](./env.example) | Reference copy of the runtime config (`.env` keys) Quick Start writes, with `{{placeholders}}`. The app does not read it. |

## Import steps

1. **Import** `workflow-template.json` via **Cloudgate → Imports** (or Quick Start / workflow MCP `import_platform_template`). This creates the `admin` controller, its `admin_db` SQLite database, and all endpoints as drafts.
2. **Provision the database**: Quick Start runs [`schema.sql`](./schema.sql) automatically on import. For manual setup, run it against the `admin_db` database (Cloudgate → Databases → SQL console, or the data MCP `execute_database_sql`).
3. **Publish** all Admin endpoints to **sandbox**.

## Verify

```
POST {apps-gateway}/sbx/admin/dashboard   {"op":"stats"}   -> user/order counts + 30-day revenue
POST {apps-gateway}/sbx/admin/users       {"op":"list"}    -> seeded users with TotalCount
POST {apps-gateway}/sbx/admin/orders      {"op":"list"}    -> seeded orders with TotalCount
```

## Endpoints (project path `admin`)

All are called as `POST {base}/admin/<route>` with a JSON body `{ "op": "...", ... }`
(same convention as the Cloudgate CRM template). The React client signs every request
and attaches the IdP bearer token.

| Route | Ops | Notes |
| --- | --- | --- |
| `dashboard` | `stats` (default), `recent` | `stats` returns `{ Users, Orders, Revenue30d, PendingOrders }`. |
| `users` | `list` (default), `get`, `create`, `update`, `disable`, `enable`, `delete` | `list` takes `search`, `role`, `status`, `skip`, `take`; rows carry `TotalCount`. |
| `orders` | `list` (default), `get`, `create`, `update`, `status`, `delete` | `list` takes `search`, `status`, `skip`, `take`; rows carry `TotalCount`. |

Paging convention: the client sends `skip`/`take`; every `list` row carries a
`TotalCount` column (`COUNT(*) OVER ()`) that feeds the app's shared pager.

> The React app composes its request base from `VITE_CLOUDGATE_API_URL` /
> `VITE_CLOUDGATE_API_ENV` / `VITE_CLOUDGATE_API_PROJECT` in `.env` — see
> [`../.env.example`](../.env.example) (`VITE_CLOUDGATE_API_PROJECT=admin`).
