# PlanTrust — Full Project Proposal

## 1. Overview

This document consolidates the updated project structure: the five-module division with balanced workload across Frontend, Backend, Database, AI, and Blockchain layers; the revised 14-week checkpoint schedule; the per-module workload scoring used to keep contributions fair across the team; and the GitHub issue list used to track and evidence individual contribution for evaluation.

---

## 2. Module Division

Each of the five modules is owned by one team member and spans all five technical layers, so no member is confined to a single layer and each module can reach a working state independently. The division below reflects the rebalancing done to close the earlier gap where Module 5 held disproportionate blockchain depth and Module 2's AI was limited to pure consumption of another module's output.

### Module 1 — User Management & Corporate Registry

- **Frontend:** Role-based onboarding (Investor / Company / Admin), document upload UI, HITL Admin Review Queue, Digital Trust Certificate + QR display.
- **Backend:** Auth API, document intake API, HITL routing / approval API, certificate issuance API.
- **Database:** Users / Investors / Companies / Admins schema, Documents table, Certificates table.
- **AI:** OCR, custom field-extraction parsing tree, composite confidence-scoring (OCR confidence + field-format rules), vision-model fallback for handwritten deeds.
- **Blockchain:** Certificate hashing into Module 5's Merkle batch, plus a public "Verify My Certificate" lookup where anyone can confirm a certificate's on-chain status live.

### Module 2 — Investor Marketplace & Investment Lifecycle

- **Frontend:** Marketplace dashboard, funding flow, P2P transfer listing, risk-based ranking / filtering UI.
- **Backend:** Project listing API, full escrow state machine (5 states, bypass-prevention), P2P transfer API (atomic transactions).
- **Database:** Investments & Escrow Ledger schema, P2P Transfers table, state-transition audit log.
- **AI:** Risk-based ranking using Module 5's Trust Index, plus an investment-pattern anomaly detector that flags unusual funding velocity / concentration as an early-warning signal.
- **Blockchain:** Ownership-record hashing, plus full XRPL NFT-minting logic for investor tokens.

### Module 3 — MCP-Driven Explainable AI & Chatbot

- **Frontend:** Chatbot interface, scam-monitoring input UI, contract risk-flag display.
- **Backend:** MCP server built from scratch (JSON-RPC bridge, scoped query tools, validation).
- **Database:** Contract Clauses & Risk Flags schema, Chatbot Conversation States, Scam Typologies table.
- **AI:** Rule-based CBSL compliance engine, typology-matching scam classifier, LLM prompts for cross-validation / explanations.
- **Blockchain:** Scam-flag hashing, plus an Audit Log Retrieval feature — a queryable, chronological view of every anchored risk flag with proof-of-inclusion display.

### Module 4 — Company Portal & Proof-of-Reality (Geofencing)

