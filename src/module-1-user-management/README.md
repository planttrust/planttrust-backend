# Module 1 — User Management & Corporate Registry

**Owner:** Nimsara Karunarathna  
**Base Route:** `/api/auth`, `/api/documents`, `/api/certificates`

---

## 1. Responsibilities

- **Authentication & Roles:** Registration, login, and JWT issuance for `investor`, `company`, `admin`, and `user`.
- **Document Intake & Vision AI:** Document uploading (deeds, corporate registration, tax records) with Vision LLM (Gemini / GPT-4o) intelligent field extraction and confidence scoring.
- **AI Processing:** Field-extraction parsing tree, composite confidence-scoring, vision-model handling for handwritten and complex legal deeds.
- **Human-in-the-Loop (HITL):** Admin review queue routing for low-confidence documents.
- **Trust Certificates:** Issuance of Digital Trust Certificates with SHA-256 data hashing and verification lookup.

---

## 2. Directory Structure

```
module-1-user-management/
├── routes/
│   ├── auth.js            # POST /register, POST /login, GET /
│   ├── documents.js       # POST /upload, GET /:id, GET /
│   └── certificates.js    # POST /issue, GET /:id, GET /:id/verify
├── controllers/           # HTTP request & response handlers
├── services/              # Auth, OCR, Document & Certificate business logic
└── README.md
```

---

## 3. Database Tables (see `src/database/init.sql`)

- `users` (UUID id, name, email, password, role, phone, created_at, updated_at)
- `documents` (UUID id, user_id, document_type, file_path, status, ocr_confidence, extracted_data)
- `certificates` (UUID id, company_id, certificate_number, status, data_hash, xrpl_tx_hash)

---

## 4. Inter-Module Contracts

- Exposes `GET /api/certificates/:id/verify` for public certificate verification.
- Calls Module 5 `POST /api/audit/anchor` upon certificate issuance to record the certificate hash on XRPL.
