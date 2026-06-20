# Hotel workflow bundle

[workflow-template.json](./workflow-template.json) is the Cloudgate import payload for the Doctor Catalog API (`GET /doctors`).

[appsettings.json](./appsettings.json) is a reference copy of the runtime keys Cloudgate sets (with `{{placeholders}}`); the app does not read it.

After import:

1. **Publish** the **Doctor Catalog** endpoint to sandbox.
2. Confirm: `GET {apps-gateway}/sbx/api/hotels` returns the catalog JSON.

The Angular app calls `{workflowGatewayUrl}/{environment}/api/hotels` (`workflowGatewayUrl` is tenant-specific; `environment` is `sbx` or `prod` in `src/assets/appconfig.json`).

To change catalog data, edit the `MedicalCatalogFunction` MainScript in `workflow-template.json`, then re-import via Cloudgate Imports if needed.
