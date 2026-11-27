# Contract: m1-users

**Owner:** Nimsara · **Last updated:** 2026-11-24

## User ids in other modules

Every module stores a user as `users.id` (a plain `String` + `@@index`, no relation): M4's `companyId`,
M2's `investorId`, M3's `userId` and so on are all user ids, **not** `companies.id` or `investors.id`.
Check them with `userService.getById()` / `getVerified()`.

## Exported functions (for other modules)

Other modules import these only from `src/modules/m1-users/m1.service.ts`.
The shared `requireAuth` / `requireRole` middleware, `signToken`, `setSessionCookie` and
`clearSessionCookie` live in `src/shared/auth.ts`.

```ts
interface UserSummary {
  id: string;
  role: 'investor' | 'company' | 'admin' | 'regulator';
  name: string;
  verified: boolean;
}
```

### `userService.getById(userId: string): Promise<UserSummary | null>`

- **What it does:** returns what other modules may know about a user, or `null` if the id doesn't exist.
- **Called by:** M2, M3, M4, M5
- **Status:** stub (returns a demo user). Real from Sprint 1, reading the `users` table.
- **Returns:** `UserSummary | null`. `verified` is `true` for everyone until Sprint 3 (same as `getVerified`).

### `userService.getVerified(userId: string): Promise<UserSummary | null>`

- **What it does:** returns the user only if their verification is approved, otherwise `null`.
  "Verified" means KYC approved (investor) or company approval (company).
- **Called by:** M2 (before investing), M4 (before registering a project)
- **Status:** stub (everyone counts as verified) until the admin review queue in Sprint 3.
- **Returns:** same as `getById`.

### Planned

- `certificateService.getStatus(companyId): Promise<'active' | 'revoked' | 'none'>` (Sprint 4, with certificates).

## Login session (httpOnly cookie)

The browser never sees the login token. M1's routes manage it as a cookie:

- `POST /login` and `POST /register`: `setSessionCookie(res, signToken({ id, role }))`.
  The cookie `plantrust_session` is `HttpOnly`, `SameSite=Lax`, 8 hours, `Secure` when `COOKIE_SECURE=true`.
- `POST /logout`: `clearSessionCookie(res)`, then `204`.

`requireAuth` reads the cookie first and falls back to an `Authorization: Bearer <token>` header
(for Postman, tests and M3's MCP tools).

## HTTP routes (for the frontend)

Base path: `/api/users`

| Method | Path        | Auth / role   | Request body    | Response                          |
| ------ | ----------- | ------------- | --------------- | --------------------------------- |
| GET    | `/health`   | none          | –               | `{ module, status }`              |
| POST   | `/register` | none          | `RegisterInput` | `201 { id, role, name }` + cookie |
| POST   | `/login`    | none          | `LoginInput`    | `200 { id, role, name }` + cookie |
| POST   | `/logout`   | none          | –               | `204`                             |
| GET    | `/me`       | `requireAuth` | –               | `{ id, role, name }`              |

```ts
interface RegisterInput {
  role: 'investor' | 'company'; // admins and regulators are never created here
  name: string; // 2–100 chars
  email: string; // saved lowercase
  password: string; // 8–72 chars (72 is bcrypt's limit)
  company?: {
    // required when role is 'company', not allowed otherwise
    companyName: string; // 2–200 chars
    registrationNumber: string; // e.g. "PV 12345"
    contactEmail: string;
  };
}

interface LoginInput {
  email: string;
  password: string;
  role: 'investor' | 'company' | 'admin' | 'regulator'; // the workspace chosen on the login screen
}
```

### `POST /register`

- Creates the user and its profile (investor or company) in one transaction, with `kycStatus: 'pending'`.
- Logs the new user in straight away (sets the cookie), so onboarding continues without a second login.
- `400 VALIDATION_ERROR`: invalid input, or `company` missing for a company / sent for an investor.
- `403 FORBIDDEN`: `role` is `admin` or `regulator`.
- `409 CONFLICT`: the email or the company registration number is already used.

### `POST /login`

1. Wrong email **or** wrong password → `401 "Invalid credentials"` (same message for both, so nobody can
   find out which emails exist).
2. Right password but the account's role is not the chosen `role` → `403`, e.g.
   `"This account is not a company account"`.
3. Account `suspended` → `403 "This account is suspended"`.
4. Otherwise: sets the cookie and returns `{ id, role, name }`; the frontend opens that role's dashboard.

### `GET /me`

Returns `{ id, role, name }` for the logged-in user, or `401`. The frontend's `AuthProvider` calls it to
find out who is logged in.

### Errors

All errors use the shared shape `{ error: { code, message, details? } }`.

### Planned

- Sprint 2: `POST /documents`; email verification (`POST /verify-email/send`, `POST /verify-email`).
- Sprint 3: `POST /admin/review/:docId`; staff invitations (`POST /admin/invitations`, `POST /staff/activate`).
- Sprint 4: `GET /certificates/:id/verify` (public).

Until staff invitations exist, admin and regulator accounts come from the seed.

## Database tables (owned by this module)

Defined in `prisma/schema/m1-users.prisma`. Other modules never read them directly.

| Model      | Table       | Notes                                                                   |
| ---------- | ----------- | ----------------------------------------------------------------------- |
| `User`     | `users`     | every account: email (unique), bcrypt hash, name, role, status          |
| `Investor` | `investors` | one per investor user: `kycStatus`                                      |
| `Company`  | `companies` | one per company user: name, registration number (unique), contact email |
| `Admin`    | `admins`    | one per admin user (review queue from Sprint 3)                         |

Enums: `UserRole` (`investor`, `company`, `admin`, `regulator`), `UserStatus` (`active`, `suspended`),
`KycStatus` (`pending`, `approved`, `rejected`).

`users.emailVerifiedAt` stays empty until email verification in Sprint 2. Regulators have no profile table.
Planned tables: `documents` (Sprint 2), `email_verifications` (Sprint 2), `staff_invitations` (Sprint 3),
`certificates` (Sprint 4).

## Roles

- `admin`: reviews documents and does admin actions.
- `regulator`: read-only dashboards (M5).

## Change log

- 2026-11-19: created from the Week 0 scaffold stubs.
- 2026-11-19: login session moved to an httpOnly cookie; added `POST /logout` and the `/me` response shape.
- 2026-11-24: Sprint 1 routes and request/response shapes, login role check, the M1 tables, the user-id
  rule for other modules, and the planned email verification and staff invitations.
