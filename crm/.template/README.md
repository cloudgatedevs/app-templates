# Cloudgate CRM workflow bundle

This folder is the Cloudgate import payload for the **Cloudgate CRM** backend. Unlike the
single-endpoint demo templates, the CRM ships a full controller: a SQLite database and a
set of workflow endpoints the React app calls at runtime.

| File | Purpose |
| --- | --- |
| [`workflow-template.json`](./workflow-template.json) | Cloudgate import payload — creates the **CRM** project (path `crm`) with every endpoint and its Function → Database workflow nodes. |
| [`schema.sql`](./schema.sql) | Creates the `crm_db` SQLite tables (leads, companies, contacts, pipeline_stages, activities, tasks, tags, lead_tags, emails, email_events, import_batches), seeds pipeline stages + tags, and loads sample data. Safe to re-run. |
| [`env.example`](./env.example) | Reference copy of the runtime config (`.env` keys) Quick Start writes, with `{{placeholders}}`. The app does not read it. |

## Import steps

1. **Import** `workflow-template.json` via **Cloudgate → Imports** (or Quick Start / workflow MCP `import_platform_template`). This creates the `crm` controller, its `crm_db` SQLite database, and all endpoints as drafts.
2. **Provision the database**: Quick Start runs [`schema.sql`](./schema.sql) automatically on import. For manual setup, run it against the `crm_db` database (Cloudgate → Databases → SQL console, or the data MCP `execute_database_sql`).
3. **Publish** all CRM endpoints to **sandbox**.
4. **(Optional) Enable email** — set project/global keys `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`. Point SendGrid Inbound Parse at `…/prod/crm/email-inbound` and the Event Webhook at `…/prod/crm/email-events`. Without keys, sends are logged with status `failed` so the UI still works.

## Verify

```
POST {apps-gateway}/sbx/crm/dashboard   {"op":"stats"}    -> pipeline KPIs
POST {apps-gateway}/sbx/crm/leads       {"op":"list"}     -> seeded leads
```

## Endpoints (project path `crm`, request type `Any`)

All are called as `POST {base}/crm/<route>` with a JSON body `{ "op": "...", ... }`
(except the email/webhook routes). The React client signs every request and attaches the
IdP bearer token; the webhook routes (`email-inbound`, `email-events`) are anonymous.

`leads`, `companies`, `contacts`, `tasks`, `activities`, `stages`, `tags`, `emails`,
`import`, `dashboard`, `email-send`, `email-bulk`, `email-inbound`, `email-events`.

> The React app's gateway base is `VITE_CLOUDGATE_API_URL` (e.g. `{workflowGatewayUrl}/sbx/crm`) in `.env` — see [`../.env.example`](../.env.example).
