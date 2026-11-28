# Contract: m3-mcp-ai

**Owner:** Imesha · **Last updated:** 2026-11-27

M3 runs the PlantTrust assistant. It is an MCP server inside the backend: its tools call other
modules' service functions, never their tables. In Sprint 1 the assistant answers "which projects
are open?". Scam detection (risk checks, scam reports, contract clauses) is built in Sprint 3.

## Exported functions (for other modules)

Other modules import these only from `src/modules/m3-mcp-ai/m3.service.ts`.

### `scamService.riskCheck(projectId: string): Promise<RiskCheckResult>`

- **What it does:** scam / CBSL compliance risk for a project.
- **Called by:** M2 (before every escrow release)
- **Status:** stub (always `low`) until Sprint 3.
- **Returns:**

  ```ts
  type ScamRiskLevel = 'low' | 'medium' | 'high';

  interface RiskCheckResult {
    projectId: string;
    level: ScamRiskLevel;
    reasons: string[]; // empty when level is 'low'
  }
  ```

- **How M2 uses the level** (agreed in `contracts/m2-marketplace.md` 4.3): `high` blocks the
  release, `medium` goes ahead with the level written in the transition reason, `low` goes ahead.
- **Audit (Sprint 3):** when a check raises a `medium` or `high` flag, M3 saves a `RiskFlag` and
  anchors it as `SCAM_FLAG` (see below). A `low` result is not saved or anchored.

## HTTP routes (for the frontend)

Base path: `/api/mcp-ai`

| Method | Path      | Auth / role              | Request body  | Response                 |
| ------ | --------- | ------------------------ | ------------- | ------------------------ |
| GET    | `/health` | none                     | –             | `{ module, status }`     |
| POST   | `/rpc`    | `requireAuth` (any role) | JSON-RPC 2.0  | JSON-RPC 2.0 (see below) |
| POST   | `/chat`   | `requireAuth` (any role) | `ChatRequest` | `200` `ChatResponse`     |

Planned: `GET /chat/conversations` (Sprint 2), `POST /scam/check` and `POST /scam/reports`
(Sprint 3).

### `POST /rpc`: the MCP server (JSON-RPC 2.0)

Follows [JSON-RPC 2.0](https://www.jsonrpc.org/specification) and the MCP `tools/list` and
`tools/call` methods. One request per call (no batches). The HTTP status is always `200`, even
for JSON-RPC errors; only a missing login returns `401`.

**Request**

```ts
interface RpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: 'tools/list' | 'tools/call';
  params?: object;
}
```

**`tools/list`**: no params. Returns the tools the assistant can use.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "list_open_projects",
        "description": "Lists plantation projects that are open for investment.",
        "inputSchema": { "type": "object", "properties": {}, "additionalProperties": false }
      }
    ]
  }
}
```

**`tools/call`**: `params: { name: string, arguments?: object }`. Returns the tool's result.

```ts
interface ToolResult {
  content: { type: 'text'; text: string }[]; // a short, readable summary
  structuredContent?: unknown; // the same data as JSON (shape per tool, below)
  isError?: boolean; // true when the tool ran but failed
}
```

**Errors** (inside a `200` response, as `{ jsonrpc, id, error: { code, message, data? } }`):

| Code     | When                                                       |
| -------- | ---------------------------------------------------------- |
| `-32700` | The body is not valid JSON                                 |
| `-32600` | Not a valid JSON-RPC 2.0 request (missing `jsonrpc`, `id`) |
| `-32601` | Unknown `method`                                           |
| `-32602` | Unknown tool name, or the `arguments` are invalid          |
| `-32603` | Unexpected server error                                    |

### MCP tools (Sprint 1)

#### `list_open_projects`

- **Arguments:** none.
- **Calls:** M2 `listingService.list()`, keeps only `status === 'open'`.
- **`structuredContent`:** `{ projects: OpenProject[] }`

```ts
interface OpenProject {
  projectId: string;
  title: string;
  location: string;
  district: string;
  crop: string;
  fundingGoal: number; // LKR
  fundedAmount: number; // LKR
  expectedReturn: number; // %
  duration: number; // months
}
```

- **`text`:** e.g. `"3 projects are open: Kandy Tea Plantation (Kandy), …"`, or
  `"No projects are open for investment right now."` when the list is empty.

Planned tools: `get_project_details` (Sprint 2), `get_trust_index` (Sprint 3, calls M5
`trustIndexService.get()`), `check_project_risk` (Sprint 3).

### `POST /chat`: the chatbot screen

```ts
interface ChatRequest {
  message: string; // 1–1000 chars, trimmed
  conversationId?: string; // omit to start a new conversation
}

