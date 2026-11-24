# Contract: m2-marketplace

**Owner:** Thilina
**Last updated:** 2026-11-24
**Module:** M2 – Investor Marketplace & Escrow

## 1. Module Responsibilities

M2 is responsible for:

- Displaying public plantation investment projects.
- Providing project listing information to the frontend and M3 AI assistant.
- Managing investor investments.
- Managing escrow records and escrow state transitions.
- Supporting peer-to-peer investment ownership transfers.
- Coordinating escrow releases with M3 and M4.
- Sending investment and escrow audit events to M5.
- Detecting unusual investment patterns and showing them to the Admin (Sprint 4).
- Requesting NFT minting for funded investments from M5 (Sprint 4).

M2 owns its investment and escrow data.

M2 must not directly access another module's database tables. Cross-module communication must happen through exported service functions.

---

## 2. Exported Functions (for other modules)

Other modules must import M2 functions only from:

`src/modules/m2-marketplace/m2.service.ts`

### 2.1 listingService.list()

**Signature:**

`listingService.list(): Promise<Listing[]>`

**Purpose:**

Returns public plantation projects available in the marketplace.

**Called by:**

- M3 – MCP AI & Scam Detection.
- M2 HTTP listing routes.

**Implementation (Sprint 1):**

- Retrieve projects through M4's `projectService.listOpen()`.
- Include projects with status `open` or `funded` only.
- Exclude draft and completed projects.
- Return only the approved public fields.
- Do not expose document file URLs.
- Set `fundedAmount` to `0` until investing functionality is implemented in Sprint 2.
- Set `status` from M4's status (see Listing status below).
- Set `trustIndex` and `riskRank` to `null` and `certificateStatus` to `'none'` until M5 and M1 provide the data (see 4.2 and 4.4).

**Return type:**

```ts
export interface Listing {
  projectId: string;
  title: string;
  location: string;
  district: string;
  crop: string;
  fundingGoal: number;
  fundedAmount: number; // LKR; 0 until investing goes live in Sprint 2
  expectedReturn: number;
  duration: number;
  photo: string | null;
  status: "open" | "funded";
  anchorId: string | null;
  trustIndex: number | null; // 0-100 from M5; null until available
  riskRank: number | null; // 1 = lowest risk; null until Trust Index is live
  certificateStatus: "active" | "revoked" | "none"; // from M1; 'none' until available
}
```

**fundedAmount (Sprint 2):**

`fundedAmount` is the sum of `Investment.amount` for the project where the escrow state is `COMMITTED`, `LOCKED` or `RELEASED`. `PENDING` and `CANCELLED` investments are not counted.

Do not add a `fundedAmount` or `funded` column to M4's projects table.

The frontend calculates funding progress using:

`progress = (fundedAmount / fundingGoal) * 100`

The API does not need a separate percentage field.

**Listing status:**

M4 owns the project status. M2 starts from M4's status and may only raise it to `'funded'`.

```ts
status =
  m4.status === "funded" || fundedAmount >= fundingGoal ? "funded" : "open";
```

- M2 never lowers a status that M4 reports as `'funded'`, and never changes M4's project status.
- In Sprint 1 `fundedAmount` is `0`, so the status is exactly M4's status (`'open'` or `'funded'`).
- From Sprint 2, a project also shows `'funded'` when the confirmed investments reach the funding goal.

**Filtering and ranking:**

- Sprint 1: the frontend does search and filtering on the full list. The API has no query parameters.
- Sprint 3: add `?sort=risk` (lowest risk first, by Trust Index) when the Trust Index is live.

**When the Listing type changes**, update the frontend copy (`src/modules/m2-marketplace/types.ts` and `mocks.ts`) in the same pull request.

### 2.2 escrowService.release()

**Signature:**

`escrowService.release(projectId: string, reportId: string): Promise<EscrowReleaseResult>`

**Purpose:**

Releases escrowed investment money for a project after M4 approves a progress report.

This is not an HTTP route. Only M4 calls it, and only after the approval is committed in M4's database.

**Called by:**

- M4 – Company Portal & Geofencing.

