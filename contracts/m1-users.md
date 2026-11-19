# Contract: m1-users

**Owner:** Nimsara · **Last updated:** 2026-11-19

## Exported functions (for other modules)

Other modules import these only from `src/modules/m1-users/m1.service.ts`.
The shared `requireAuth` / `requireRole` middleware, `signToken`, `setSessionCookie` and
`clearSessionCookie` live in `src/shared/auth.ts`.

## Login session (httpOnly cookie)

The browser never sees the login token. M1's routes manage it as a cookie:

- `POST /login`: checks the password, then `setSessionCookie(res, signToken({ id, role }))`.
  The cookie `plantrust_session` is `HttpOnly`, `SameSite=Lax`, 8 hours, `Secure` when `COOKIE_SECURE=true`.
- `POST /logout`: `clearSessionCookie(res)`, then `204`.
- `GET /me` (`requireAuth`): returns `{ id, role, name }` for the logged-in user, or `401`.
  The frontend's `AuthProvider` calls it to find out who is logged in.

`requireAuth` reads the cookie first and falls back to an `Authorization: Bearer <token>` header
(for Postman, tests and M3's MCP tools).

### `userService.getById(userId: string): Promise<UserSummary | null>`

- **What it does:** returns what other modules may know about a user, or `null` if the id doesn't exist.
- **Called by:** M2, M3, M5
- **Status:** stub (returns a demo user) until M1 reads the users table in Sprint 1.
- **Returns:** `{ id, role: 'investor' | 'company' | 'admin' | 'regulator', name, verified }`

### `userService.getVerified(userId: string): Promise<UserSummary | null>`

- **What it does:** returns the user only if their verification (KYC / company approval) is approved, otherwise `null`.
- **Called by:** M2 (before funding), M4
- **Status:** stub (everyone counts as verified) until the review queue in Sprint 3.
- **Returns:** same as `getById`.

## HTTP routes (for the frontend)

Base path: `/api/users`

| Method | Path      | Auth / role | Request body | Response             |
| ------ | --------- | ----------- | ------------ | -------------------- |
| GET    | `/health` | none        | –            | `{ module, status }` |

Planned: `POST /register`, `POST /login`, `POST /logout`, `GET /me` (Sprint 1), `POST /documents` (Sprint 2),
`POST /admin/review/:docId` (Sprint 3), `GET /certificates/:id/verify` (public, Sprint 4).

## Database tables (owned by this module)

To be added in Sprint 1 in `prisma/schema/m1-users.prisma`: users, investor / company / admin profiles,
documents, certificates.

## Change log

- 2026-11-19: created from the Week 0 scaffold stubs.
- 2026-11-19: login session moved to an httpOnly cookie; added `POST /logout` and the `/me` response shape.
