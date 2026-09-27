# React Template setup reference

This template uses native Cloudgate APIs and does not bundle a controller, workflow database or seeded app records. Example page is the single workspace placeholder and guides builders to the Developers bar at the bottom. Use the root README and `.env.example` for current installation and upgrade instructions; `env.example` here is a reference copy.

Sign in with an active tenant account with the required back-office permissions. Published metadata identifies the web app and environment; local development can configure these explicitly. Leave `VITE_CLOUDGATE_API_PROJECT` blank for logs across the tenant's accessible controllers, or set a controller path to focus Logs and the developer workspace. Logs requires `backoffice.logs.view` and shows an empty view until workflows run.

Notifications belong to IdP users within a tenant and environment. Apply the `AddIdpNotifications` ZeroDbContext migration and configure the existing Redis connection on every backend instance. The inbox uses native WebSocket updates and persisted read receipts. An **IdP Notification** workflow node can send to all current app users or one user ID, with an optional link action. See the root README and the tenant API documentation for the REST and WebSocket contracts.

Native back-office features require no workflow signing credentials or app database. To extend the placeholders, add your domain APIs and use the optional workflow client in `src/services/api.js` where appropriate.