**Processing requirements (Sprint 3):**

1. Receive the projectId and approved reportId from M4.
2. Find the escrow records of the project that are in state `LOCKED`.
3. If none are `LOCKED`, return `REJECTED` (reason `NO_LOCKED_ESCROW`).
4. Call M3's `scamService.riskCheck()`. Block the release when the risk level is high (see 4.3).
5. Release funds only when the payment and authorisation checks pass.
6. For each escrow, in one database transaction: check the transition, insert the log row, set the state to `RELEASED`.
7. After the transaction commits, send `ESCROW_STATE_CHANGED` to M5.

**Idempotency:** calling `release()` twice with the same `reportId` must not release twice. The second call returns the first result. This is enforced by a unique key on `(escrowId, reportId)` in the transition log.

**Release rule (DECISION D1, to agree with M4 before Sprint 2):**

A project has several milestones but each investment has one escrow. Choose one:

- **Option A (suggested for the MVP):** release all `LOCKED` escrows of the project only when the approved report belongs to the final milestone. Earlier approved reports are recorded but release nothing. This needs an M4 function to say whether a report is for the final milestone (see 4.1).
- **Option B:** release in milestone tranches (percentage per milestone). Needs a tranche table.

Until D1 is decided, Sprint 3 work on `release()` must not start.

**Return type:**

```ts
export interface EscrowReleaseResult {
  projectId: string;
  reportId: string;
  status: "RELEASED" | "BLOCKED" | "REJECTED";
  // RELEASED = money released; BLOCKED = high risk, state stays LOCKED;
  // REJECTED = nothing to release or transition not allowed
  amount: number; // total released, 0 if not RELEASED
  releasedCount: number; // number of escrow records released
  reasons: string[]; // empty when RELEASED
}
```

**Current status:**

Sprint 1 stub. No actual money movement is implemented.

### 2.3 Escrow states and transitions

```ts
export type EscrowState =
  | "PENDING"
  | "COMMITTED"
  | "LOCKED"
  | "RELEASED"
  | "CANCELLED";
```

| From      | Allowed next states  | Who can trigger                                             |
| --------- | -------------------- | ----------------------------------------------------------- |
| PENDING   | COMMITTED, CANCELLED | commit: owner investor. cancel: owner investor, admin       |
| COMMITTED | LOCKED, CANCELLED    | lock: automatic. cancel: owner investor, admin              |
| LOCKED    | RELEASED, CANCELLED  | release: only `escrowService.release()`. cancel: admin only |
| RELEASED  | none (final)         | –                                                           |
| CANCELLED | none (final)         | –                                                           |

**Rules:**

- Any move not in the table is rejected with HTTP 409.
- Commit moves PENDING to COMMITTED. In the same request, when the listing status is `open`, M2 then moves COMMITTED to LOCKED (two transitions, two audit events).
- Each state change runs in one database transaction: re-read the state, check the table, insert the log row, update the escrow with a compare-and-set (`where state = expected`). If no row is updated, return 409.
- Money is simulated. No real money moves.
- Investments are rejected when `amount <= 0`, when the listing status is not `open` (M4 status is not `open`, or `fundedAmount >= fundingGoal`), or when the amount is more than the remaining funding (`fundingGoal - fundedAmount`).

---

## 3. HTTP Routes (for the frontend)

Base path:

`/api/marketplace`

### 3.1 GET /health

| Property       | Value                        |
| -------------- | ---------------------------- |
| Method         | GET                          |
| Path           | `/health`                    |
| Authentication | None                         |
| Purpose        | Check M2 module availability |

**Response:**

```json
{
  "module": "m2-marketplace",
  "status": "ok"
}
```

### 3.2 GET /listings

| Property       | Value                                |
| -------------- | ------------------------------------ |
| Method         | GET                                  |
| Path           | `/listings`                          |
| Authentication | None                                 |
| Purpose        | Retrieve public marketplace projects |
| Sprint         | 1                                    |

**Access:** Public. Login is not required.

**Requirements:**

- Return projects with status `open` or `funded` only.
- Do not return draft or completed projects.
- Return only approved public fields.
- Do not expose document file URLs.
- Return an empty array when no eligible projects exist.

