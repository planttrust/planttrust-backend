# Contract: m5-audit

**Owner:** Mirath · **Last updated:** 2026-11-23

## Exported functions (for other modules)

Other modules import these only from `src/modules/m5-audit/m5.service.ts`.

### `auditService.anchor(type: AnchorType, refId: string, data: unknown): Promise<AnchorReceipt>`

- **What it does:** Computes and records the SHA-256 hash of an audit event for eventual anchoring on XRPL Testnet.
- **Called by:** M1, M2, M3 and M4.
- **Status:** The current Week 0 stub computes a hash but does not persist the event or submit it to XRPL. Database storage is planned for Sprint 1 and XRPL integration for Sprint 2.
- **Returns:** `{ anchorId, hash, status: 'pending' | 'anchored', txHash: string | null }`
- **Signature:** Remains unchanged.

### AnchorType — agreed event contract

| Event                  | Sender  | When it fires                                                  | refId              |
| ---------------------- | ------- | -------------------------------------------------------------- | ------------------ |
| `PROJECT_REGISTERED`   | M4      | Project registration, Sprint 1                                 | projectId          |
| `DOCUMENT_UPLOADED`    | M1 / M4 | User document or land document uploaded                        | docId / documentId |
| `KYC_DECISION`         | M1      | KYC decision, Sprint 3                                         | userId             |
| `INVESTMENT_CREATED`   | M2      | Investment and PENDING escrow created                          | investmentId       |
| `ESCROW_STATE_CHANGED` | M2      | Escrow transitions to COMMITTED, LOCKED, RELEASED or CANCELLED | transitionId       |
| `OWNERSHIP_TRANSFER`   | M2      | P2P ownership transfer committed                               | transferId         |
| `PROGRESS_REPORT`      | M4      | Progress report submitted, Sprints 3–4                         | progressReportId   |
| `CERTIFICATE`          | M1      | Certificate issued, Sprint 4                                   | certificateId      |
| `SCAM_FLAG`            | M3      | Medium/high flag raised or flag cleared by an admin            | riskFlagId         |

The M2 events `INVESTMENT_FUNDED` and `ESCROW_RELEASED` are replaced by `INVESTMENT_CREATED` and `ESCROW_STATE_CHANGED`.

`CERTIFICATE` is owned by M1, not M4. `DOCUMENT_UPLOADED` is shared by M1 and M4.

### Event payloads

The following fields describe the data each sending module passes to `anchor()`. No raw documents, file contents, names, addresses, raw GPS coordinates or other personal details should be included.

**M1 — User Management**

`DOCUMENT_UPLOADED`

- `refId`: `docId`
- `data`: `{ userId, docType, fileHash }`

`KYC_DECISION`

- `refId`: `userId`
- `data`: `{ docId, decision, reviewedBy }`

`CERTIFICATE`

- `refId`: `certificateId`
- `data`: `{ companyId, certificateHash, issuedAt }`

**M2 — Marketplace and Escrow**

`INVESTMENT_CREATED`

- `refId`: `investmentId`
- `data`: `{ investorId, projectId, amount, trustIndexSnapshot }`
- Sent when the investment and its PENDING escrow are created.

`ESCROW_STATE_CHANGED`

- `refId`: `transitionId` (the escrow transition row ID)
- `data`: `{ escrowId, investmentId, projectId, from, to, actor, reason, transitionHash }`
- Sent for later transitions to COMMITTED, LOCKED, RELEASED and CANCELLED.
- The initial PENDING state is covered by `INVESTMENT_CREATED`, avoiding a duplicate event at creation.

`OWNERSHIP_TRANSFER`

- `refId`: `transferId`
- `data`: `{ investmentId, fromInvestorId, toInvestorId, amount }`
- Sent when a P2P transfer is committed.

M2 calls `anchor()` after the relevant database transaction commits, not inside that transaction. Minting is handled separately through `auditService.mint()`.

**M3 — AI and Scam Detection**

`SCAM_FLAG`

