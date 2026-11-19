# Contract: m3-mcp-ai

**Owner:** Imesha · **Last updated:** 2026-11-19

## Exported functions (for other modules)

Other modules import these only from `src/modules/m3-mcp-ai/m3.service.ts`.

### `scamService.riskCheck(projectId: string): Promise<RiskCheckResult>`

- **What it does:** scam / CBSL compliance risk for a project.
- **Called by:** M2 (before every escrow release)
- **Status:** stub (always `low`) until Sprint 3.
- **Returns:** `{ projectId, level: 'low' | 'medium' | 'high', reasons: string[] }`

## HTTP routes (for the frontend)

Base path: `/api/mcp-ai`

| Method | Path      | Auth / role | Request body | Response             |
| ------ | --------- | ----------- | ------------ | -------------------- |
| GET    | `/health` | none        | –            | `{ module, status }` |

Planned: `POST /rpc` (MCP JSON-RPC 2.0: `tools/list`, `tools/call`) and `POST /chat` (Sprint 1),
`POST /scam/check` (Sprint 3).

## Database tables (owned by this module)

From the ER design (`Diagrams/ER Diagrams`), in `prisma/schema/m3-mcp-ai.prisma`:
chatbot_conversations, chatbot_messages, scam_typologies, scam_reports (Sprint 1); scam_report_typologies, contract_clauses, compliance_verdicts (Sprint 3).
Other modules never read them directly. Naming and cross-module links: see `prisma/schema/base.prisma`.

## Change log

- 2026-11-19: created from the Week 0 scaffold stubs.
