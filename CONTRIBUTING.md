# Contributing to PlanTrust

This document is the working agreement for the team: how branches, pull requests, and weekly integration actually happen. It exists so integration is a habit, not a single stressful event near the deadline.

## Core principle

Modules talk to each other only through defined APIs (see `contracts/`) — never by one module reading another module's database tables directly. This keeps each module's internals free to change without breaking the other four.

## Branching model

- **`main`** — always stable and demo-ready. Protected: PR + review required, no direct pushes.
- **`develop`** — the shared weekly integration baseline. Protected: PR + at least one review required.
- **`feature/<module>/<short-ticket-name>`** — one branch per GitHub issue, branched from `develop`, merged back into `develop` via PR.

`main` only gets updated from `develop` after that checkpoint's integration test has passed.

## Opening a pull request

1. Branch from the latest `develop`.
2. Keep the PR scoped to one GitHub issue/ticket where possible.
3. Target `develop`, not `main`.
4. Tag the module owner most likely to be affected as reviewer (CODEOWNERS will often do this automatically).
5. Don't merge your own PR without at least one review.

## Defining a contract before building against another module

1. Check `contracts/` for the module you depend on. If a spec already exists, build against it.
2. If it doesn't exist yet, write a short one yourself (see `contracts/TEMPLATE.md`), and get a quick thumbs-up from that module's owner that it matches what they intend to build.
3. Build against a mock/stub matching that exact shape (hardcoded JSON response, or a simple stub endpoint) so you're not blocked waiting for the real thing.
4. When the real endpoint is ready, swap the URL you're calling — nothing else should need to change, because the shape was agreed in advance.

## Weekly integration ritual

Run this every week, tied to the checkpoint schedule:

1. **Freeze and pull** — finish your tickets, push to your feature branch, open a PR against `develop`. No new feature work starts until integration is done.
2. **Merge in dependency order** — Module 1 first (others depend on it), then Modules 2 and 4 in parallel, then Module 3, then Module 5 last (it consumes everyone else's output).
3. **Pair on conflicts live** — whoever owns each side of a conflict resolves it together on a short call.
4. **Run that week's smoke test** — actually execute the checkpoint's target feature end-to-end against merged `develop`.
5. **Demo to the team** — whoever's module was central to that week's integration walks the others through it.
6. **Log tickets and flag blockers** — update the GitHub issue tracker; flag anything under ~50% complete immediately, don't wait.
7. **Re-baseline** — once verified, `develop` is the new starting point for next week's tickets.

## Commit messages

Keep them specific enough that "who did what" is legible from `git log` alone — this is part of how individual contribution gets evidenced to the panel. Prefer `module-2: implement escrow COMMITTED state transition` over `fix stuff`.
