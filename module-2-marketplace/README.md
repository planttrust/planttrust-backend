# Module 2 — Investor Marketplace & Investment Lifecycle

**Owner:** Thilina Dasun

## Scope

This module handles the investor-facing marketplace, the full escrow lifecycle, P2P transfers, and NFT minting for investor stakes.

### Frontend
- Marketplace dashboard (browse verified projects, filter by risk/region/return)
- Funding flow UI (invest → escrow lock → progress tracking → release/refund)
- P2P transfer listing and execution interface
- Risk-based ranking and filtering powered by Module 5's Trust Index

### Backend
- Project listing API (reads verified companies from Module 1)
- Full escrow state machine: `CREATED → FUNDED → LOCKED → RELEASED → SETTLED`
- P2P transfer API (ownership transfer between investors, with audit trail)
- Escrow release/refund triggers (called by Module 4's report-approval flow)

### Database
- `investments` table (investor ↔ project link, amount, state)
- `escrow_ledger` table (state transitions with timestamps)
- `p2p_transfers` table (seller, buyer, amount, transfer hash)
- State-transition audit log (every escrow change is logged)

### AI
- Risk-ranking using Module 5's Trust Index scores
- Investment-pattern anomaly detector: flags unusual funding velocity, concentration in single projects, or patterns matching known scam typologies

### Blockchain
- Ownership-record hashing on every escrow state transition
- Full XRPL NFT minting for investor stakes (NFTokenMint on funding, NFTokenBurn on full settlement or refund)

## Local Development

```bash
cd module-2-marketplace
npm install
npm run dev
```

Or from the repo root:
```bash
docker-compose up module-2
```

## API Contracts

See `contracts/module-2-marketplace.md` for the endpoints this module exposes to others.