- `refId`: `riskFlagId` (the risk flag's own ID)
- `data`:
  - `projectId`
  - `status: 'raised' | 'cleared'`
  - `level: 'low' | 'medium' | 'high'`
  - `reasons: string[]`
  - `source: 'auto' | 'user_report' | 'admin'`
  - `flaggedAt`

Only M3 anchors this event. It is emitted when a medium/high flag is raised or an admin clears a flag, not on every low-risk check. M2 must not anchor the same flag again after `riskCheck()`.

`SCAM_REPORT` is not required for Sprint 1.

**M4 — Company Portal and Geofencing**

`PROJECT_REGISTERED` — Sprint 1

- `refId`: `projectId`
- `data`:
  - `projectId: string`
  - `companyId: string`
  - `polygonHash: string`
  - `areaHectares: number`
  - `fundingGoal: number`
  - `documentHashes: string[]`
  - `registeredAt: string` (ISO 8601)

`PROGRESS_REPORT` — Sprints 3–4

- `refId`: `progressReportId`
- `data`:
  - `progressReportId: string`
  - `projectId: string`
  - `milestoneId: string`
  - `photoHashes: string[]`
  - `gpsVerified: boolean`
  - `submittedAt: string` (ISO 8601)

`DOCUMENT_UPLOADED` — Land documents, Sprint 1

- `refId`: `documentId`
- `data`:
  - `documentId: string`
  - `projectId: string`
  - `companyId: string`
  - `documentType: 'LAND_DEED' | 'SURVEY_PLAN' | 'OTHER'`
  - `fileHash: string`
  - `uploadedAt: string` (ISO 8601)

M4 sends hashes rather than raw land boundaries, documents or photographs. SHA-256 hashes are lowercase hexadecimal strings.

### Deterministic hashing rules

- Hash the event envelope containing `type`, `refId` and `data`.
- Use one deterministic JSON serialization format across all modules.
- Sort object keys alphabetically, including keys inside nested objects.
- Represent dates as ISO 8601 strings.
- Represent SHA-256 hashes as lowercase hexadecimal strings.
- The same canonical event content must produce the same SHA-256 hash.
- Arrays preserve their defined order; producers must use a consistent order where array ordering is not meaningful.
- The canonical hashing implementation will be added during Sprint 1. The current stub still uses ordinary `JSON.stringify()`.

### Anchor IDs, failures and retries

- Each stored audit event must have a unique persistent `anchorId`, separate from its SHA-256 content hash.
- Repeated delivery of the same logical event should not create duplicate audit records.
- If XRPL anchoring fails or is temporarily unavailable, an already persisted audit event remains `pending` and is retried later.
- Temporary XRPL failures should not cause an otherwise successful business request to fail.
- The initial database-persistence failure case must be handled explicitly during Sprint 1 design; an event must not be reported as safely recorded if persistence failed.
- The current Week 0 stub does not yet provide persistence, unique database IDs or retries.

### `auditService.mint(investorId: string, projectId: string, stake: number, escrowRef: string): Promise<MintReceipt>`

- **What it does:** Mints the investor's NFT for a funded investment.
- **Called by:** M2.
- **Status:** Stub until Sprint 4.
- **Returns:** `{ nftId, txHash, investorId, projectId, stake, escrowRef }`

### `trustIndexService.get(companyId: string)` / `trustIndexService.recalculate(companyId: string): Promise<TrustIndex>`

- **What it does:** Retrieves or recalculates a company's Trust Index.
- **Called by:** M2 (ranking), M3 (assistant).
- **Status:** Stub returning score 50 until Sprint 3.
- **Returns:** `{ companyId, score (0–100), components, updatedAt }`

## HTTP routes (for the frontend)

Base path: `/api/audit`

| Method | Path      | Auth / role | Request body | Response             |
| ------ | --------- | ----------- | ------------ | -------------------- |
| GET    | `/health` | None        | –            | `{ module, status }` |

Planned: `GET /verify/:hash` and `GET /dashboard` (regulator) in Sprint 1; `GET /trust-index/:companyId` (public) in Sprint 3; `GET /proof/:hash` in Sprint 4.

## Database tables (owned by this module)

To be added in Sprint 1 in `prisma/schema/m5-audit.prisma`: audit trail, Merkle batches, Trust Index and Trust Index components.

## Change log

- **2026-11-19:** Created from the Week 0 scaffold stubs.
- **2026-11-23:** Documented M1–M4 event ownership and payloads, proposed M2 event replacements, deterministic hashing, unique IDs and pending/retry behavior. Implementation remains for Sprint 1.
