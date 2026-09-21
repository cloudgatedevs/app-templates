# Admin Back Office controller bundle

`workflow-template.json` provisions an empty, non-private `admin` controller. Native appearance, payments and workflow-log APIs use this controller to resolve the application scope. The bundle contains no workflow actions, database connections, schema or seeded records. Dashboard and Orders are static placeholders.

The App Store imports the controller automatically. For manual installations or Quick Start, import this bundle through Cloudgate's template import, or select an existing non-private tenant controller. Quick Start selects workflow actions for import and cannot import an empty controller through that selection. Set `VITE_CLOUDGATE_API_PROJECT` to the actual controller path and `VITE_CLOUDGATE_API_ENV` to `sbx` or `prod`. No workflow publication is required.

Existing installations keep their current controller path. Updating this template does not delete deployed workflows, databases or records. The frontend no longer calls the old `dashboard`, `users` or `orders` workflow actions. Review any other consumers before retiring those resources separately.

`env.example` is a reference copy of the root environment example. IdP user management, appearance/theme, payments, SMTP, media, Analytics and Logs use native host APIs. Use an active tenant IdP administrator account; appearance also requires the platform migration described in the root README.

Payment readiness uses `POST /api/idp/{tenant}/admin/payments/status` with `{ projectPath, environment }` and an IdP Admin bearer token. An unconfigured Wallet returns HTTP 200 with `ready: false`. Provider setup and transactions remain in the Cloudgate Wallet hub.

To add application-specific features, replace the placeholder pages and implement their domain APIs. The optional workflow client is available in `src/services/api.js`; native back-office features require no workflow signing credentials or app database.