interface ChatResponse {
  conversationId: string;
  reply: string; // the assistant's answer, plain text
  toolUsed: string | null; // e.g. "list_open_projects", or null if no tool was used
  data: unknown | null; // the tool's structuredContent, so the screen can show cards
}
```

What happens:

1. The message is validated (`400 VALIDATION_ERROR` if empty or too long).
2. If `conversationId` is given, it must belong to the logged-in user, otherwise `404 NOT_FOUND`.
3. **Sprint 1:** the question is matched by keywords (e.g. "open", "projects", "invest",
   "available") to `list_open_projects`, which runs through the same code as `tools/call`.
   Anything else gets a short help reply listing what the assistant can answer, with
   `toolUsed: null`. An AI model chooses the tool from Sprint 2.
4. The user message and the reply are saved in `ChatbotConversation`.

### Errors

All non-RPC errors use the shared shape `{ error: { code, message, details? } }`:
`400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

## Database tables (owned by this module)

Defined in `prisma/schema/m3-mcp-ai.prisma`. Other modules never read them directly.
`projectId` and `userId` are plain strings with an index (no relation to M1 or M4).

| Model                 | Table                   | Main columns                                                                                                    | Used from |
| --------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------- | --------- |
| `ScamTypology`        | `scam_typologies`       | `code` (unique), `name`, `description`, `indicators` (text[]), `severity`, `source` (e.g. CBSL notice)          | Sprint 1  |
| `ScamReport`          | `scam_reports`          | `projectId`, `reporterId`, `typologyId?`, `description`, `status`                                               | Sprint 3  |
| `ContractClause`      | `contract_clauses`      | `projectId`, `clauseText`, `typologyId?`, `riskLevel`, `explanation`                                            | Sprint 3  |
| `RiskFlag`            | `risk_flags`            | `projectId`, `level`, `reasons` (text[]), `source`, `status`, `anchorId?`, `clearedBy?`, `clearedAt?`           | Sprint 3  |
| `ChatbotConversation` | `chatbot_conversations` | `userId`, `messages` (JSON: `{ role: 'user' \| 'assistant', text, toolUsed?, at }[]`), `createdAt`, `updatedAt` | Sprint 1  |

Enums: `ScamRiskLevel` (`low`, `medium`, `high`), `ScamReportStatus` (`open`, `reviewing`,
`confirmed`, `dismissed`), `ScamFlagSource` (`auto`, `user_report`, `admin`), `ScamFlagStatus`
(`raised`, `cleared`).

All five tables are created in the Sprint 1 migration (`m3_scam_tables`) so the later sprints only
add logic. The seed adds the CBSL scam typologies (e.g. pyramid / Ponzi schemes, guaranteed
high returns, unlicensed deposit taking).

## Audit events (sent to M5)

Agreed in `contracts/m5-audit.md`. M3 sends only `SCAM_FLAG` (from Sprint 3):

```ts
auditService.anchor('SCAM_FLAG', riskFlagId, {
  projectId,
  status, // 'raised' | 'cleared'
  level, // 'low' | 'medium' | 'high'
  reasons, // string[]
  source, // 'auto' | 'user_report' | 'admin'
  flaggedAt, // ISO date-time
});
```

- Sent when a `medium` / `high` flag is raised, or an admin clears a flag. Not on `low` checks.
- Called after the flag is saved (never inside the database transaction). The `anchorId` is
  stored on the `RiskFlag`. A failed anchor is logged and does not undo the flag.
- Only M3 anchors `SCAM_FLAG`; M2 does not anchor it again.
- Chat messages are never anchored.

## Uses from other modules

| Module | Function                   | Why                                           | Sprint |
| ------ | -------------------------- | --------------------------------------------- | ------ |
| M2     | `listingService.list()`    | `list_open_projects` tool                     | 1      |
| M4     | `projectService.getById()` | check a project exists (reports, risk checks) | 3      |
| M5     | `auditService.anchor()`    | `SCAM_FLAG`                                   | 3      |
| M5     | `trustIndexService.get()`  | `get_trust_index` tool                        | 3      |

## Open questions (team to confirm)

1. **Login for `/chat`:** this contract requires login so conversations belong to a user. Should
   visitors who are not logged in be able to ask "which projects are open?" too?
2. **M2 `listingService.list()`** is still a stub that returns `[]`. M3 builds and tests against
   it, but the combined demo needs M2's real version.

## Change log

- 2026-11-19: created from the Week 0 scaffold stubs.
- 2026-11-27: Sprint 1 contract: `POST /rpc` (JSON-RPC 2.0, `tools/list`, `tools/call`),
  `list_open_projects` tool, `POST /chat` request and response, the five M3 tables and enums,
  and the `SCAM_FLAG` payload agreed with M5.
