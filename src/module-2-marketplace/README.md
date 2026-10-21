# Module 2 — Investor Marketplace & Investment Lifecycle

**Owner:** Thilina Dasun  
**Base Route:** `/api/escrow`, `/api/listings`, `/api/transfers`

---

## 1. Responsibilities

- **Project Listings:** Verified projects available for investment with risk-based sorting/filtering.
- **Escrow State Machine:** Strict transitions (`CREATED` → `FUNDED` → `LOCKED` → `RELEASED` / `REFUNDED`).
- **P2P Transfer Market:** Secondary market for verified investor shares/tokens with atomic transfer semantics.
- **AI Anomaly Detector:** Anomaly detection flagging unusual funding velocity or concentration.
- **Blockchain Integration:** Ownership-record hashing and XRPL NFT minting for investor stakes.

---

## 2. Directory Structure

```
module-2-marketplace/
├── routes/
│   ├── listings.js        # GET /, GET /:id, POST /
│   ├── escrow.js          # POST /fund, POST /release, GET /:id
│   └── transfers.js       # POST /create, POST /execute, GET /
├── controllers/           # HTTP controllers
├── services/              # Escrow state machine, listings, anomaly detection
└── README.md
```

---

## 3. Database Tables (see `src/database/init.sql`)

- `projects` (UUID id, company_id, title, target_amount, funded_amount, status, risk_level)
- `escrow_records` (UUID id, project_id, investor_id, amount, status, xrpl_tx_hash, nft_token_id)
- `p2p_transfers` (UUID id, seller_id, buyer_id, escrow_id, amount, price, status)

---

## 4. Inter-Module Contracts

- Exposes `POST /api/escrow/release` called by Module 4 when milestone reports are approved.
- Calls Module 5 `POST /api/audit/anchor` when funds are committed or released.
- Calls Module 5 `POST /api/audit/mint` to mint an XRPL NFT representing the investment.