- **Frontend:** Company dashboard, polygon-drawing map UI, in-app camera capture, progress report submission.
- **Backend:** EXIF extraction, ray-casting point-in-polygon engine, profit-distribution trigger (calls Module 2's escrow release).
- **Database:** Projects / polygon-coordinates table, Progress Reports table, spatial indexing.
- **AI:** Perceptual hashing (dHash) duplicate-detection, AI Vision anti-spoofing classifier.
- **Blockchain:** Progress-report hashing, plus the investor-facing Milestone Timeline — a verified chronological history with inclusion-proof badges.

### Module 5 — Blockchain Auditing & Regulatory Dashboard

- **Frontend:** Regulatory dashboard, Trust Index visualization, scam flags / risk rankings display.
- **Backend:** Shared XRPL signing utility (wallet, nonce, retry), Merkle tree construction, proof-verification endpoint.
- **Database:** Audit Trail table, Trust Index components table, cross-module aggregation queries.
- **AI:** Digital Trust Index weighted-scoring algorithm combining signals from all four other modules, scam-flag aggregation.
- **Blockchain:** The core Merkle + XRPL pipeline that every other module's hashes flow through — the deepest blockchain module, but no longer the only one with real blockchain substance.

---

## 3. Workload Balance Across Layers

Each layer within a module is scored 1–5 for relative effort (5 = hardest). The totals are within a one-point spread (16–17), indicating a close-to-equal overall workload per member despite each module having a different profile of heavy and light layers.

| Module | Frontend | Backend | Database | AI | Blockchain | **Total** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| M1 — User Management & Corporate Registry | 3 | 4 | 2 | 5 | 2 | **16** |
| M2 — Investor Marketplace & Investment Lifecycle | 3 | 5 | 3 | 2 | 4 | **17** |
| M3 — MCP-Driven Explainable AI & Chatbot | 2 | 5 | 3 | 4 | 2 | **16** |
| M4 — Company Portal & Proof-of-Reality (Geofencing) | 4 | 2 | 3 | 4 | 3 | **16** |
| M5 — Blockchain Auditing & Regulatory Dashboard | 3 | 4 | 3 | 2 | 5 | **17** |

No module is uniformly heavy or light. Module 1 carries the heaviest AI work (OCR and vision fallback); Module 2 and Module 5 carry the heaviest Backend and Blockchain work respectively; Module 3 combines heavy Backend and AI; Module 4 carries the heaviest Frontend work.

---

## 4. 14-Week Checkpoint Schedule

The original 20–24 week plan is compressed into seven two-week checkpoints so that every checkpoint still produces a working, integrated feature rather than isolated module progress. Checkpoint 6 (weeks 11–12) is the marquee integration point: report approval automatically releases escrow funds, with the release AI-risk-checked, audited, and reflected in the live Trust Index.

| CP | Weeks | M1 User Mgmt | M2 Marketplace | M3 AI/MCP | M4 Geofencing | M5 Blockchain |
|:---:|:---:|---|---|---|---|---|
| **1** | 1–2 | All schemas done; registration/login working | Escrow schema design | MCP skeleton; scam-URL schema | Projects/reports schema | Audit schema; stub log function |
| **2** | 3–4 | OCR + HITL + cert issuance triggers real hashing | Escrow COMMITTED logic (unit-tested) | Scam-typology matcher (standalone) | EXIF extraction pipeline (standalone) | Real hashing triggered by M1 certs |
| **3** | 5–6 | Admin UI polish | Marketplace UI reads real M1 data | Chatbot shell (stubbed MCP) | Map/polygon UI + project registration | Hashing extended to P2P schema |
| **4** | 7–8 | Admin dashboard view | Real escrow funding flow (hashed + logged) | First live MCP query tool | Camera capture; anomaly detector v1 | Hash new investments |
| **5** | 9–10 | HITL polish | LOCKED→RELEASED escrow endpoint | Rule engine live on real contracts | Geofence validation + report submission | NFT Minting Service wired to XRPL |
| **6** | 11–12 | — | **Marquee:** report approval auto-releases escrow | AI risk-check on release flow | Report approval triggers release call | Trust Index live on real data |
| **7** | 13–14 | Final polish | P2P purchase flow; feature freeze | Chatbot polish; Audit Log Retrieval | dHash; anti-spoofing; Milestone Timeline | Proof-verification endpoint; feature freeze |

Any hardening, adversarial testing, and demo preparation time granted by the program should be scheduled after week 14.

---

## 5. Contribution Tracking

To ensure the panel can see individual contribution clearly and no member is unfairly perceived as having done less work:

- Each module is broken into a fixed set of **18 GitHub issues** (listed in Section 9), so progress is countable rather than self-reported.
- Each member reports issues closed at every two-week checkpoint meeting, visible to the whole team.
- Presentation and live demo at the final review are split by module, with each member presenting and demonstrating their own module.
- If any module falls under roughly 50% of its issues closed by Checkpoint 3, this is flagged to the supervisor immediately rather than left until week 14.

---

## 6. Integration Strategy: How the Modules Actually Connect

### 6.1 Core principle: contract-first, loosely coupled

Modules communicate only through defined APIs — never by one module reading another's database tables directly. If Module 4 needs Module 2 to release escrow funds, it calls Module 2's release endpoint; it never writes to Module 2's Escrow Ledger table itself.

### 6.2 Repository and branching structure

- One shared repository with one folder per module, plus a `shared/` folder for common code.
- Branch structure: `main` (always stable, demo-ready) ← `develop` (weekly integration baseline) ← `feature/module-x/ticket-name` (one branch per GitHub issue).
- Every PR targets `develop`, needs at least one other member's review before merging.
- `main` only gets updated from `develop` after a checkpoint's integration test has passed.

### 6.3 Define interfaces before writing code (API contracts)

Before implementation starts on any module, its owner writes a short interface spec in `contracts/` listing every endpoint the module exposes. These are reviewed by any consuming module before code is written.

### 6.4 One shared environment everyone can run locally

Docker Compose defines one container per module's backend, a shared database, and Redis. Running `docker-compose up` brings up the entire system on any member's machine.

### 6.5 Mocking modules that aren't finished yet

A module should never sit idle waiting for another module to finish. Build against a mock matching the agreed contract. When the real endpoint is ready, swap the URL — nothing else changes.

### 6.6 Weekly integration ritual

1. **Freeze and pull** — finish tickets, push to feature branch, open PR against `develop`.
2. **Merge in dependency order** — M1 first, then M2 and M4 in parallel, then M3, then M5 last.
3. **Pair on conflicts live** — whoever owns each side resolves together on a short call.
4. **Run that week's smoke test** — execute the checkpoint's target feature end-to-end against merged `develop`.
5. **Demo to the team** — the module owner central to that week walks the others through it.
6. **Log tickets and flag blockers** — update GitHub issues; flag anything under ~50% complete immediately.
7. **Re-baseline** — `develop` becomes the new starting point for next week's tickets.

### 6.7 Automated integration checks (CI)

GitHub Actions workflow runs on every PR into `develop`: brings up docker-compose, runs each module's tests, and runs the smoke test for that checkpoint's target feature.

---

## 7. Applying the Integration Plan to This Project

### 7.1 The actual contracts between the five modules

| Caller | Provider | Endpoint | Purpose |
|---|---|---|---|
| Frontend / M2 | Module 1 | `GET /api/certificates/:id/verify` | Public lookup confirming certificate is anchored on-chain |
| M1, M2, M3, M4 | Module 5 | `POST /api/audit/anchor` | Hash and anchor an event on XRPL Testnet |
| M2 (Fund Project) | Module 5 | `POST /api/audit/mint` | Trigger NFT minting with Investor ID, Project ID, Stake Amount |
| M4 (report approved) | Module 2 | `POST /api/escrow/release` | Release escrow funds after geofence + AI checks pass |
| M2 / Frontend | Module 5 | `GET /api/audit/verify/:hash` | Confirm a hash is anchored on XRPL Testnet |
| Frontend (dashboard) | Module 5 | `GET /api/trust-index/:companyId` | Fetch aggregated Trust Index score |

Module 5 is the provider in almost every row — its contract needs to be finalized first, in week 1.

### 7.2 Who mocks whom, and until when

| Module | Depends on | What it needs | Mock until |
|---|---|---|---|
| Module 2 | Module 1 | Valid Investor/Company ID | M1's auth API lands (CP 1, ~week 2) — hardcoded test user ID |
| Module 4 | Module 1 | Verified Company session | M1's auth API (~week 2) |
| Module 4 | Module 2 | Working `/api/escrow/release` | M2's LOCKED→RELEASED endpoint (CP 5, ~week 9) — mock returns fixed success |
| M1, M2, M3, M4 | Module 5 | Working `/api/audit/anchor` | M5's stub logging (CP 1, ~week 2); real XRPL stays mocked until CP 2 |
| Module 5 | M1–M4 | Real events to hash | Builds against fake sample payloads until each module's real event exists |
| Module 3 | Module 4 | Real project data to flag | M4's project registration live (~week 5–6); M3 unit-tests standalone before |

### 7.3 Worked example: Checkpoints 1–2

**Checkpoint 1 (Weeks 1–2):**
- M1 builds real registration/login API and schema — no upstream dependency.
- M2 designs Escrow Ledger schema, writes funding logic against hardcoded fake Investor ID.
- M3 and M4 build their schemas and start standalone pieces.
- M5 builds audit schema and stub `/api/audit/anchor` that logs to a table.
- Integration meeting: confirm schemas don't conflict, demo M1's login end-to-end.

**Checkpoint 2 (Weeks 3–4):**
- M1 finishes OCR + HITL + cert issuance, calls M5's now-real anchor endpoint.
- M2 swaps hardcoded fake Investor ID for real call to M1's auth API (mock retired).
- M3 builds scam-typology matcher standalone.
- M4 builds EXIF extraction pipeline standalone.
- Integration meeting: demo that M1 certificate issuance produces a real, verifiable hash on XRPL — first genuine cross-module feature.

---

## 8. Interim Demo Plan (Week 5)

Week 5 falls mid-Checkpoint 3. The rule: anything running gets shown live; anything not yet built is shown as a Figma preview and clearly labeled as planned.

### 8.1 What each module shows

| Module | Show live (functional) | Show as labeled Figma preview |
|---|---|---|
| M1 | Registration/login; OCR + HITL queue; cert issuance producing a real hash via M5 | Admin dashboard visual polish |
| M2 | Escrow schema and COMMITTED-state logic via API calls/logs | Marketplace dashboard, funding flow, NFT UI |
| M3 | MCP skeleton responding to a query; scam-typology matcher classifying samples | Chatbot interface |
| M4 | EXIF extraction pipeline run against sample photos | Map/polygon UI, camera capture, company dashboard |
| M5 | Real XRPL Testnet hash anchoring — the flagship demo | Regulatory dashboard, Trust Index visualization |

### 8.2 Demo order

1. Open with the cross-module flow: M1 issues certificate → M5 hashes and confirms on XRPL Testnet (proves the riskiest technical claim).
2. Each remaining member demos their live piece and speaks to it themselves.
3. Finish with clearly-labeled Figma previews for upcoming checkpoints.

### 8.3 Ground rules

- Never present a Figma screen in a way that could be mistaken for a working feature.
- Every member presents their own module; nobody presents on behalf of another.

---

## 9. GitHub Issue List by Module

18 issues per module, aligned with the layer breakdown in Section 2.

### Module 1 — User Management & Corporate Registry

| # | GitHub Issue |
|:---:|---|
| 1 | Design DB schema: Users / Investors / Companies / Admins |
| 2 | Design DB schema: Documents table |
| 3 | Design DB schema: Certificates table |
| 4 | Implement authentication API (registration / login) |
| 5 | Build role-based onboarding UI (Investor / Company / Admin) |
| 6 | Build document upload UI |
| 7 | Implement document intake API |
| 8 | Integrate OCR for document text extraction |
| 9 | Build field-extraction parsing tree |
| 10 | Implement composite confidence-scoring (OCR confidence + field-format rules) |
| 11 | Integrate vision-model fallback for handwritten deeds |
| 12 | Build HITL Admin Review Queue UI |
| 13 | Implement HITL routing / approval API |
| 14 | Implement certificate issuance API |
| 15 | Build Digital Trust Certificate + QR code display |
| 16 | Integrate certificate hashing into Module 5's Merkle batch |
| 17 | Build public "Verify My Certificate" lookup feature |
| 18 | Polish admin dashboard view |

### Module 2 — Investor Marketplace & Investment Lifecycle

| # | GitHub Issue |
|:---:|---|
| 1 | Design DB schema: Investments & Escrow Ledger |
| 2 | Design DB schema: P2P Transfers table |
| 3 | Design DB schema: state-transition audit log |
| 4 | Implement project listing API |
| 5 | Build marketplace dashboard UI |
| 6 | Implement escrow state machine (5 states, bypass-prevention) |
| 7 | Build funding flow UI |
| 8 | Implement funding API (Investor → Escrow COMMITTED) |
| 9 | Implement LOCKED → RELEASED escrow endpoint |
| 10 | Implement P2P transfer API (atomic transactions) |
| 11 | Build P2P listing UI |
| 12 | Build risk-based ranking / filtering UI using Trust Index |
| 13 | Build investment-pattern anomaly detector (funding velocity / concentration) |
| 14 | Integrate ownership-record hashing |
| 15 | Implement XRPL NFT-minting service (backend) |
| 16 | Design Investment NFT metadata and wire mint trigger to Fund Project |
| 17 | Expose escrow history via API |
| 18 | Polish marketplace UI and P2P purchase flow |

### Module 3 — MCP-Driven Explainable AI & Chatbot

| # | GitHub Issue |
|:---:|---|
| 1 | Design DB schema: Contract Clauses & Risk Flags |
| 2 | Design DB schema: Chatbot Conversation States |
| 3 | Design DB schema: Scam Typologies table |
| 4 | Build MCP server skeleton (JSON-RPC bridge) |
| 5 | Implement MCP scoped query tools + validation |
| 6 | Build chatbot frontend shell |
| 7 | Implement rule-based CBSL compliance engine |
| 8 | Build contract risk-flag display UI |
| 9 | Build typology-matching scam classifier |
| 10 | Build scam-monitoring input UI |
| 11 | Design LLM prompts for cross-validation / explanations |
| 12 | Bridge chatbot context between MCP and LLM |
| 13 | Wire first live MCP query tool |
| 14 | Integrate scam-flag hashing |
| 15 | Build Audit Log Retrieval feature (queryable proof-of-inclusion view) |
| 16 | Polish chatbot and handle edge cases |
| 17 | Tune scam-monitor on real data |
| 18 | Integrate contract risk flagging on real project data |

### Module 4 — Company Portal & Proof-of-Reality (Geofencing)

| # | GitHub Issue |
|:---:|---|
| 1 | Design DB schema: Projects / polygon-coordinates table |
| 2 | Design DB schema: Progress Reports table + spatial indexing |
| 3 | Build company dashboard UI |
| 4 | Build polygon-drawing map UI |
| 5 | Implement project registration flow |
| 6 | Build in-app camera capture component |
| 7 | Implement EXIF extraction pipeline |
| 8 | Implement ray-casting point-in-polygon engine |
| 9 | Build progress report submission flow |
| 10 | Implement Haversine distance calculation |
| 11 | Implement perceptual hashing (dHash) duplicate-detection |
| 12 | Build AI Vision anti-spoofing classifier |
| 13 | Implement profit-distribution trigger (calls Module 2 escrow release) |
| 14 | Integrate progress-report hashing |
| 15 | Build investor-facing Milestone Timeline UI with inclusion-proof badges |
| 16 | Handle edge cases (bad GPS, corrupted EXIF) |
| 17 | Polish upload flow |
| 18 | Integration-test geofence validation end to end |

### Module 5 — Blockchain Auditing & Regulatory Dashboard

| # | GitHub Issue |
|:---:|---|
| 1 | Design DB schema: Audit Trail table |
| 2 | Design DB schema: Trust Index components table |
| 3 | Implement cross-module aggregation queries |
| 4 | Build shared XRPL signing utility (wallet, nonce, retry) |
| 5 | Implement Merkle tree construction logic |
| 6 | Build stub hashing / logging function (early integration) |
| 7 | Build real Merkle batch hashing pipeline |
| 8 | Build NFT Minting Service (backend logic layer) |
| 9 | Integrate XRPL Testnet for hash anchoring |
| 10 | Integrate XRPL Testnet for NFT mint transactions |
| 11 | Log mint confirmation / token ID to Immutable Audit Trail |
| 12 | Implement proof-verification endpoint |
| 13 | Build regulatory dashboard UI |
| 14 | Build Trust Index visualization UI |
| 15 | Implement Digital Trust Index weighted-scoring algorithm |
| 16 | Build scam-flag aggregation display |
| 17 | Set up XRPL wallet for regulatory dashboard |
| 18 | End-to-end test audit trail across all modules |
