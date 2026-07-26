# School ERP & School Website Platform

A commercial-grade, single-school ERP and public website platform. Each installation serves one school, uses its own PostgreSQL database, and is independently deployable.

## Technology stack

- Frontend: Vite, React, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form, and Zod
- Backend: Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Helmet, CORS, Multer, Winston, and Zod
- Tooling: npm workspaces, ESLint, Prettier, Vitest, and Supertest

## Prerequisites

- Node.js 22 LTS or later
- npm 10 or later
- PostgreSQL 16 or later

## Local setup

1. Copy the environment templates:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```

2. Set secure values and the local PostgreSQL connection string in `backend/.env`.
3. Install dependencies with `npm install`.
4. Generate the Prisma client with `npm run prisma:generate --workspace @school-erp/backend`.
5. Create and apply the first migration with `npm run prisma:migrate --workspace @school-erp/backend -- --name initial-foundation`.
6. Start both applications with `npm run dev`.

The frontend is served by Vite at `http://localhost:5173`. The API listens on the configured `PORT` and exposes `GET /api/v1/health`.

## Workspace commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the frontend and backend concurrently |
| `npm run build` | Build every workspace |
| `npm run lint` | Lint every workspace |
| `npm run typecheck` | Type-check every workspace |
| `npm run test` | Run all automated tests |
| `npm run format:check` | Verify Prettier formatting |

## Project structure

- `frontend/` — React single-page application.
- `backend/` — versioned Express REST API and Prisma integration.
- `database/` — migration, backup, restore, and schema operational assets.
- `deployment/` — deployment-specific runtime configuration.
- `scripts/` — repeatable operational scripts.
- `tests/` — cross-workspace unit, integration, and end-to-end tests.
- `assets/` — version-controlled design and document assets, excluding runtime uploads.
- `docs/` — governing product, architecture, security, and engineering documentation.

## Scope of this initialization

This foundation intentionally contains no authentication workflows and no school business modules. It establishes the production-ready structure, standards, database foundation, API conventions, observability, validation, and health monitoring required before those phases begin.
