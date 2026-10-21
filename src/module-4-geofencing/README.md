# Module 4 — Company Portal & Proof-of-Reality (Geofencing)

**Owner:** Yasuri Pradeepika  
**Base Route:** `/api/projects`, `/api/reports`, `/api/geofence`

---

## 1. Responsibilities

- **Polygon Geofencing Engine:** Ray-casting point-in-polygon algorithm to validate milestone photo capture coordinates.
- **EXIF Extraction & Anti-Spoofing:** Parsing GPS metadata, camera hardware stamps, and detecting fraudulent or manipulated image metadata.
- **Perceptual Hashing (dHash):** Near-duplicate image detection to prevent companies from submitting identical progress photos across multiple milestones.
- **Milestone Timeline:** Verified chronological progress reports with cryptographic inclusion-proof badges.
- **Automated Escrow Release Trigger:** When milestone reports are validated and approved, triggers Module 2's escrow release API.

---

## 2. Directory Structure

```
module-4-geofencing/
├── routes/
│   ├── projects.js        # POST /register, GET /:id/boundaries
│   ├── reports.js         # POST /submit, GET /:projectId, PUT /:id/review
│   └── geofence.js        # POST /validate-point, GET /verify-polygon
├── controllers/           # HTTP controllers
├── services/              # Geofence math, EXIF parser, dHash service
└── README.md
```

---

## 3. Database Tables (see `src/database/init.sql`)

- `geofence_projects` (UUID id, company_id, project_id, name, polygon_coordinates JSONB)
- `progress_reports` (UUID id, project_id, company_id, milestone_index, image_url, exif_lat, exif_lng, is_geofence_valid, dhash, status)

---

## 4. Inter-Module Contracts

- Calls Module 2 `POST /api/escrow/release` upon milestone report approval to trigger release of funds.
- Calls Module 5 `POST /api/audit/anchor` to anchor approved progress report hashes on XRPL.
