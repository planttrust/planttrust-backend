# Background Jobs (`src/jobs/`)

Background jobs handle asynchronous or periodic workloads that should not block HTTP request/response lifecycles:

- **XRPL Batch Anchoring:** Periodically collects pending hashes from `audit_trail`, builds a Merkle tree, and submits an anchor transaction to the XRPL Testnet.
- **Vision AI Document Worker:** Processes queued PDF/image documents through Vision LLM (Gemini / GPT-4o) and saves structured JSON fields + confidence scores.
- **AI Scoring & Scam Watch:** Recalculates Trust Index scores and checks external URL registry updates against scam patterns.
