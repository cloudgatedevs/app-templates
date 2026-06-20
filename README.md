# Cloudgate App Templates

Official starter apps for the [Cloudgate](https://cloudgate.dev) **Web Coder** Quick Start gallery.

Browse templates in the hub at **Web Coder → Quick Start** (`/web-coder`). Each card shows a preview image, framework, description, and a link to the template source on GitHub. Choose **Use this template** to copy the project into your Cloudgate workspace and open it in the editor.

## Templates

| Template | Folder | Workflow API | Demo |
| --- | --- | --- | --- |
| [Cloudgate Podcast Demo](./podcast/) | [`podcast/`](./podcast/) | `GET /podcasts` | [podcast-demo.cloudweb.dev](https://podcast-demo.cloudweb.dev/) |
| [Cloudgate Hotel Demo](./hotel/) | [`hotel/`](./hotel/) | `GET /hotels` | [hotel-demo.cloudweb.dev](https://hotel-demo.cloudweb.dev/) |
| [Cloudgate Medical Demo](./medical/) | [`medical/`](./medical/) | `GET /doctors` | [medical-demo.cloudweb.dev](https://medical-demo.cloudweb.dev/) |
| [Cloudgate NFT Demo](./nft/) | [`nft/`](./nft/) | `GET /nfts` | [nft-demo.cloudweb.dev](https://nft-demo.cloudweb.dev/) |
| [Cloudgate Store Demo](./store/) | [`store/`](./store/) | `GET /products` | [store-demo.cloudweb.dev](https://store-demo.cloudweb.dev/) |
| [Cloudgate Wallet Demo](./wallet/) | [`wallet/`](./wallet/) | `GET /transactions` | [wallet-demo.cloudweb.dev](https://wallet-demo.cloudweb.dev/) |
| [Cloudgate CRM](./crm/) | [`crm/`](./crm/) | `POST /crm/*` (leads, pipeline, email, …) | — |
| [Cloudgate LMS](./lms/) | [`lms/`](./lms/) | `POST /lms/*` (courses, lessons, quizzes, …) | — |

Most gallery templates are **Angular 17** apps with Tailwind CSS, Capacitor-ready mobile shells, Cloudgate IdP login, and a bundled workflow import (`.template/workflow-template.json`) for the catalog API each app calls at runtime.

**Cloudgate CRM** is a fuller, data-driven example: a **React 18 + Vite + Tailwind** application backed by a complete Cloudgate workflow API — a SQLite database with leads, companies, contacts, pipeline stages, activities, tasks, tags and emails, plus SendGrid email send, reply/open tracking webhooks, and mass-email campaigns. Its `.template/workflow-template.json` bundles every CRM endpoint and `.template/schema.sql` provisions the database schema and sample data.

**Cloudgate LMS** is another full **React 18 + Vite + Tailwind** example: a Learning Management System backed by a complete Cloudgate workflow API — a SQLite database of courses, lessons, enrolments, lesson progress, quizzes and certificates, served by op-dispatch endpoints. It features a course catalog, a lesson player with progress tracking, auto-graded quizzes, completion certificates, and a unified activity feed. Its `.template/workflow-template.json` bundles every LMS endpoint and `.template/schema.sql` provisions the schema and demo data.

### Production build before publish

Published apps are served as static files from `dist/`. For the smallest bundles and best live performance:

```bash
npm install
npm run build -- --configuration production
```

Then publish the **`dist/`** folder from **Web Coder → Web Apps**. Production builds use hashed filenames so browsers and Cloudflare can cache JS/CSS aggressively after deploy.

Additional bare starters (`react/`, `angular/`, `html/`, `vue/`) live in this repo and can be enabled in [`templates.json`](./templates.json) when listed in the manifest.

### Per-template docs

Each demo folder has its own README with screenshots, local dev steps, and workflow import instructions:

- [podcast/README.md](./podcast/README.md)
- [hotel/README.md](./hotel/README.md)
- [medical/README.md](./medical/README.md)
- [nft/README.md](./nft/README.md)
- [store/README.md](./store/README.md)
- [wallet/README.md](./wallet/README.md)
- [crm/README.md](./crm/README.md)
- [lms/README.md](./lms/README.md)

## Repository layout

```
templates.json          # Manifest published to the Quick Start gallery
podcast/                # Angular podcast demo + workflow import
hotel/                  # Angular hotel discovery demo + workflow import
medical/                # Angular medical / doctor booking demo + workflow import
nft/                    # Angular NFT auction demo + workflow import
store/                  # Angular e-commerce store demo + workflow import
wallet/                 # Angular wallet / transfer demo + workflow import
crm/                    # React CRM app + workflow import (leads, pipeline, email, SQLite)
lms/                    # React LMS app + workflow import (courses, lessons, quizzes, SQLite)
react/                  # Bare React starter (not in gallery manifest)
angular/                # Bare Angular starter (not in gallery manifest)
html/                   # Bare HTML starter (not in gallery manifest)
vue/                    # Bare Vue starter (not in gallery manifest)
```

Each template folder contains a runnable project and a `template.json` with the same metadata as its manifest entry.

## Manifest fields

Entries in `templates.json` drive the Quick Start cards:

| Field | Purpose |
| --- | --- |
| `id` | Unique template identifier |
| `name` | Card title |
| `description` | Short summary on the card |
| `folder` | Repo subfolder copied into the user's workspace |
| `framework` | Badge label (e.g. Angular, React) |
| `devCommand` | Suggested start command shown in the use-template dialog |
| `devPort` | Dev server port (informational) |
| `thumbnail` | Preview image URL on the card |
| `demoUrl` | Live hosted demo link shown on the card (optional) |
| `tags` | Search/filter tags in Quick Start |

## Adding a template

1. Add a new top-level folder with the starter source.
2. Add `template.json` inside the folder (include a `banner.png` gallery thumbnail).
3. Register the template in `templates.json`.
4. Keep each template folder lean — Web Coder copies only that folder (50 MB per-template limit), and skips `docs/`. README screenshots live on [cloudgate.dev/assets/app-templates/](https://cloudgate.dev/assets/app-templates/), not in this repo. Do not commit `node_modules/`, `dist/`, Capacitor `android/`/`ios/` shells, or large unused preview GIFs.
5. Push to `main` — new and updated templates appear in Quick Start after the gallery refreshes.

## License

Template projects include their own licenses where applicable. See each folder for details.
