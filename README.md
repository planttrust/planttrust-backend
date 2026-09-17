# PlanTrust

A blockchain-based land investment platform built on the XRPL Testnet. PlanTrust lets companies register verified land/project records, investors fund projects through an escrow-backed marketplace, AI systems flag risk and scam patterns, and every key event is hashed and anchored on-chain for auditability.

## Modules

The system is split into five modules, each owned by one team member and spanning frontend, backend, database, AI, and blockchain work for that slice of the system.

| Folder | Module | Owner |
|---|---|---|
| `module-1-user-management/` | User Management & Corporate Registry | _assign name_ |
| `module-2-marketplace/` | Investor Marketplace & Investment Lifecycle | _assign name_ |
| `module-3-mcp-ai/` | MCP-Driven Explainable AI & Chatbot | _assign name_ |
| `module-4-company-geofencing/` | Company Portal & Proof-of-Reality (Geofencing) | _assign name_ |
| `module-5-blockchain-audit/` | Blockchain Auditing & Regulatory Dashboard | _assign name_ |

See each module's own `README.md` for its specific scope, and `docs/PROPOSAL.md` (or the shared proposal document) for the full breakdown of features, workload balancing, and the 14-week checkpoint schedule.

## Repository layout

```
planttrust-platform/
├── module-1-user-management/
├── module-2-marketplace/
├── module-3-mcp-ai/
├── module-4-company-geofencing/
├── module-5-blockchain-audit/
├── shared/            # common code: XRPL client, auth middleware, DB connection
├── contracts/         # API contracts between modules (see contracts/README.md)
├── .github/
│   ├── CODEOWNERS
│   └── workflows/      # CI: integration smoke tests
├── docker-compose.yml
└── README.md
```

## Getting the whole system running locally

```bash
docker-compose up
```

This starts every module's backend, the shared database, and the frontend together, so cross-module features can be tested locally rather than only in the weekly integration meeting.

## Branching model

- `main` — always stable, demo-ready. Protected: no direct pushes, PR + review required.
- `develop` — the shared integration baseline. Protected: PR + at least one review required.
- `feature/<module>/<ticket-name>` — one branch per GitHub issue, opened against `develop`.

See `CONTRIBUTING.md` for the full workflow, including the weekly integration ritual and how to mock a module that isn't finished yet.

## Contracts

Before building a call into another module, check `contracts/` for that module's interface spec (or add one if it doesn't exist yet, and get a quick sign-off from that module's owner before building against it).

## Mentor access

The team's mentor/supervisor has Admin access to this repository for oversight and review. See `MENTOR.md` for details on the scope of that access.
