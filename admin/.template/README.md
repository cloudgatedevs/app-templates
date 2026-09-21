# Admin Back Office workflow bundle

The bundle provisions the `admin` controller, its `admin_db` database, and three sample POST actions: `dashboard`, `users`, and `orders`. Every action starts with the same **IdP Authorize / Admin** guard used by the Shop back office and has workflow logging enabled.

- `schema.sql`: original example users/orders. Re-running preserves data, including any legacy settings table; new installations do not create appearance storage.
- `workflow-template.json`: import payload with database schema embedded and all nodes/links included.
- `scripts/`: readable Function scripts. `helpers.py` is adapted from Shop's Cloudgate runtime helpers.
- `env.example`: reference copy of the root environment example.

Import and provision the bundle, publish all actions to sandbox, and sign in with a tenant IdP administrator account. For an existing installation, apply `schema.sql` to its existing database and update its actions with the new guards and scripts. Do not replace an existing database with a fresh seeded one. Production publishing requires configuring a separate production database binding on Database nodes, as with the original starter.

Verify these authenticated requests:

```text
POST /sbx/admin/dashboard  {"op":"stats"}
POST /api/idp/{tenant}/admin/payments/status   {"projectPath":"admin","environment":"sbx"}
```

Payment readiness is a native IdP Admin backend API, not an action in this bundle. It reads Cloudgate's existing Wallet for the verified tenant/environment without a workflow or app database. An unconfigured Wallet returns HTTP 200 with `ready: false`; 404 means an inaccessible app scope or an undeployed API. Administrators manage providers, transactions and payouts in the Cloudgate Wallet hub. Deploy/restart the updated backend before using the new frontend; no additional Wallet migration is needed. Previously published payments workflows may be retired after all clients move to the native endpoint; this bundle does not delete them.

IdP user management, appearance/theme, payments, SMTP, media, Analytics and Logs are host APIs and require no duplicate workflow actions. SQLite `users` remains sample application data, not the IdP identity store.

Appearance requires the backend's `admin/appearance/{details|update|reset}` API and its WebDbContext migration. Calls use an IdP Admin bearer token, `projectPath` and `environment`; saves also use the returned `revision`. Before upgrading a customized installation, transfer its old appearance values to the native API as described in the root README. No automated legacy reads or deletes occur.

Run `npm run cloudgate:package` after changing a node script or schema, then `npm run test:workflows`. The packager updates the existing exported graph; it does not publish or mutate any remote controller. Structural changes should be made with Cloudgate workflow tooling and exported again.
