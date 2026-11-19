# Contract: m2-marketplace

**Owner:** Thilina · **Last updated:** 2026-11-19

## Exported functions (for other modules)

Other modules import these only from `src/modules/m2-marketplace/m2.service.ts`.

### `listingService.list(): Promise<Listing[]>`

- **What it does:** the open projects shown in the marketplace.
- **Called by:** M3 (assistant tools)
- **Status:** stub (empty list) until M2 reads projects through `projectService` (M4) in Sprint 1.
- **Returns:** `{ projectId, title, location, fundingGoal, fundedAmount, status: 'open' | 'fully_funded' | 'closed' }[]`

### `escrowService.release(projectId: string, reportId: string): Promise<EscrowReleaseResult>`

- **What it does:** releases escrowed money for a project after M4 approves a progress report.
  Calls `scamService.riskCheck` (M3) first and blocks on high risk.
- **Called by:** M4
- **Status:** stub (always `RELEASED`, amount 0) until Sprint 3.
- **Returns:** `{ projectId, reportId, status: 'RELEASED' | 'BLOCKED', amount }`

## HTTP routes (for the frontend)

Base path: `/api/marketplace`

| Method | Path      | Auth / role | Request body | Response             |
| ------ | --------- | ----------- | ------------ | -------------------- |
| GET    | `/health` | none        | –            | `{ module, status }` |

Planned: `GET /listings`, `GET /listings/:projectId` (Sprint 1), `POST /fund` (Sprint 2, investor only,
investor id taken from the login token), `GET /escrow/:projectId/history` (Sprint 3).

## Database tables (owned by this module)

To be added in Sprint 1 in `prisma/schema/m2-marketplace.prisma`: investments, escrow records,
escrow state transitions, P2P transfers.

## Change log

- 2026-11-19: created from the Week 0 scaffold stubs.
