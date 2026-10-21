# Module 5 — Blockchain Auditing & Regulatory Dashboard

**Owner:** Mirath Nimsara  
**Base Route:** `/api/audit`, `/api/trust-index`, `/api/verify`

---

## 1. Responsibilities

- **XRPL Testnet Pipeline:** Signing transactions, managing nonces, handling retries, and anchoring batch Merkle roots onto the XRP Ledger.
- **Merkle Tree Construction:** Batching event hashes from Modules 1–4 into Merkle trees and generating proofs of inclusion.
- **Digital Trust Index:** Composite weighted-scoring algorithm calculating real-time trustworthiness scores (0–100) combining KYC compliance (M1), escrow history (M2), scam reports (M3), and milestone delivery (M4).
- **Public Verification & Proofs:** Cryptographic validation endpoints allowing任何人 to confirm any event hash is immutably anchored on-chain.
- **Regulatory Dashboard:** Live visual audit log and compliance monitor for regulators.

---

## 2. Directory Structure

```
module-5-blockchain/
├── routes/
│   ├── audit.js           # POST /anchor, POST /mint, GET /trail
│   ├── trust-index.js     # GET /:companyId, POST /calculate
│   └── verify.js          # GET /:hash, POST /merkle-proof
├── controllers/           # HTTP controllers
├── services/              # XRPL client, Merkle tree builder, Trust Index engine
└── README.md
```

---

## 3. Database Tables (see `src/database/init.sql`)

- `audit_trail` (UUID id, source_module, event_type, entity_id, data_hash, merkle_root, xrpl_tx_hash, status, timestamp)
- `trust_index` (UUID id, company_id, score, components JSONB, calculated_at)

---

## 4. Inter-Module Contracts

- Exposes `POST /api/audit/anchor` (called by Modules 1, 2, 3, 4 to anchor event hashes).
- Exposes `POST /api/audit/mint` (called by Module 2 to mint investor NFTs).
- Exposes `GET /api/trust-index/:companyId` (queried by Module 2 and the Frontend).
- Exposes `GET /api/verify/:hash` (queried by public viewers and the chatbot).
