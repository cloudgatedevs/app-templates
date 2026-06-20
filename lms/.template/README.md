# Cloudgate LMS workflow bundle

This folder is the Cloudgate import payload for the **Cloudgate LMS** backend. The LMS
ships a full controller: a SQLite database and a set of workflow endpoints the React app
calls at runtime.

| File | Purpose |
| --- | --- |
| [`workflow-template.json`](./workflow-template.json) | Cloudgate import payload — creates the **LMS** project (path `lms`) with every endpoint and its Function → Database workflow nodes. |
| [`schema.sql`](./schema.sql) | Creates the `lms_db` SQLite tables (courses, lessons, enrollments, lesson_progress, quizzes, quiz_questions, quiz_attempts, certificates) and loads a demo dataset. Safe to re-run. |
| [`env.example`](./env.example) | Reference copy of the runtime config (`.env` keys) Quick Start writes, with `{{placeholders}}`. The app does not read it. |

## Import steps

1. **Import** `workflow-template.json` via **Cloudgate → Imports** (or Quick Start / workflow MCP `import_platform_template`). This creates the `lms` controller, its `lms_db` SQLite database, and all endpoints as drafts.
2. **Provision the database**: Quick Start runs [`schema.sql`](./schema.sql) automatically on import. For manual setup, run it against the `lms_db` database (Cloudgate → Databases → SQL console, or the data MCP `execute_database_sql`).
3. **Publish** all LMS endpoints to **sandbox**.

No project keys are required — the LMS uses only its SQLite database.

## Verify

```
POST {apps-gateway}/sbx/lms/dashboard   {"op":"stats"}   -> course/enrolment KPIs
POST {apps-gateway}/sbx/lms/courses     {"op":"list"}    -> seeded courses
```

## Endpoints (project path `lms`, request type `Any`)

All are called as `POST {base}/lms/<route>` with a JSON body `{ "op": "...", ... }`. The
React client signs every request and attaches the IdP bearer token.

`courses`, `lessons`, `enrollments`, `progress`, `quizzes`, `quiz-attempts`,
`certificates`, `dashboard`, `activity`.

> The React app's gateway base is `VITE_CLOUDGATE_API_URL` (e.g. `{workflowGatewayUrl}/sbx/lms`) in `.env` — see [`../.env.example`](../.env.example).
