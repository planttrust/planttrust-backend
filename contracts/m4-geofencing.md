# Contract: m4-geofencing

**Owner:** Yasuri · **Last updated:** 2026-11-23

## Exported functions (for other modules)

Other modules import these only from `src/modules/m4-geofencing/m4.service.ts`.

```ts
interface ProjectSummary {
  id: string;
  companyId: string; // M1 user id of the company that registered it
  title: string;
  location: string; // human-readable place, e.g. "Nuwara Eliya"
  fundingGoal: number; // LKR
  status: 'draft' | 'open' | 'funded' | 'completed';
}
```

### `projectService.listOpen(): Promise<ProjectSummary[]>`

- **What it does:** projects that are open for investment, newest first.
- **Called by:** M2 (marketplace), M3 (assistant)
- **Status:** stub (empty list). Real from Sprint 1, reading the `projects` table.
- **Returns:** `ProjectSummary[]`

### `projectService.getById(projectId: string): Promise<ProjectSummary | null>`

- **What it does:** one project, or `null` if it doesn't exist.
- **Called by:** M2, M3
- **Status:** stub (returns a demo project for any id). Real from Sprint 1.
- **Returns:** `ProjectSummary | null`

## HTTP routes (for the frontend)

Base path: `/api/geofencing`

| Method | Path             | Auth / role                             | Request body              | Response                         |
| ------ | ---------------- | --------------------------------------- | ------------------------- | -------------------------------- |
| GET    | `/health`        | none                                    | –                         | `{ module, status }`             |
| POST   | `/projects`      | `requireAuth`, `requireRole('company')` | `RegisterProjectInput`    | `201` `ProjectDetail`            |
| GET    | `/projects/mine` | `requireAuth`, `requireRole('company')` | –                         | `ProjectDetail[]` (newest first) |
| POST   | `/check`         | `requireAuth` (any role)                | `{ projectId, lat, lng }` | `{ projectId, inside }`          |

Planned: `POST /photos/check` (Sprint 2), progress reports (Sprint 3).

### Shared types

```ts
interface LatLng {
  lat: number; // -90 … 90
  lng: number; // -180 … 180
}

interface Milestone {
  title: string;
  targetDate: string; // ISO date, e.g. "2027-03-31"
  description?: string;
}

interface ProjectDocument {
  name: string; // e.g. "Land deed"
  url: string; // from the shared upload helper
}
```

### `POST /projects`: register a project

`RegisterProjectInput` follows the six steps of the Register project screen:

```ts
interface RegisterProjectInput {
  // 1. Project & photo
  title: string; // 3–120 chars
  description: string; // up to 5000 chars
  cropType: string; // e.g. "Tea", "Cinnamon", "Coconut"
  photoUrl?: string;
  // 2. Land & location
  location: string; // town or estate name
  district: string; // one of Sri Lanka's 25 districts
  boundary: LatLng[]; // the land polygon drawn on the map (rules below)
  // 3. Documents
  documents: ProjectDocument[]; // may be empty in Sprint 1
  // 4. Funding & terms
  fundingGoal: number; // LKR, > 0
  expectedReturnPct: number; // 0–100
  durationMonths: number; // whole months, 1–360
  // 5. Milestones & risks
  milestones: Milestone[];
  risks: string;
  // 6. Review
  status?: 'draft' | 'open'; // default 'open' (no admin approval step in Sprint 1)
}
```

**Boundary rules** (otherwise `400 VALIDATION_ERROR`):

- every point has a valid `lat` (-90 … 90) and `lng` (-180 … 180);
- the ring is **closed**: the last point equals the first;
- at least **3 distinct points** (so at least 4 entries including the closing point).

What happens:

1. The company is checked with `userService.getVerified(companyId)`; if `null` → `403 FORBIDDEN`.
2. The project and its polygon are saved together. The server works out `areaHectares` and the
   centroid from the boundary.
3. `auditService.anchor('PROJECT_REGISTERED', projectId, { companyId, title, fundingGoal, boundary })`
   is called and the returned `anchorId` is stored on the project.

```ts
interface ProjectDetail extends ProjectSummary {
  description: string;
  cropType: string;
  photoUrl: string | null;
  district: string;
  boundary: LatLng[]; // closed ring, as saved
  centroid: LatLng; // for centring the map
  areaHectares: number;
  documents: ProjectDocument[];
  expectedReturnPct: number;
  durationMonths: number;
  milestones: Milestone[];
  risks: string;
  anchorId: string | null; // M5 receipt for PROJECT_REGISTERED
  createdAt: string; // ISO date-time
}
```

### `POST /check`: is a point inside a project's land?

- Body: `{ projectId: string, lat: number, lng: number }`
- Uses a ray-casting point-in-polygon test against the saved boundary. A point exactly on the edge
  counts as inside.
- `200 { projectId, inside: boolean }`, `400` for invalid coordinates, `404` if the project doesn't exist.

### Errors

All errors use the shared shape `{ error: { code, message, details? } }`:
`400 VALIDATION_ERROR` / `BAD_REQUEST`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

## Database tables (owned by this module)

Defined in `prisma/schema/m4-geofencing.prisma`. Other modules never read them directly.

| Model            | Table              | Notes                                                          |
| ---------------- | ------------------ | -------------------------------------------------------------- |
| `Project`        | `projects`         | `companyId` is a plain M1 id (indexed, no relation)            |
| `ProjectPolygon` | `project_polygons` | one per project: boundary points, centroid, bounding box, area |
| `ProgressReport` | `progress_reports` | used from Sprint 3; geotagged photo + `insideBoundary` result  |

Enums: `ProjectStatus` (`draft`, `open`, `funded`, `completed`), `ReportStatus` (`pending`, `verified`,
`rejected`, `flagged`).

## Change log

- 2026-11-19: created from the Week 0 scaffold stubs.
- 2026-11-23: Sprint 1 routes (`POST /projects`, `GET /projects/mine`, `POST /check`), request and
  response shapes, and the M4 tables.
