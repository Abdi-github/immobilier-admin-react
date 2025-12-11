# Immobilier Admin Panel (React)

Admin dashboard for the Swiss real-estate platform inspired by [immobilier.ch](https://www.immobilier.ch/en/).

## Tech Stack

| Area       | Technology                     |
| ---------- | ------------------------------ |
| Framework  | React 18                       |
| Language   | TypeScript                     |
| Build Tool | Vite                           |
| Styling    | Bootstrap 5 + SCSS             |
| State      | Redux Toolkit + RTK Query      |
| Forms      | React Hook Form + Yup          |
| i18n       | react-i18next (EN, FR, DE, IT) |
| Testing    | Vitest                         |
| Containers | Docker                         |

## Features

- Property management (CRUD, approval workflow)
- Agency management
- User management with RBAC
- Translation management
- Dashboard analytics
- Multi-language support (EN, FR, DE, IT)

## Quick Start

### Prerequisites

- Docker & Docker Compose
- **The API must be running first** (creates the shared Docker network)

### Development (Docker)

```bash
# 1. Start the API first (creates immobilier_network)
cd ../immobilier-api-node
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 2. Start the admin panel
cd ../immobilier-admin-react
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Development (Local)

```bash
npm install
npm run dev
```

### Access

| Service     | URL                          |
| ----------- | ---------------------------- |
| Admin Panel | http://localhost:5174        |
| API         | http://localhost:4003/api/v1 |

## Project Structure

```
src/
├── app/              # Redux store, app component
├── features/         # Feature modules (auth, dashboard, properties, etc.)
├── shared/           # Shared components, hooks, utils, types
├── layouts/          # Admin and Auth layouts
├── routes/           # React Router configuration
├── i18n/             # Internationalization setup
└── styles/           # Global SCSS styles
```

## Environment Variables

Copy `.env.example` to `.env` or use Docker Compose env vars:

```env
VITE_API_BASE_URL=http://localhost:4003/api/v1
VITE_DEFAULT_LANGUAGE=en
```

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run test`    | Run tests                |
| `npm run lint`    | Run ESLint               |
| `npm run format`  | Format code              |

## Networking

This repo joins the `immobilier_network` created by the API repo.

## Related Repos

| Repo                        | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `immobilier-api-node`       | REST API (Node.js/Express) — **must run first** |
| `immobilier-frontend-react` | Public Frontend (React + Tailwind + shadcn/ui)  |

## License

MIT
