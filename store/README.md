# Cloudgate Store Demo

Angular e-commerce store demo for the [Cloudgate](https://cloudgate.dev) **Web Coder** gallery. Browse products backed by a Cloudgate workflow (`GET /products`).

**Public demo:** [https://store-demo.cloudweb.dev/](https://store-demo.cloudweb.dev/)

## Screenshots

Mobile UI in light and dark mode. Full-size files are hosted at [cloudgate.dev/assets/app-templates/store/](https://cloudgate.dev/assets/app-templates/store/).

### Light mode

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/store/light-01.png" width="190" alt="Sign in" />
  <img src="https://cloudgate.dev/assets/app-templates/store/light-02.png" width="190" alt="Sign up" />
  <img src="https://cloudgate.dev/assets/app-templates/store/light-03.png" width="190" alt="Home" />
  <img src="https://cloudgate.dev/assets/app-templates/store/light-04.png" width="190" alt="Favourites" />
</p>
<p align="center"><sub>Sign in · Sign up · Home · Favourites</sub></p>

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/store/light-05.png" width="190" alt="Explore" />
  <img src="https://cloudgate.dev/assets/app-templates/store/light-06.png" width="190" alt="Profile" />
  <img src="https://cloudgate.dev/assets/app-templates/store/light-07.png" width="190" alt="Product detail" />
  <img src="https://cloudgate.dev/assets/app-templates/store/light-08.png" width="190" alt="Cart" />
</p>
<p align="center"><sub>Explore · Profile · Product detail · Cart</sub></p>

### Dark mode

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/store/dark-01.png" width="190" alt="Sign in" />
  <img src="https://cloudgate.dev/assets/app-templates/store/dark-02.png" width="190" alt="Sign up" />
  <img src="https://cloudgate.dev/assets/app-templates/store/dark-03.png" width="190" alt="Home" />
  <img src="https://cloudgate.dev/assets/app-templates/store/dark-04.png" width="190" alt="Favourites" />
</p>
<p align="center"><sub>Sign in · Sign up · Home · Favourites</sub></p>

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/store/dark-05.png" width="190" alt="Explore" />
  <img src="https://cloudgate.dev/assets/app-templates/store/dark-06.png" width="190" alt="Profile" />
  <img src="https://cloudgate.dev/assets/app-templates/store/dark-07.png" width="190" alt="Product detail" />
  <img src="https://cloudgate.dev/assets/app-templates/store/dark-08.png" width="190" alt="Cart" />
</p>
<p align="center"><sub>Explore · Profile · Product detail · Cart</sub></p>

## Local development

```bash
npm install
npm run start:local
```

Runs on **port 3000** with IdP and workflow proxying via `proxy.conf.json`.

## Workflow import

Import `.template/workflow-template.json`, publish the **Store Catalog** endpoint, and verify `GET /sbx/api/products`.
