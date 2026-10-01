# Module 3 — MCP-Driven Explainable AI & Chatbot

**Owner:** Imesha Ariyawansha

## Scope

This module provides the AI reasoning layer: a custom MCP server, a compliance rule engine, scam-detection classifiers, and the investor-facing chatbot.

### Frontend
- Chatbot interface (multi-turn conversation, context-aware suggestions)
- Scam-monitoring input UI (admin can submit new typologies, review flagged patterns)
- Contract risk-flag display (clause-level risk annotations on investment contracts)

### Backend
- MCP server built from scratch (JSON-RPC bridge between LLM and scoped query tools)
- Scoped query tools: each tool reads from one module's contract API, never raw DB
- Input validation and output sanitisation layer
- Chatbot session management API

### Database
- `contract_clauses` table (parsed clause text, risk flags, source contract)
- `risk_flags` table (flag type, severity, linked clause, resolution status)
- `chatbot_conversations` table (session state, message history, context window)
- `scam_typologies` table (known patterns: Ponzi structure, land-title recycling, etc.)

### AI
- Rule-based CBSL compliance engine (checks contract clauses against regulatory rules)
- Typology-matching scam classifier (compares project/investment patterns to known scam shapes)
- LLM prompt engineering for cross-validation (multiple prompt strategies, confidence scoring)
- Explainability layer: every AI decision includes a human-readable reasoning trace

### Blockchain
- Scam-flag hashing (every flag raised is hashed into Module 5's audit trail)
- Audit Log Retrieval feature: queryable proof-of-inclusion view that lets admins verify any past flag was genuinely recorded on-chain

## Local Development

```bash
cd module-3-mcp-ai
npm install
npm run dev
```

Or from the repo root:
```bash
docker-compose up module-3
```

## API Contracts

See `contracts/module-3-mcp-ai.md` for the endpoints this module exposes to others.
