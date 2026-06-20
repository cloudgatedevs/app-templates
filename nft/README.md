# Cloudgate NFT Demo

Angular NFT auction demo for the [Cloudgate](https://cloudgate.dev) **Web Coder** gallery. Browse NFT collections, place bids, and explore listings backed by a Cloudgate workflow (`GET /nfts`).

**Public demo:** [https://nft-demo.cloudweb.dev/](https://nft-demo.cloudweb.dev/)

## Screenshots

Mobile UI in light and dark mode. Full-size files are hosted at [cloudgate.dev/assets/app-templates/nft/](https://cloudgate.dev/assets/app-templates/nft/).

### Light mode

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/nft/light-01.png" width="190" alt="Sign in" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/light-02.png" width="190" alt="Sign up" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/light-03.png" width="190" alt="Home" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/light-04.png" width="190" alt="Favourites" />
</p>
<p align="center"><sub>Sign in · Sign up · Home · Favourites</sub></p>

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/nft/light-05.png" width="190" alt="Explore" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/light-06.png" width="190" alt="Profile" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/light-07.png" width="190" alt="Bid detail" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/light-08.png" width="190" alt="Gallery" />
</p>
<p align="center"><sub>Explore · Profile · Bid detail · Gallery</sub></p>

### Dark mode

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/nft/dark-01.png" width="190" alt="Sign in" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/dark-02.png" width="190" alt="Sign up" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/dark-03.png" width="190" alt="Home" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/dark-04.png" width="190" alt="Favourites" />
</p>
<p align="center"><sub>Sign in · Sign up · Home · Favourites</sub></p>

<p align="center">
  <img src="https://cloudgate.dev/assets/app-templates/nft/dark-05.png" width="190" alt="Explore" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/dark-06.png" width="190" alt="Profile" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/dark-07.png" width="190" alt="Bid detail" />
  <img src="https://cloudgate.dev/assets/app-templates/nft/dark-08.png" width="190" alt="Gallery" />
</p>
<p align="center"><sub>Explore · Profile · Bid detail · Gallery</sub></p>

## Local development

```bash
npm install
npm run start:local
```

Runs on **port 3000** with IdP and workflow proxying via `proxy.conf.json`.

## Workflow import

Import `.template/workflow-template.json`, publish the **NFT Catalog** endpoint, and verify `GET /sbx/api/nfts`.
