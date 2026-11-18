# Contributing to planttrust-backend

PlantTrust is built by five people, and each person owns one module. This guide covers setting up, the workflow for every task, and the team rules. The frontend repo has the same guide with frontend setup steps: [planttrust-frontend/CONTRIBUTING.md](https://github.com/planttrust/planttrust-frontend/blob/develop/CONTRIBUTING.md).

## Modules and owners

| Module | Owner | Backend folder | Prisma file |
|---|---|---|---|
| M1 User Management & Corporate Registry | Nimsara | `src/modules/m1-users/` | `prisma/schema/m1-users.prisma` |
| M2 Investor Marketplace & Escrow | Thilina | `src/modules/m2-marketplace/` | `prisma/schema/m2-marketplace.prisma` |
| M3 MCP AI & Scam Detection | Imesha | `src/modules/m3-mcp-ai/` | `prisma/schema/m3-mcp-ai.prisma` |
| M4 Company Portal & Geofencing | Yasuri | `src/modules/m4-geofencing/` | `prisma/schema/m4-geofencing.prisma` |
| M5 Blockchain Audit & Trust Index | Mirath | `src/modules/m5-audit/` | `prisma/schema/m5-audit.prisma` |

`src/shared/` (database client, auth, XRPL client, error handling) is shared infrastructure. Changes to it go through the team leader.

## How the backend is organised

This is a **single backend**, not microservices. Each module folder contains:

- `mX.routes.ts`: the HTTP routes the frontend calls, mounted at `/api/<module>`
- `mX.service.ts`: the **only** file other modules may import
- `mX.test.ts`: Jest tests for the module

To use another module, call its exported service function (for example `projectService.getById()` or `auditService.anchor()`). Never query another module's tables. If the function isn't ready yet, call its stub. The stub already has the final signature, so your code won't need to change later.

Each module documents its routes and exported functions in `contracts/mX-*.md`. Update your contract **before** you change a route or a function signature.

## One-time setup

1. Install Git, Node.js 20 LTS, Docker Desktop and VS Code.
2. Accept the GitHub invitation to the `planttrust` organisation, and check you can open the ClickUp folder "PlantTrust Sprints".
3. Clone and start the backend (PowerShell):

```powershell
git clone https://github.com/planttrust/planttrust-backend
cd planttrust-backend
Copy-Item .env.example .env
docker compose up -d
npm install
npx prisma migrate dev
npm run dev
```

4. Run the tests with `npm test`.

## Workflow for every task

1. **Pick the task.** Open your sprint task in ClickUp and set it to **in progress**. Its ID is the last part of the URL: `https://app.clickup.com/t/z8q7hbv36c` → `z8q7hbv36c`.
2. **Branch from the latest `develop`**, with the ClickUp ID in the branch name:

   ```powershell
   git checkout develop
   git pull
   git checkout -b feature/m2/s1-project-listing-CU-z8q7hbv36c
   ```

3. **Contract first, then code.** Update `contracts/mX-*.md`, then work only in your own module folder and your own `.prisma` file.
4. **Commit and push often**, with the ClickUp ID in the message, e.g. `Add listings route CU-z8q7hbv36c`.
5. **Open a pull request into `develop`:**
   - Title: `[S1·M2] Project listing CU-z8q7hbv36c`
   - Body: `Closes #3` (your GitHub issue number), so the issue closes when the PR merges.
6. **Review and merge.** One teammate approves, CI passes, and then you merge.

The `CU-…` ID makes your branch, commits and PR show up on the ClickUp task. When **both** your backend and frontend issues are closed, the ClickUp task is set to **complete** automatically (`.github/workflows/clickup-sync.yml`). Reopening an issue moves the task back to **in progress**.

## Team rules

- Never edit another person's module. If you need something from it, ask the owner to export a function.
- Only change your own `.prisma` file. If migrations conflict, pull `develop` and run `npx prisma migrate dev` again.
- Never push directly to `main` or `develop`. The repository rules block it, and every change needs a PR with one approval.
- Review your teammates' PRs within a day, because everyone is blocked without an approval.
- Add tests for every route and every exported service function.
- Never commit `.env` files, API keys or wallet seeds.

## End of each sprint

1. Merge the open PRs in this order: M1 → M2 / M4 → M3 → M5.
2. Run the combined demo described in the sprint's ClickUp tasks.
3. Merge `develop` → `main` in both repos, and tag both with the same tag (`s1`, `s2`, …).

## Sprint calendar

| | Dates |
|---|---|
| Week 0 (setup) | 18 – 22 Nov |
| Sprint 1 | 23 Nov – 6 Dec |
| Sprint 2 | 7 – 20 Dec |
| Sprint 3 | 21 Dec – 3 Jan |
| Sprint 4 | 4 – 17 Jan |
| Sprint 5 | 18 – 31 Jan (feature freeze 28 Jan) |

Plan and progress: [GitHub project board](https://github.com/orgs/planttrust/projects/1) · ClickUp folder "PlantTrust Sprints (23 Nov – 31 Jan)".