**Response example:**

```json
[
  {
    "projectId": "project-1",
    "title": "Kandy Tea Plantation",
    "location": "Kandy",
    "district": "Kandy",
    "crop": "Tea",
    "fundingGoal": 5000000,
    "fundedAmount": 0,
    "expectedReturn": 12,
    "duration": 36,
    "photo": "https://example.com/public/project-photo.jpg",
    "status": "open",
    "anchorId": "anchor-123",
    "trustIndex": null,
    "riskRank": null,
    "certificateStatus": "none"
  }
]
```

The example values are illustrative.

### 3.3 GET /listings/:projectId

| Property       | Value                       |
| -------------- | --------------------------- |
| Method         | GET                         |
| Path           | `/listings/:projectId`      |
| Authentication | None                        |
| Purpose        | Retrieve one public project |
| Sprint         | 1                           |

**Access:** Public. Login is not required.

**Requirements:**

1. Retrieve the project through M4's `projectService.getById(projectId)`.
2. Return the project only if its status is `open` or `funded`.
3. Return HTTP `404 Not Found` if the project does not exist, is a draft, or is completed.
4. Return only approved public fields.
5. Do not expose document file URLs.
6. Set `fundedAmount` to `0` until Sprint 2.

The response has the same shape as one item of `GET /listings`.

### 3.4 Investor routes (Sprint 2)

All require login and the role `investor`. The investor id always comes from the token, never from the request body. (`POST /fund` is replaced by `POST /investments`.)

| Method | Path                      | Who                   | Purpose                                                                  |
| ------ | ------------------------- | --------------------- | ------------------------------------------------------------------------ |
| POST   | `/investments`            | investor              | Create an investment and its PENDING escrow. Body: `projectId`, `amount` |
| POST   | `/investments/:id/commit` | owner investor        | PENDING to COMMITTED, then LOCKED                                        |
| POST   | `/investments/:id/cancel` | owner investor, admin | Move to CANCELLED (see 2.3)                                              |
| GET    | `/investments/mine`       | investor              | My investments with escrow state                                         |
| GET    | `/investments/:id`        | owner investor, admin | One investment with its transition history                               |

**POST /investments requirements:**

- Validate the project through M4's `projectService.getById()`.
- Validate the investor through M1's `userService.getVerified()`.
- Read the Trust Index through M5's `trustIndexService.get(companyId)` and store it as `trustIndexSnapshot`.
- Create the Investment and the PENDING EscrowRecord in one transaction.
- After the transaction commits, send `INVESTMENT_CREATED` to M5.

Detailed request and response formats are finalized in Sprint 2.

### 3.5 GET /escrow/:projectId/history

| Property       | Value                        |
| -------------- | ---------------------------- |
| Method         | GET                          |
| Path           | `/escrow/:projectId/history` |
| Authentication | Required                     |
| Required role  | `admin`                      |
| Sprint         | 3                            |

**Purpose:**

Retrieves escrow state transition history for a project. Investors see the history of their own investments through `GET /investments/:id`, not through this route.

Detailed response format will be defined before Sprint 3 implementation.

### 3.6 Transfer and anomaly routes (Sprint 4)

| Method | Path                    | Who      | Purpose                                                       |
| ------ | ----------------------- | -------- | ------------------------------------------------------------- |
| POST   | `/transfers`            | investor | P2P transfer of a stake. Body: `investmentId`, `toInvestorId` |
| GET    | `/anomalies`            | admin    | Open anomaly flags                                            |
| POST   | `/anomalies/:id/review` | admin    | Mark a flag as reviewed                                       |

### 3.7 Errors

| Status | When                                                                                      |
| ------ | ----------------------------------------------------------------------------------------- |
| 400    | Invalid input (amount <= 0, wrong type)                                                   |
| 401    | Not logged in                                                                             |
| 403    | Wrong role, investor not verified, not the owner                                          |
| 404    | Project or investment not found, or project not public                                    |
| 409    | Illegal state change, project not open, amount above remaining funding, concurrent change |

---

