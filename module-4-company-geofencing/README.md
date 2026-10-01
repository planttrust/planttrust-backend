# Module 4 — Company Portal & Proof-of-Reality (Geofencing)

**Owner:** Yasuri Pradeepika

## Scope

This module handles the company-side portal: project registration with polygon boundaries, on-site proof-of-reality capture, progress report submission, and profit distribution triggers.

### Frontend
- Company dashboard (registered projects, pending reports, approval status)
- Polygon-drawing map UI (draw/edit project boundaries on an interactive map)
- In-app camera capture (geo-tagged photo/video submission from the field)
- Progress report submission form (milestone selection, evidence upload, notes)

### Backend
- EXIF extraction pipeline (parse GPS coordinates, timestamp, device info from uploaded media)
- Ray-casting point-in-polygon engine (validate that captured media location falls within the project boundary)
- Progress report approval/rejection API
- Profit-distribution trigger (on report approval → calls Module 2's escrow release endpoint)

### Database
- `projects` table (project metadata, registration date, status)
- `polygon_coordinates` table (ordered vertex list per project boundary)
- `progress_reports` table (report content, evidence links, approval status, reviewer)
- Spatial indexing on polygon data for efficient geofence checks

### AI
- Perceptual hashing (dHash) for duplicate-detection (flag re-used or recycled progress photos)
- AI Vision anti-spoofing classifier (detect screenshots-of-photos, digitally altered images, GPS spoofing indicators)

### Blockchain
- Progress-report hashing (every submitted + approved report is hashed into Module 5's audit trail)
- Investor-facing Milestone Timeline with inclusion-proof badges (each milestone shows its on-chain Merkle proof so investors can independently verify)

## Local Development

```bash
cd module-4-company-geofencing
npm install
npm run dev
```

Or from the repo root:
```bash
docker-compose up module-4
```

## API Contracts

See `contracts/module-4-company-geofencing.md` for the endpoints this module exposes to others.
