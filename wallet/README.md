# Cloudgate Wallet Demo

Angular wallet demo for the [Cloudgate](https://cloudgate.dev) **Web Coder** gallery. View balances and transfer funds; catalog data comes from a Cloudgate workflow (`GET /transactions`).

**Public demo:** [https://wallet-demo.cloudweb.dev/](https://wallet-demo.cloudweb.dev/)

## Screenshots

Mobile UI in light and dark mode. Full-size files are hosted at [cloudgate.dev/assets/app-templates/wallet/](https://cloudgate.dev/assets/app-templates/wallet/).

### Light mode

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/wallet/light-01.png" width="190" alt="Sign in" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/light-02.png" width="190" alt="Sign up" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/light-03.png" width="190" alt="Home" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/light-04.png" width="190" alt="Favourites" />
</p>
<p align="center"><sub>Sign in · Sign up · Home · Favourites</sub></p>

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/wallet/light-05.png" width="190" alt="Explore" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/light-06.png" width="190" alt="Profile" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/light-07.png" width="190" alt="Transfer" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/light-08.png" width="190" alt="Accounts" />
</p>
<p align="center"><sub>Explore · Profile · Transfer · Accounts</sub></p>

### Dark mode

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/wallet/dark-01.png" width="190" alt="Sign in" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/dark-02.png" width="190" alt="Sign up" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/dark-03.png" width="190" alt="Home" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/dark-04.png" width="190" alt="Favourites" />
</p>
<p align="center"><sub>Sign in · Sign up · Home · Favourites</sub></p>

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/wallet/dark-05.png" width="190" alt="Explore" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/dark-06.png" width="190" alt="Profile" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/dark-07.png" width="190" alt="Transfer" />
  <img src="https://cloudgate.dev/assets/app-templates/wallet/dark-08.png" width="190" alt="Accounts" />
</p>
<p align="center"><sub>Explore · Profile · Transfer · Accounts</sub></p>

## Local development

```bash
npm install
npm run start:local
```

Runs on **port 3000** with IdP and workflow proxying via `proxy.conf.json`.

## Workflow import

Import `.template/workflow-template.json`, publish the **Wallet Catalog** endpoint, and verify `GET /sbx/api/transactions`.
