# Shared Utilities (`src/shared/`)

This directory provides cross-cutting infrastructure and reusable utilities consumed across all five modules:

| Utility | File | Purpose |
|---|---|---|
| **Database Pool** | `db.js` | PostgreSQL connection pool wrapper with unified `.query(sql, params)` interface. |
| **Authentication Middleware** | `auth-middleware.js` | `verifyToken` (JWT validation) and `requireRole(role)` route protection guards. |
| **Global Error Handling** | `error-handler.js` | Express `notFoundHandler` (404) and `globalErrorHandler` (500) formatting consistent JSON errors. |
| **Cryptographic Hashing** | `hash.js` | Deterministic SHA-256 event hasher (`hashEvent(data)`) for all audit events. |
| **Structured Logger** | `logger.js` | Pino structured JSON logger with pretty-printing for development. |