## 4. Cross-Module Integration

### 4.1 M2 ↔ M4: Project information

M4 owns project information.

M2 must retrieve project information through:

`src/modules/m4-geofencing/m4.service.ts`

**Required functions:**

```ts
projectService.listOpen(): Promise<ProjectSummary[]>

projectService.getById(
  projectId: string
): Promise<ProjectSummary | null>
```

M2 uses:

- `listOpen()` to retrieve marketplace projects.
- `getById()` to retrieve an individual project.

**Required M4 interface update:**

The existing M4 `ProjectSummary` currently does not provide all fields required by the public marketplace.

M4 must expose the following additional project information through its service:

- `district`
- `cropType`
- `expectedReturnPct`
- `durationMonths`
- `photoUrl`
- `anchorId`
- `companyId` (needed to read the Trust Index and certificate status; M2 does not return it publicly)

The shared `ProjectSummary` interface must provide the existing fields and these additional fields.

**M2 field mapping:**

M2 maps the M4 `ProjectSummary` fields to the public Listing fields as follows:

| M4 ProjectSummary field | M2 Listing field |
| ----------------------- | ---------------- |
| `cropType`              | `crop`           |
| `expectedReturnPct`     | `expectedReturn` |
| `durationMonths`        | `duration`       |
| `photoUrl`              | `photo`          |

M2 must preserve the other required fields, including `district`, `anchorId`, and `companyId` internally. `companyId` must not appear in public Listing responses.

M4's `listOpen()` must provide both `open` and `funded` projects for marketplace listing purposes.

M2 must filter out `draft` and `completed` projects.

`fundedAmount` remains exclusively M2's responsibility.

M2 must not query M4's project tables directly.

**Needed for decision D1 (Option A):**

An M4 function such as:

`projectService.isFinalMilestoneReport(reportId): Promise<boolean>`

**M4 calling rule:**

M4 calls `escrowService.release()` only after its approval is committed, and must handle the results `BLOCKED` and `REJECTED`.

### 4.2 M2 → M1: Investor verification and certificate status

M2 uses:

`userService.getVerified(userId)`

Source:

`src/modules/m1-users/m1.service.ts`

Used during Sprint 2 investing functionality to validate the investor. If the investor is not verified, M2 returns HTTP 403.

M2 also needs a way to read a company's certificate status for the listing:

`certificateService.getStatus(companyId): Promise<'active' | 'revoked' | 'none'>`

This function is to be added by M1. Until it is available, M2 returns `'none'`.

M2 must not access M1's user tables directly.

### 4.3 M2 → M3: Risk checking

M2 uses:

`scamService.riskCheck()`

Source:

`src/modules/m3-mcp-ai/m3.service.ts`

Used during Sprint 3 escrow release processing.

- **High** risk: the release is blocked (`BLOCKED`), and the state stays `LOCKED`.
- **Medium** risk: the release goes ahead, and the risk level is written in the transition reason.
- **Low** risk: the release goes ahead.

When a release is blocked, an Admin can retry it with:

`POST /escrow/:projectId/retry-release`

(Sprint 3; to be defined.)

M2 must not create duplicate `SCAM_FLAG` events. M3 is responsible for anchoring its own scam flags.

### 4.4 M2 → M5: Blockchain audit

M2 uses:

- `auditService.anchor(type, refId, data)`
- `trustIndexService.get(companyId)` returns a `TrustIndex` object containing `companyId`, `score`, `components`, and `updatedAt`. M2 must use `.score` when it needs the numerical Trust Index.
- `auditService.mint()` (Sprint 4, see 6.4)

Source:

`src/modules/m5-audit/m5.service.ts`

M2 sends the following event types:

- `INVESTMENT_CREATED`
- `ESCROW_STATE_CHANGED`
- `OWNERSHIP_TRANSFER`

The corresponding event definitions are documented in Section 6.

M2 must not directly access M5's database tables.

---

## 5. Database Tables (owned by M2)

M2 owns the following Prisma models.

**File:**

`prisma/schema/m2-marketplace.prisma`

### 5.1 Investment (Sprint 1)

Stores investor investments in plantation projects.

