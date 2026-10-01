# Shared Utilities

Common code used across all five modules. Import from here instead of duplicating logic.

## Contents

| File | Purpose |
|---|---|
| `xrpl-client.js` | XRPL Testnet connection, wallet loading, transaction submission helper |
| `auth-middleware.js` | JWT verification middleware, role guard (`requireRole('admin')`) |
| `db.js` | Database connection pool (reads `DATABASE_URL` from env) |
| `hash.js` | SHA-256 hashing utility used before submitting to Module 5's anchor API |
| `logger.js` | Structured JSON logger (pino-based), with `module` field for tracing |

## Usage

```javascript
// From any module's backend code:
const { verifyToken, requireRole } = require('../shared/auth-middleware');
const { hashEvent } = require('../shared/hash');
const { submitToAudit } = require('../shared/xrpl-client');
```

## Rules

- **No module-specific logic here.** If it only applies to one module, it belongs in that module's folder.
- **Changes to shared/ need review from at least two module owners** (enforced via CODEOWNERS).
