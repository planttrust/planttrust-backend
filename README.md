# PlanTrust — Backend

A blockchain-based land investment platform built on the XRPL Testnet. PlanTrust lets companies register verified land/project records, investors fund projects through an escrow-backed marketplace, AI systems flag risk and scam patterns, and every key event is hashed and anchored on-chain for auditability.

> **Two-repo architecture:** This repository contains the **backend** (all 5 module APIs, shared utilities, contracts, docs). The **frontend** (Next.js) lives in a separate repository: [`planttrust-frontend`](https://github.com/planttrust/planttrust-frontend).

## Modules

The system is split into five modules, each owned by one team member who spans **all five layers** (Frontend, Backend, Database, AI, Blockchain) for that module. The division below reflects rebalancing to close the earlier gap where Module 5 held disproportionate blockchain depth and Module 2's AI was limited to pure consumption.

| Folder | Module | Owner | Key AI Feature | Key Blockchain Feature |
|---|---|---|---|---|
| `src/module-1-user-management/` | User Management & Corporate Registry | _Nimsara Karunarathna_ | OCR + confidence scoring + vision fallback | Certificate verification lookup |
| `src/module-2-marketplace/` | Investor Marketplace & Investment Lifecycle | _Thilina Dasun_ | Investment-pattern anomaly detector | XRPL NFT minting for investor tokens |
| `src/module-3-mcp-ai/` | MCP-Driven Explainable AI & Chatbot | _Imesha Ariyawansha_ | Scam classifier + CBSL rule engine | Audit log retrieval w/ proof-of-inclusion |
| `src/module-4-geofencing/` | Company Portal & Proof-of-Reality (Geofencing) | _Yasuri Pradeepika_ | dHash duplicate-detection + anti-spoofing | Milestone timeline w/ inclusion-proof badges |
| `src/module-5-blockchain/` | Blockchain Auditing & Regulatory Dashboard | _Mirath Nimsara_ | Digital Trust Index (weighted composite) | Core Merkle + XRPL pipeline |

See `contracts/` for inter-module API specs and `src/database/init.sql` for the unified database schema.

## Workload Balance Across Layers

Each layer is scored 1–5 for relative effort (5 = hardest). Totals are within a one-point spread (16–17), indicating close-to-equal overall workload despite each module having a different profile.

| Module | Frontend | Backend | Database | AI | Blockchain | **Total** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| M1 — User Management | 3 | 4 | 2 | 5 | 2 | **16** |
| M2 — Marketplace | 3 | 5 | 3 | 2 | 4 | **17** |
| M3 — MCP AI | 2 | 5 | 3 | 4 | 2 | **16** |
| M4 — Geofencing | 4 | 2 | 3 | 4 | 3 | **16** |
| M5 — Blockchain Audit | 3 | 4 | 3 | 2 | 5 | **17** |

## Repository Layout

```
planttrust-backend/               # Unified Modular Backend
├── server.js                     # Unified Express server & route aggregator (port 3000)
├── src/
│   ├── module-1-user-management/ # Module 1: Auth, documents, trust certificates
│   ├── module-2-marketplace/     # Module 2: Escrow, project listings, P2P transfers
│   ├── module-3-mcp-ai/          # Module 3: Model Context Protocol (MCP), chatbot, scam detection
│   ├── module-4-geofencing/      # Module 4: Polygon geofence, camera proof, progress reports
│   ├── module-5-blockchain/      # Module 5: XRPL anchoring, Trust Index, proof verification
│   ├── shared/                   # Shared utilities: DB pool, auth middleware, logger, hashing
│   ├── database/                 # Unified PostgreSQL schema (init.sql) and migration runner
│   ├── contracts/                # Inter-module contract references
│   └── jobs/                     # Background job processors (XRPL anchoring, OCR, AI)
├── contracts/                    # API specifications between modules (*.md)
├── docs/                         # Full project proposal and architectural documentation
├── tests/                        # Unified Jest test suite
├── .github/
│   ├── CODEOWNERS                # Automated PR reviewer assignments
│   └── workflows/ci.yml          # CI: Unit tests + Docker smoke tests
├── docker-compose.yml            # Spins up Backend + Frontend (GHCR) + Postgres + Redis
├── Dockerfile                    # Container definition for unified backend
├── .env.example                  # Environment configuration template
├── package.json                  # Unified dependencies & scripts
└── README.md
```

Frontend repo (separate):
```
planttrust-frontend/              # Frontend repo (Next.js)
├── src/app/                      # Next.js app router pages
├── src/components/               # Shared UI components
├── src/lib/                      # API client configuration
└── package.json
```

## Getting the System Running Locally

### Option 1: Docker Compose (recommended)

```bash
# Start backend, database (Postgres 16), and cache (Redis 7)
docker-compose up -d db redis backend

# Or start the complete stack including the frontend
docker-compose up
```

### Option 2: Run directly with Node.js

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy example)
cp .env.example .env

