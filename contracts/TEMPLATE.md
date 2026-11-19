# Contract: mX-name

**Owner:** <name> · **Last updated:** <date>

## Exported functions (for other modules)

Other modules import these only from `src/modules/mX-name/mX.service.ts`.

### `serviceName.functionName(arg: Type): Promise<ReturnType>`

- **What it does:** …
- **Called by:** M?
- **Status:** stub | real (since Sprint N)
- **Returns / errors:** …

## HTTP routes (for the frontend)

Base path: `/api/<prefix>`

| Method | Path      | Auth / role | Request body | Response             |
| ------ | --------- | ----------- | ------------ | -------------------- |
| GET    | `/health` | none        | –            | `{ module, status }` |

## Database tables (owned by this module)

Defined in `prisma/schema/mX-name.prisma`. Other modules never read them directly.

## Change log

- YYYY-MM-DD: …
