# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Restored mobile phone-frame layout on desktop (`force-mobile-layout` + `mobile-app-shell` on `RootComponent` after routing bypassed legacy `AppComponent`)
- IdP auth loop: route guard no longer sends users back to login when a valid access token exists but profile hydration is still pending or failed; session init now refreshes expired tokens and falls back to JWT claims when the profile API is unavailable
- IdP callback tokens in the hash route (`#/home?access_token=...`) are now captured during bootstrap

### Changed

- Renamed legacy Zero/App auth to `CloudgateAuthService` (`src/app/shared/auth/cloudgate-auth.service.ts`)
- Renamed display name to **Cloudgate Podcast Demo** across manifests, docs, and user-facing app strings
- Slimmed template bloat: removed unused npm packages (nswag, apexcharts, MSAL/ADAL/OAuth social-login stack, unused Capacitor plugins), dead dashboard module, legacy `LoginService`, and duplicate `bootstrapApplication` in `main.ts`
- Migrated app data to Cloudgate workflows only; IdP `/api/idp/*` remains for login and profile
- Replaced ABP bootstrap (`AbpUserConfiguration/GetAll`) with minimal local `abp` configuration (English locale, local clock, empty permissions)
- `AppSessionService` hydrates user/tenant from IdP profile only (no Session/DataFile/Profile ABP APIs)
- `ServiceProxyModule` now provides only HTTP interceptor and IdP refresh token handling (no API proxy classes)
- `appconfig.json`: removed `remoteServiceBaseUrl`; `idpApiUrl` aligns with `workflowGatewayUrl`
- Sign-up redirects to IdP registration; onboarding community-code lookup disabled pending workflow support

### Removed

- `service-proxies.ts` and all ABP `/api/services/app/*`, TokenAuth, DataFile, PushNotification, Account register, and Session API clients
- Dashboard module (NFT/podcast demo charts) and apexcharts build assets
- `login.service.ts` and mobile Google/Apple sign-up flows
- ABP push notification registration and server-side notification proxies
- Mobile onboarding redirect to `/auth/onboarding` when tenant missing from session

### Added

- Cloudgate workflow HTTP layer (`WorkflowHttpService`, `PodcastWorkflowService`) for loading podcast catalog JSON
- Workflow configuration in `appconfig.json` (`workflowGatewayUrl`, `workflowEnvironment`, etc.)
- `.cloudgate/podcast-catalog.json` as single source of truth for template podcast data
- `.cloudgate/podcast-catalog-workflow.json` and `WORKFLOW_SETUP.md` for MCP workflow creation
- Dynamic Home, Categories, Playlists, and Now Playing views bound to workflow catalog
- Episode navigation via `/home/play/:id`

## [0.5.0] - 2024-04-30

### Added

- add error module

## [0.4.1] - 2024-02-27

### Fixed

- profile menu z-index
- podcast music play button

## [0.4.0] - 2024-02-22

### Added

- button component

### Changed

- update angular minor version

## [0.3.0] - 2024-02-21

### Added

- Multi theme

## [0.2.0] - 2023-11-09

### Changed

- Upgrade angular version from 16 to 17

## [0.1.2] - 2023-10-24

### Fixed

- Scroll to top when route change (#9)

## [0.1.1] - 2023-02-03

### Fixed

- Mobile navbar menu index order
