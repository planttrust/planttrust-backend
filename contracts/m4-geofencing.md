# Contract: m4-geofencing

**Owner:** Yasuri · **Last updated:** 2026-11-19

## Exported functions (for other modules)

Other modules import these only from `src/modules/m4-geofencing/m4.service.ts`.

### `projectService.listOpen(): Promise<ProjectSummary[]>`

- **What it does:** projects that are open for investment.
- **Called by:** M2 (marketplace), M3 (assistant)
- **Status:** stub (empty list) until M4 saves registered projects in Sprint 1.
- **Returns:** `{ id, companyId, title, location, fundingGoal, status: 'draft' | 'open' | 'funded' | 'completed' }[]`

### `projectService.getById(projectId: string): Promise<ProjectSummary | null>`

- **What it does:** one project, or `null` if it doesn't exist.
- **Called by:** M2, M3
- **Status:** stub (returns a demo project for any id).
- **Returns:** same shape as one item of `listOpen`.

## HTTP routes (for the frontend)

Base path: `/api/geofencing`

| Method | Path      | Auth / role | Request body | Response             |
| ------ | --------- | ----------- | ------------ | -------------------- |
| GET    | `/health` | none        | –            | `{ module, status }` |

Planned: `POST /projects` (company only), `GET /projects/mine`, `POST /check` (Sprint 1),
`POST /photos/check` (Sprint 2), progress reports (Sprint 3).

## Database tables (owned by this module)

From the ER design (`Diagrams/ER Diagrams`), in `prisma/schema/m4-geofencing.prisma`:
projects, milestones, geofence_areas (Sprint 1, projects merged early in days 1–3); progress_reports, evidence_images, exif_data, geofence_validations (Sprint 2); image_verifications, report_reviews (Sprint 3).
Other modules never read them directly. Naming and cross-module links: see `prisma/schema/base.prisma`.

## Change log

- 2026-11-19: created from the Week 0 scaffold stubs.
