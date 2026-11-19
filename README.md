# planttrust-backend

The API for **PlantTrust**, a platform for blockchain-verified land investment. Companies register land
projects with GPS-checked boundaries, investors fund them through an escrow, progress is verified with
geotagged photos, and every important event is hashed and anchored on the XRPL Testnet so anyone can
check it.

This is a **single modular backend**: one Express app with five modules, one per team member. Modules
talk to each other only through each other's exported service functions.

## Tech stack

Node.js 24 · TypeScript · Express 5 · PostgreSQL 17 (Docker) · Prisma 6 · zod · Vitest + Supertest ·
ESLint + Prettier · XRPL Testnet (from Sprint 2)

## Quick start

You need Node.js 24, Docker Desktop and Git. In PowerShell:

```powershell
Copy-Item .env.example .env   # your local settings (never committed)
docker compose up -d          # starts PostgreSQL on localhost:5433
npm install
npm run db:migrate            # applies the database migrations
npm run dev                   # API on http://localhost:4000
```

Check it works: open <http://localhost:4000/api/health>.

## npm scripts

| Script                                    | What it does                                               |
| ----------------------------------------- | ---------------------------------------------------------- |
| `npm run dev`                             | Starts the API and restarts it when you save a file        |
| `npm test` / `npm run test:watch`         | Runs the tests once / keeps re-running them while you work |
| `npm run lint`                            | Checks the code, including the module-boundary rule        |
| `npm run typecheck`                       | Checks all TypeScript types                                |
| `npm run format` / `npm run format:check` | Formats the code / checks the formatting                   |
| `npm run build` / `npm start`             | Compiles to `dist/` / runs the compiled server             |
| `npm run db:migrate`                      | Applies schema changes and creates a migration             |
| `npm run db:seed`                         | Fills the database with demo data                          |
| `npm run db:studio`                       | Opens a browser view of the database                       |

To run the API in Docker too (for the demo): `docker compose --profile full up --build`.

## Project structure

```text
src/
├── app.ts             builds the Express app and mounts the five modules
├── server.ts          starts the server
├── config/env.ts      reads and checks the settings in .env
├── shared/            auth (JWT, roles), errors, uploads, Prisma client, XRPL client
└── modules/           one folder per module: mX.routes.ts · mX.service.ts · mX.test.ts
prisma/
├── schema/            base.prisma + one .prisma file per module
├── migrations/        created by npm run db:migrate (committed)
└── seed.ts            demo data
contracts/             each module's exported functions and HTTP routes
```

| Module                                  | Owner   | API prefix         |
| --------------------------------------- | ------- | ------------------ |
| M1 User Management & Corporate Registry | Nimsara | `/api/users`       |
| M2 Investor Marketplace & Escrow        | Thilina | `/api/marketplace` |
| M3 MCP AI & Scam Detection              | Imesha  | `/api/mcp-ai`      |
| M4 Company Portal & Geofencing          | Yasuri  | `/api/geofencing`  |
| M5 Blockchain Audit & Trust Index       | Mirath  | `/api/audit`       |

## Working on the project

- How we work (branches, PRs, ClickUp IDs, team rules): [CONTRIBUTING.md](CONTRIBUTING.md)
- What each module provides: [contracts/](contracts/)
- Plan and progress: [GitHub project board](https://github.com/orgs/planttrust/projects/1) and the ClickUp
  folder "PlantTrust Sprints (23 Nov – 31 Jan)"
- Frontend: [planttrust-frontend](https://github.com/planttrust/planttrust-frontend)

## Notes

- **Database port 5433:** the Docker database is exposed on `localhost:5433`, not the usual 5432, so it
  doesn't clash with a PostgreSQL already installed on your computer.
- **Known advisory:** `npm audit` reports `deepmerge-ts` (GHSA-ggr8-5vv4-36mx) through Prisma 6's
  command-line tool. It only processes our own `prisma.config.ts`, never request data, so the risk is low.
  The fix needs Prisma 7, which we'll revisit after the project.
