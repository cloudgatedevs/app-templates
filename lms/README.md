# Cloudgate LMS

A complete Learning Management System built on Cloudgate (React + Vite + Tailwind).
Browse a course catalog, author lessons and quizzes, enroll and track progress with a
lesson player, take auto-graded quizzes, and earn completion certificates — all behind
Cloudgate IdP auth, with every byte of data served by Cloudgate workflow APIs.

- **Cloudgate IdP auth** — hosted login redirect, token storage, silent refresh, 401
  retry, and a profile load/update flow.
- **Theming** — a soft, rounded look with a teal + coral palette, Plus Jakarta Sans type,
  a subtle washed background, and shared UI primitives (`Card`, `Badge`, `StatCard`, …).
- **Workflow API client** — a signed Cloudgate gateway client; the React client talks
  ONLY to Cloudgate workflow endpoints.

## Architecture

The client never calls a backend or database directly. All data is fetched from
**Cloudgate workflow endpoints**, with requests HMAC-signed in the browser and the IdP
bearer token attached automatically.

```
Browser (React)  ──signed HTTP──>  Cloudgate /sbx/lms/<route>
```

## Structure

```
src/
  auth/                 # Cloudgate IdP auth (login, refresh, profile, guards)
  services/
    api.js              # signed Cloudgate workflow client (api.get/post/put/del)
    apiClient.js        # HMAC request signing (Web Crypto)
    lms.js              # LMS API wrappers (courses, lessons, enrollments, …)
    covers.js           # resolves a placeholder cover image per course
    config.js           # APP_NAME
    format.js           # number/date helpers
  components/
    Layout.jsx          # sidebar nav, user menu, footer
    AnimatedBackground.jsx
    ui.jsx              # Card, Badge, StatCard, Button, Modal helpers, icons
    Modal.jsx  Toast.jsx  ScreenLoader.jsx
  hooks/
    useAsync.js         # tiny async/loading hook
    useStudent.js       # resolves the signed-in user as the LMS learner
  pages/
    Home.jsx            # dashboard (stats, popular courses, recent enrolments)
    Courses.jsx         # course catalog + create
    CourseDetail.jsx    # lessons + quizzes + enroll
    Enrollments.jsx     # "My Learning" — overview, continue learning, activity
    LessonPlayer.jsx    # lesson player (read, mark complete, navigate, quiz CTA)
    Quizzes.jsx         # take auto-graded quizzes + manage questions
    Certificates.jsx    # earned certificates + serial verification
    Profile.jsx         # IdP profile (auth-gated)
  App.jsx               # routes
  main.jsx              # entry
public/course-covers/   # SVG placeholder cover art per course
```

## LMS modules

- **Courses & Lessons** — catalog, course detail, lesson authoring.
- **Enrolments & Progress** — enroll, per-lesson completion, auto-computed progress %,
  and a dedicated lesson player at `/learn/:enrollmentId`.
- **Quizzes & Grading** — auto-graded quizzes with question management and attempts.
- **Certificates** — issued on course completion, with serial verification.
- **My Learning** — learning stats, "Continue learning" resume cards, and an activity feed.

This is a single-role app: the signed-in IdP user is the learner (see
`src/hooks/useStudent.js`) and can also author content.

## Backend (Cloudgate `lms` project)

A Cloudgate project at path `lms` backs the app: one SQLite database (`lms_db`) and
op-dispatch workflow endpoints. Each endpoint is a Function node (parses the JSON body,
switches on `op`, returns SQL) feeding a Database node. The full import bundle lives in
[`.template/`](./.template).

| Route | Ops |
| --- | --- |
| `courses` | list, get, create, update, delete |
| `lessons` | list, get, create, update, reorder, delete |
| `enrollments` | list, get, create, update, delete |
| `progress` | forEnrollment, complete |
| `quizzes` | list, get, questions, create, update, delete, addQuestion, deleteQuestion |
| `quiz-attempts` | submit, list, get |
| `certificates` | list, get, issue, verify, delete |
| `dashboard` | stats, topcourses, recent, bycategory |
| `activity` | list (unified feed of lessons, quizzes, certificates, enrolments) |

## Calling a workflow endpoint

```js
import { api } from '@/services/api';

const courses = await api.post('/courses', { op: 'list' });
const created = await api.post('/courses', { op: 'create', title: 'Intro' });
```

(The gateway base in `.env` already includes `/sbx/lms`, so routes are relative.)

## Configuration

Copy `.env.example` to `.env` and set:

| Variable                 | Description                                              |
| ------------------------ | ------------------------------------------------------- |
| `VITE_APP_NAME`          | Display name (header, footer, tab title)                |
| `VITE_IDP_BASE_URL`      | IdP host used to build the hosted login URL             |
| `VITE_IDP_API_URL`       | Optional separate base for profile/refresh calls        |
| `VITE_IDP_TENANCY_NAME`  | Tenancy (overridable via `?idp_tenant=` or subdomain)   |
| `VITE_IDP_RETURN_URL`    | Where the IdP redirects back after login                |
| `VITE_CLOUDGATE_API_URL` | Cloudgate gateway base for workflow endpoints           |
| `VITE_API_KEY` / `VITE_API_SECRET` | Gateway HMAC signing credentials              |

## Backend setup

Import the workflow bundle and provision the database from [`.template/`](./.template):
see [`.template/README.md`](./.template/README.md) for steps. In short — import
`.template/workflow-template.json` (creates the `lms` project + `lms_db`), run
`.template/schema.sql`, then publish all endpoints to sandbox.

## Scripts

```bash
npm install
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # production build
npm run preview  # preview the production build
```