- `id`, `investorId`, `projectId` (plain UUID strings).
- `amount` as `Decimal(18,2)`. Do not use `Float` for money.
- `trustIndexSnapshot` (nullable) and `riskRankScore` (nullable).
- `createdAt`.
- There is no separate status column. The state of an investment is the state of its escrow record.

### 5.2 EscrowRecord (Sprint 1)

Stores escrow information associated with an investment.

- One record per investment (`investmentId` is unique).
- `state` of type `EscrowState` (default `PENDING`) and `updatedAt`.

### 5.3 EscrowStateTransition (Sprint 1)

Stores the history of escrow state changes.

**Append-only:** Rows are never updated or deleted. A database trigger in the migration must reject UPDATE and DELETE.

Fields:

- `escrowId`
- `fromState` (nullable)
- `toState`
- `actorId`
- `reason`
- `reportId` (nullable; set on release)
- `previousHash`
- `transitionHash` (unique)
- `createdAt`

The hash chain:

`transitionHash = SHA-256(previousHash + canonical JSON of the row)`

M2 computes the transition hash when inserting the row. The hash is sent to M5 inside the event data.

Never store the M5 anchor result by updating this row.

### 5.4 P2PTransfer (Sprint 1)

Stores peer-to-peer investment ownership transfers.

Fields:

- `investmentId`
- `fromInvestorId`
- `toInvestorId`
- `amount`
- `status`
- `createdAt`

A transfer changes the owner of the Investment. The transfer history remains in this table.

The table is created in Sprint 1, but P2P transfer business logic is implemented in Sprint 4.

### 5.5 InvestmentNft and InvestmentAnomalyFlag (Sprint 4)

These models support Sprint 4 functionality. They are **not required for the Sprint 1 migration** and will be added in Sprint 4 when their functionality is implemented.

**InvestmentNft:**

- `investmentId` (unique)
- `nftId`
- `txHash`
- `mintedAt`

**InvestmentAnomalyFlag:**

- `investmentId`
- `signalType`
- `severity`
- `score`
- `reviewedBy`
- `reviewedAt`
- `flaggedAt`

### 5.6 Database rules

- M2 owns and edits only `m2-marketplace.prisma`.
- Use module-prefixed enum names, such as `EscrowState`.
- Use `@@map()` for database table names.
- Table names:
  - `investments`
  - `escrow_ledger`
  - `escrow_state_transitions`
  - `p2p_transfers`
  - `investment_nfts` (Sprint 4)
  - `investment_anomaly_flags` (Sprint 4)
- Use plain `String` identifiers for cross-module references.
- Add indexes for `projectId` and `investorId`.
- Do not add Prisma relations to M1 or M4 models.
- Validate cross-module references through their exported service functions.
- Do not add a `fundedAmount` column to M4's projects table.
- Do not implement investment or escrow business logic in Sprint 1. Sprint 1 introduces the required models.
- A pure escrow state-machine function with unit tests and no database access is allowed in Sprint 1.

### 5.7 Database model creation plan

| Model                 | Create in |
| --------------------- | --------- |
| Investment            | Sprint 1  |
| EscrowRecord          | Sprint 1  |
| EscrowStateTransition | Sprint 1  |
| P2PTransfer           | Sprint 1  |
| InvestmentNft         | Sprint 4  |
| InvestmentAnomalyFlag | Sprint 4  |

**Sprint 1 migration scope:**

Only these four models will be included in the Sprint 1 migration:

1. `Investment`
2. `EscrowRecord`
3. `EscrowStateTransition`
4. `P2PTransfer`

`InvestmentNft` and `InvestmentAnomalyFlag` must not be included in the Sprint 1 migration.

Wait for M1 and M4 schema changes to merge into `develop` before generating the M2 migration.

Migration command:

```powershell
npm run db:migrate -- --name m2_investments
```

Do not modify migrations already merged by another module.

---

## 6. M5 Audit Event Definitions

M2 sends audit events through:

`auditService.anchor(type, refId, data)`

M2 must use the event types defined in M5's `AnchorType`:

