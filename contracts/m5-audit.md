# Contract: m5-audit

**Owner:** Mirath · **Last updated:** 2026-11-19

> ⚠️ **Agree by 22 Nov:** every module calls `auditService.anchor()`. Review its signature
> and the `AnchorType` list with the team before Sprint 1 starts.

## Exported functions (for other modules)

Other modules import these only from `src/modules/m5-audit/m5.service.ts`.

### `auditService.anchor(type: AnchorType, refId: string, data: unknown): Promise<AnchorReceipt>`

- **What it does:** records the SHA-256 hash of an event so it can be anchored on XRPL Testnet.
- **Called by:** M1, M2, M3, M4
- **Status:** stub. It computes the real hash but doesn't store it or send it to XRPL yet
  (storage in Sprint 1, XRPL in Sprint 2).
- **Returns:** `{ anchorId, hash, status: 'pending' | 'anchored', txHash: string | null }`
- **`AnchorType`:** `PROJECT_REGISTERED`, `DOCUMENT_UPLOADED`, `KYC_DECISION`, `INVESTMENT_FUNDED`,
  `ESCROW_RELEASED`, `PROGRESS_REPORT`, `CERTIFICATE`, `SCAM_FLAG`, `OWNERSHIP_TRANSFER`

### `auditService.mint(investorId: string, projectId: string, stake: number, escrowRef: string): Promise<MintReceipt>`

- **What it does:** mints the investor's NFT for a funded investment.
- **Called by:** M2
- **Status:** stub until Sprint 4.
- **Returns:** `{ nftId, txHash, investorId, projectId, stake, escrowRef }`

### `trustIndexService.get(companyId: string)` / `trustIndexService.recalculate(companyId: string): Promise<TrustIndex>`

- **What it does:** a company's Trust Index, and recalculating it after a company event.
- **Called by:** M2 (ranking), M3 (assistant)
- **Status:** stub (score 50) until Sprint 3.
- **Returns:** `{ companyId, score (0–100), components, updatedAt }`

## HTTP routes (for the frontend)

Base path: `/api/audit`

| Method | Path      | Auth / role | Request body | Response             |
| ------ | --------- | ----------- | ------------ | -------------------- |
| GET    | `/health` | none        | –            | `{ module, status }` |

Planned: `GET /verify/:hash`, `GET /dashboard` (regulator) in Sprint 1, `GET /proof/:hash` (Sprint 4),
`GET /trust-index/:companyId` (public, Sprint 3).

## Database tables (owned by this module)

From the ER design (`Diagrams/ER Diagrams`), in `prisma/schema/m5-audit.prisma`:
merkle_batch, audit_record, trust_index, trust_index_components (Sprint 1); blockchain_anchor (Sprint 2); nft_record (Sprint 4).
Other modules never read them directly. Naming and cross-module links: see `prisma/schema/base.prisma`.

## Change log

- 2026-11-19: created from the Week 0 scaffold stubs.
