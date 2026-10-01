# Module 1 — User Management & Corporate Registry

**Owner:** Nimsara Karunarathna

## Scope

This module handles all user-facing identity, onboarding, document verification, and trust-certificate issuance.

### Frontend
- Role-based onboarding flows (Investor / Company / Admin)
- Document upload UI with drag-and-drop + progress indicators
- HITL Admin Review Queue (approve/reject/request-more-info)
- Digital Trust Certificate display with QR code

### Backend
- Auth API (register, login, JWT refresh, role guard middleware)
- Document intake API (upload, OCR trigger, status tracking)
- HITL routing/approval API (queue management, decision logging)
- Certificate issuance API (generate, sign, store)

### Database
- `users` table (shared across roles)
- `investors`, `companies`, `admins` role-specific tables
- `documents` table (uploaded files, OCR results, review status)
- `certificates` table (issued certs, linked to company + documents)

### AI
- OCR text extraction from uploaded documents
- Field-extraction parsing (company name, registration number, dates)
- Composite confidence scoring (OCR confidence × field-match score)
- Vision-model fallback for handwritten or degraded deed scans

### Blockchain
- Certificate hashing into Module 5's Merkle batch
- Public "Verify My Certificate" lookup — given a certificate ID or QR scan, prove inclusion in the on-chain Merkle root

## Local Development

```bash
cd module-1-user-management
npm install
npm run dev
```

Or from the repo root:
```bash
docker-compose up module-1
```

## API Contracts

See `contracts/module-1-user-management.md` for the endpoints this module exposes to others.