- `INVESTMENT_CREATED`
- `ESCROW_STATE_CHANGED`
- `OWNERSHIP_TRANSFER`

These event types were agreed with M5 on 2026-11-22.

### 6.1 INVESTMENT_CREATED

**Purpose:**

Records the creation of an investment and its initial PENDING escrow record.

**Trigger:**

After the investment and initial PENDING escrow record are successfully created and the database transaction commits.

**refId:**

Investment ID.

**Data payload:**

```ts
{
  investorId: string;
  projectId: string;
  amount: number;
  trustIndexSnapshot: number | null;
}
```

The initial PENDING escrow state is covered by this event. Do not create a separate `ESCROW_STATE_CHANGED` event for the initial PENDING state.

### 6.2 ESCROW_STATE_CHANGED

**Purpose:**

Records subsequent escrow state changes.

**Trigger:**

Whenever an escrow record changes to one of these states:

- `COMMITTED`
- `LOCKED`
- `RELEASED`
- `CANCELLED`

**refId:**

Escrow state transition row ID.

**Data payload:**

```ts
{
  escrowId: string;
  investmentId: string;
  projectId: string;
  from: EscrowState;
  to: EscrowState;
  actor: string; // user id or 'system'
  reason: string;
  transitionHash: string; // computed by M2 when the row is inserted (see 5.3)
}
```

Each state transition must generate its own audit event.

### 6.3 OWNERSHIP_TRANSFER

**Purpose:**

Records a peer-to-peer investment ownership transfer.

**Trigger:**

After the ownership transfer is successfully committed.

**refId:**

P2P transfer ID.

**Data payload:**

```ts
{
  investmentId: string;
  fromInvestorId: string;
  toInvestorId: string;
  amount: number;
}
```

### 6.4 Audit processing rules