# 3. Initialize database schema (ensure Postgres is running)
npm run db:init

# 4. Start development server
npm run dev

# 5. Run tests
npm test
```

### Service Endpoints

| Service | Port | Health Check / Base URL |
|---|---|---|
| **Backend API** | `3000` | `http://localhost:3000/health` |
| **Frontend** | `3001` (Docker) / `3000` (local) | `http://localhost:3000` |
| **PostgreSQL** | `5432` | `localhost:5432` |
| **Redis** | `6379` | `localhost:6379` |

## Branching Model

- `main` — always stable, demo-ready. Protected: no direct pushes, PR + review required.
- `develop` — the shared integration baseline. Protected: PR + at least one review required.
- `feature/<module>/<ticket-name>` — one branch per GitHub issue, opened against `develop`.

See `CONTRIBUTING.md` for the full workflow, including the weekly integration ritual, mocking rules, and how contracts work.

## Contracts

Before building a call into another module, check `contracts/` for that module's interface spec (or add one using `contracts/TEMPLATE.md` and get sign-off from that module's owner before building against it).

## 14-Week Checkpoint Schedule

Seven two-week checkpoints. Checkpoint 6 (weeks 11–12) is the marquee integration point: report approval auto-releases escrow, AI-risk-checked, audited, and reflected in the live Trust Index.

| CP | Weeks | M1 User Mgmt | M2 Marketplace | M3 AI/MCP | M4 Geofencing | M5 Blockchain |
|:---:|:---:|---|---|---|---|---|
| **1** | 1–2 | All schemas; registration/login working | Escrow schema design | MCP skeleton; scam-URL schema | Projects/reports schema | Audit schema; stub log function |
| **2** | 3–4 | OCR + HITL + cert issuance triggers real hashing | Escrow COMMITTED logic (unit-tested) | Scam-typology matcher (standalone) | EXIF extraction pipeline (standalone) | Real hashing triggered by M1 certs |
| **3** | 5–6 | Admin UI polish | Marketplace UI reads real M1 data | Chatbot shell (stubbed MCP) | Map/polygon UI + project registration | Hashing extended to P2P schema |
| **4** | 7–8 | Admin dashboard view | Real escrow funding flow (hashed + logged) | First live MCP query tool | Camera capture; anomaly detector v1 | Hash new investments |
| **5** | 9–10 | HITL polish | LOCKED→RELEASED escrow endpoint | Rule engine live on real contracts | Geofence validation + report submission | NFT Minting Service wired to XRPL |
| **6** | 11–12 | — | **Marquee**: report approval auto-releases escrow | AI risk-check on release flow | Report approval triggers release call | Trust Index live on real data |
| **7** | 13–14 | Final polish | P2P purchase flow; feature freeze | Chatbot polish; Audit Log Retrieval | dHash; anti-spoofing; Milestone Timeline | Proof-verification endpoint; feature freeze |

Any hardening, adversarial testing, and demo preparation should be scheduled after week 14.

## Contribution Tracking

- Each module is broken into **18 GitHub issues** (see `docs/PROPOSAL.md` Section 9), so progress is countable, not self-reported.
- Each member reports issues closed at every two-week checkpoint meeting.
- Presentation and live demo at the final review are split by module, with each member presenting their own work.
- If any module falls under ~50% of issues closed by Checkpoint 3, this is flagged to the supervisor immediately.

## Mentor Access

The team's mentor/supervisor has Admin access to this repository for oversight and review. See `MENTOR.md` for details on the scope of that access.
