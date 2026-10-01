# Module 5 — Blockchain Auditing & Regulatory Dashboard

**Owner:** Mirath Nimsara

## Scope

This module is the shared blockchain backbone and the regulatory-facing dashboard. Every other module's hashes flow through here for on-chain anchoring, and this module computes the cross-module Trust Index.

### Frontend
- Regulatory dashboard (admin/regulator view of all audit activity)
- Trust Index visualization (per-project score breakdown, trend charts)
- Scam flags and risk rankings display (aggregated from Module 3's flags + Module 2's anomaly detector)
- Audit trail explorer (search by project, module, date range, event type)

### Backend
- Shared XRPL signing utility (wallet management, nonce handling, retry logic with backoff)
- Merkle tree construction (batch hashes from all modules into periodic Merkle roots)
- Proof-verification endpoint (given an event hash, return the Merkle proof + on-chain tx confirming inclusion)
- Anchor API (`POST /api/audit/anchor` — the endpoint every other module calls)

### Database
- `audit_trail` table (source module, event type, data hash, Merkle root, XRPL tx hash, timestamp)
- `trust_index_components` table (per-project scores from each signal source)
- Cross-module aggregation queries (joins against other modules' state for dashboard views)

### AI
- Digital Trust Index: weighted composite score combining signals from all 4 other modules:
  - Module 1: document verification confidence
  - Module 2: escrow completion rate + anomaly flags
  - Module 3: compliance score + scam-flag count
  - Module 4: geofence pass rate + anti-spoofing results

### Blockchain
- The core Merkle + XRPL pipeline: batch collection → tree construction → root submission → proof generation
- XRPL Testnet integration (XRP Ledger transaction submission and confirmation polling)
- Proof-of-inclusion generation for any historical event

## Local Development

```bash
cd module-5-blockchain-audit
npm install
npm run dev
```

Or from the repo root:
```bash
docker-compose up module-5
```

## API Contracts

See `contracts/module-5-blockchain-audit.md` for the endpoints this module exposes to others.
