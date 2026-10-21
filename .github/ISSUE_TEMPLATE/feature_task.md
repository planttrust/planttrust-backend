---
name: Module Feature Task
about: Track a planned module feature or checkpoint milestone
title: "[M<X>]: "
labels: ["enhancement"]
assignees: ""
---

### Module & Owner
- **Module:** M1 / M2 / M3 / M4 / M5
- **Owner:** @assignee
- **Target Checkpoint:** CP 1 / 2 / 3 / 4 / 5 / 6 / 7 (Weeks X–Y)

### Task Description
A concise description of the feature or API endpoint to build.

### Deliverables
- [ ] Routes / Controller / Service implementation in `src/module-<X>/`
- [ ] Database updates in `src/database/init.sql` (if applicable)
- [ ] Contract compliance according to `contracts/module-<X>.md`
- [ ] Unit/Integration tests in `tests/`
- [ ] Verified via `npm test`

### Inter-Module Dependencies & Mocks
- **Calls endpoints in:** (e.g., Module 5 `/api/audit/anchor` or None)
- **Mock strategy until dependency lands:** (e.g., mock fixed success)