1. Call `auditService.anchor()` only after the related database transaction commits.
2. Never call it inside a database transaction.
3. Use a unique `refId` for each logical event.
4. Repeated delivery of the same logical event must not create duplicate audit records. M5 is responsible for enforcing deduplication (confirm this is written in M5's contract).
5. Audit failures must not be treated as successful blockchain anchoring. A failed anchor never undoes the state change.
6. Follow M5's pending and retry handling for temporary anchoring failures.
7. Do not send raw documents, document contents, personal names, addresses, raw GPS coordinates or other unnecessary personal information in audit payloads.
8. Do not create a separate minting event. NFT minting is handled through M5's `auditService.mint()` in Sprint 4. M2 requests the mint after the escrow reaches `COMMITTED` and stores the returned `nftId` and `txHash` in `InvestmentNft`. The `escrowRef` passed to `mint()` is the escrow record ID.

---

## 7. Sprint Implementation Plan

### Sprint 1 – Public Marketplace

**Backend:**

- Update this contract.
- Implement `GET /listings`.
- Implement `GET /listings/:projectId`.
- Integrate with M4's projectService.
- Filter public projects by status.
- Return only approved public fields.
- Set `fundedAmount` to zero; `trustIndex`, `riskRank` to null; `certificateStatus` to `'none'`.
- Add tests using Vitest and Supertest.
- Update Postman collection.
- Add the four Sprint 1 M2 Prisma models (Sections 5.1–5.4) and the `EscrowState` enum after M1 and M4 schema changes are merged.
- Do not add `InvestmentNft` or `InvestmentAnomalyFlag` to the Sprint 1 migration. These models are added in Sprint 4.
- Optional: the pure state-machine function (2.3) with unit tests for every pair of states.

**Frontend:**

- Build the Explore Projects page.
- Display project cards.
- Display funding progress using `fundedAmount` and `fundingGoal`.
- Implement project search and filtering (in the frontend).
- Implement loading, empty and error states.
- Build the project overview page.
- Use mock data until the backend listing endpoints are available.
- Update `types.ts` and `mocks.ts` for the new Listing fields.

**Audit:**

Document future M2 audit events. Investment and escrow audit functionality will be implemented in later sprints.

### Sprint 2 – Investing

- Decide D1 (release rule) with M4 and write it in Section 2.2.
- Implement `POST /investments`, `commit` (with automatic lock), `cancel`, `GET /investments/mine`, `GET /investments/:id`.
- Validate investor login and verification.
- Create Investment records with `trustIndexSnapshot`.
- Create initial PENDING EscrowRecord records.
- Write transition rows with the hash chain, using one transaction per state change.
- Calculate `fundedAmount` from COMMITTED, LOCKED and RELEASED investments; derive the listing status.
- Send `INVESTMENT_CREATED` and `ESCROW_STATE_CHANGED` audit events.
- Email on state change if a shared notification service exists.

### Sprint 3 – Escrow Release

- Integrate M3 risk checking.
- Process approved progress reports from M4 (idempotent, with REJECTED and BLOCKED results).
- Release or block escrow funds.
- Record escrow state transitions.
- Implement escrow history endpoint (admin).
- Send `ESCROW_STATE_CHANGED` audit events.
- Add `?sort=risk` once the Trust Index is live.

### Sprint 4 – P2P Ownership Transfer, NFT and Anomalies

- Implement peer-to-peer investment transfers in one transaction.
- Update investment ownership.
- Record P2P transfer information.
- Send `OWNERSHIP_TRANSFER` audit events.
- Add the `InvestmentNft` model and migration.
- Request NFT minting through M5 after the agreed investment state is reached.
- Add the `InvestmentAnomalyFlag` model and migration.
- Implement the anomaly detector v1 and the Admin anomaly routes.

---

## 8. Testing Requirements

Every implemented M2 route and exported service function must have tests.

**Sprint 1 tests must cover:**

- M2 health endpoint returns HTTP 200.
- GET `/listings` returns eligible public projects.
- GET `/listings` excludes draft projects.
- GET `/listings` excludes completed projects.
- GET `/listings` returns an empty array when no eligible projects exist.
- GET `/listings/:projectId` returns an eligible project.
- GET `/listings/:projectId` returns HTTP 404 for a missing project.
- GET `/listings/:projectId` returns HTTP 404 for a draft project.
- GET `/listings/:projectId` returns HTTP 404 for a completed project.
- Public responses do not contain document file URLs.
- `fundedAmount` is zero in Sprint 1.
- A project that M4 reports as `funded` is returned as `funded` even though `fundedAmount` is zero.
- A project that M4 reports as `open` is returned as `open` in Sprint 1.
- `listingService.list()` returns the expected public listing information.
- Public responses do not contain `companyId`.

**Sprint 2 and later tests must cover:**

- All 25 pairs of states (allowed and not allowed).
- Amount <= 0, unknown project, project not open, amount above remaining funding.
- A non-investor gets 403; an unverified investor gets 403; another investor's investment gets 403.
- Committing twice gets 409.
- The transaction rolls back when the log insert fails.
- Releasing twice with the same `reportId` releases once.
- Release is rejected when nothing is `LOCKED`, and blocked on high risk.
- A P2P transfer rolls back when a step fails.

**Testing framework:**

- Vitest
- Supertest

---

## 9. Open Agreements (other owners must confirm)

These items need agreement from other module owners. Until an owner confirms, the status stays **Pending**. When agreed, change it to `Agreed (date, link to the comment or pull request)`.

| #   | Item                                                                                                                                                                                             | With             | Needed by                                  | Status                                     | Until agreed                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 1   | M4 `ProjectSummary` adds `district`, `cropType`, `expectedReturnPct`, `durationMonths`, `photoUrl`, `anchorId` and `companyId`. M2 maps the M4 fields to its public Listing fields.              | M4               | Sprint 1 (before the listing PR is merged) | Pending                                    | M2 tests use a mocked `projectService`. Do not merge the listing PR until M4's service returns these fields. |
| 2   | M4 `listOpen()` returns projects with status `open` and `funded`                                                                                                                                 | M4               | Sprint 1                                   | Pending                                    | Same as above.                                                                                               |
| 3   | M4 alone sets and changes the project status. M2 never writes it (see Listing status)                                                                                                            | M4               | Sprint 1                                   | Pending                                    | Follow the rule in 2.1.                                                                                      |
| 4   | Release rule D1 (final milestone or tranches) and `projectService.isFinalMilestoneReport(reportId)`                                                                                              | M4               | Before Sprint 2                            | Pending                                    | Do not start `release()`.                                                                                    |
| 5   | M4 calls `escrowService.release()` only after its approval is committed, and handles `BLOCKED` and `REJECTED`                                                                                    | M4               | Sprint 3                                   | Pending                                    | –                                                                                                            |
| 6   | `userService.getVerified(userId)`: verified means KYC approved. Until Sprint 3, all users count as verified.                                                                                     | M1               | Sprint 2                                   | Agreed (2026-11-24, reviewer confirmation) | Use the existing verified stub until KYC is implemented.                                                     |
| 7   | `certificateService.getStatus(companyId)` will be available in Sprint 4 when certificate functionality is implemented.                                                                           | M1               | Sprint 4                                   | Agreed (2026-11-24, reviewer confirmation) | Keep `certificateStatus` as `'none'` until then.                                                             |
| 8   | Keep both `admin` and `regulator` roles. Admin handles review operations; regulator only views dashboards. M2 admin routes use `admin`.                                                          | M1 / team leader | Sprint 2                                   | Agreed (2026-11-24, reviewer confirmation) | Use `admin` for M2 admin routes.                                                                             |
| 9   | M5 `AnchorType` contains `INVESTMENT_CREATED`, `ESCROW_STATE_CHANGED`, `OWNERSHIP_TRANSFER`; `INVESTMENT_FUNDED` and `ESCROW_RELEASED` have been removed.                                        | M5               | Before Sprint 2                            | Agreed (PR #42 merged)                     | Use the confirmed event types.                                                                               |
| 10  | M5 removes duplicates by `(type, refId)`                                                                                                                                                         | M5               | Sprint 2                                   | Pending                                    | –                                                                                                            |
| 11  | `trustIndexService.get(companyId)` returns a `TrustIndex` object containing `companyId`, `score`, `components`, and `updatedAt`; M2 reads `.score`. Add `getMany(companyIds)` for batch ranking. | M5               | Sprint 2 (`get`), Sprint 3 (`getMany`)     | Pending                                    | `trustIndex` and `riskRank` stay `null` until marketplace integration is ready.                              |
| 12  | `auditService.mint()`: called after COMMITTED, `escrowRef` is the escrow record id, returns `nftId` and `txHash`                                                                                 | M5               | Sprint 4                                   | Pending                                    | –                                                                                                            |
| 13  | `scamService.riskCheck()` levels: high blocks, medium proceeds with the level in the reason                                                                                                      | M3               | Sprint 3                                   | Pending                                    | –                                                                                                            |
| 14  | A shared notification service for emails on state changes                                                                                                                                        | Team leader      | Sprint 2                                   | Pending                                    | Log the event only.                                                                                          |

---

## 10. Change Log

- 2026-11-19: Created from the Week 0 scaffold stubs.
- 2026-11-23: Updated for Sprint 1 public marketplace requirements, M4 project integration, M2 listing response fields, future investing requirements, database ownership, and M5 audit event definitions.
- 2026-11-23: Listing status now starts from M4's status and can only be raised to `funded`, fixing the Sprint 1 case where `fundedAmount` is `0`. Added Section 9, Open Agreements.
- 2026-11-23: Added escrow states and transitions, release result `REJECTED` and idempotency, release rule D1, investor routes, error codes, Listing fields `trustIndex`, `riskRank` and `certificateStatus`, definition of `fundedAmount`, append-only log with hash chain, Decimal for money, and extra database models.
- 2026-11-24: Updated database scope. `Investment`, `EscrowRecord`, `EscrowStateTransition` and `P2PTransfer` are Sprint 1 models. `InvestmentNft` and `InvestmentAnomalyFlag` are deferred to Sprint 4 and will be added with their functionality.
- 2026-11-24: Updated M4 `ProjectSummary` field names and M2 public field mappings; corrected the M5 `TrustIndex` response structure; clarified M1 verification, certificate status and role agreements; and marked M5 audit event agreement as completed after PR #42 merged.
