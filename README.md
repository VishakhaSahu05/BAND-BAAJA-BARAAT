# Band Baaja Baaraat

Band Baaja Baaraat is a wedding planning and celebration management application. It is built as a modular monolith with a separate React frontend and Express REST API backend.

## Architecture

```text
React + Vite frontend
        ↓
Express REST API (/api/v1)
        ↓
Zod validation
        ↓
Services
        ↓
Repositories
        ↓
Mongoose
        ↓
MongoDB Atlas
```

The wedding is the tenant boundary: private wedding-owned resources must be isolated by the authenticated wedding membership. Authentication will use email/password and server-side sessions carried in HTTP-only, Secure, SameSite cookies. The design does not use JWT access or refresh tokens, or localStorage authentication tokens.

Future integrations are kept behind backend adapters:

```text
Backend
  ├── AWS S3 (photo binaries and pre-signed browser uploads)
  ├── Resend (email delivery)
  ├── Google Places (vendor discovery)
  └── YouTube (livestream embedding)
```

These integrations and the authentication flow are not implemented yet.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, TypeScript |
| Backend | Node.js, Express.js, TypeScript |
| API | REST under `/api/v1` |
| Validation | Zod |
| Database | MongoDB Atlas, Mongoose |
| Tooling | ESLint, TypeScript, Vitest |

## Repository structure

```text
frontend/                 React + Vite application
  src/
    app/                  Application shell
    components/           Shared UI components
    features/             Feature areas
    layouts/              Page layouts
    pages/                Route-level pages
    services/             API and external service clients
    hooks/                Shared React hooks
    lib/                  Shared client utilities
    types/                Shared client types
backend/                  Express API application
  src/
    config/               Environment configuration
    db/                   MongoDB connection
    middleware/           Request ID and API error handling
    modules/              Domain module placeholders
    integrations/         Future provider adapters
    utils/                Shared backend utilities
    app.ts                Express application and routes
    server.ts             HTTP server and shutdown handling
docs/                     Product and technical design documents
.gitignore
README.md
```

The backend module layer convention is documented in [docs/architecture.md](docs/architecture.md). The PRD, system design, database design, and REST API design documents are preserved in `docs/`.

## Local development

Use Node.js 22.12 or newer and npm. The frontend and backend are separate npm applications with separate lockfiles; install dependencies in each directory.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Copy `backend/.env.example` to `backend/.env`, then run:

```bash
cd backend
npm install
npm run dev
```

In PowerShell, copy the environment example with `Copy-Item .env.example .env` after changing to `backend/`. `NODE_ENV` and `PORT` are required. `MONGODB_URI` is optional; if it is set, the backend connects once during startup and disconnects during shutdown. No database is needed to run the health endpoint or its test.

The API listens on the configured port (3000 in the example). Its health check is `GET http://localhost:3000/api/v1/health`.

The backend development command uses Node 22's built-in TypeScript type stripping. On Node 22.16 it requires `--experimental-strip-types`, so Node prints an experimental feature warning. The production build compiles with `tsc`.

## Available scripts

Run scripts from the relevant application directory.

| Script | Frontend | Backend |
| --- | --- | --- |
| `npm run dev` | Start Vite | Start the API with file watching |
| `npm run build` | Type-check and build production assets | Compile TypeScript to `dist/` |
| `npm run typecheck` | Check TypeScript without emitting files | Check TypeScript without emitting files |
| `npm run lint` | Lint frontend source | Lint backend source |
| `npm test` | Run frontend tests with Vitest | Run backend tests with Vitest and Supertest |
| `npm start` | — | Start the compiled API |

## Current development status

The repository contains the application shells, environment validation, an optional reusable MongoDB connection, request IDs, a shared API error response, graceful backend shutdown, and minimal frontend/backend tests. The only API route is `GET /api/v1/health`.

There are no domain models or endpoints, authentication or authorization, product features, or active AWS S3, Resend, Google Places, or YouTube integrations yet. Domain and provider directories remain placeholders.
