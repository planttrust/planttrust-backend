# Module 3 — MCP-Driven Explainable AI & Chatbot

**Owner:** Imesha Ariyawansha  
**Base Route:** `/api/mcp`, `/api/chatbot`, `/api/scam`

---

## 1. Responsibilities

- **Model Context Protocol (MCP) Server:** JSON-RPC bridge allowing LLM agents to query scoped PlanTrust tools securely.
- **Explainable AI Chatbot:** Interactive assistant explaining platform risks, contracts, and investment queries.
- **Scam Classifier & Typology Matcher:** CBSL compliance rule engine and scam-url / text classifier.
- **Audit Log Retrieval:** Queryable chronological view of anchored risk flags with proof-of-inclusion display.

---

## 2. Directory Structure

```
module-3-mcp-ai/
├── routes/
│   ├── mcp.js             # JSON-RPC / tool query endpoints
│   ├── chatbot.js         # POST /message, GET /history
│   └── scam.js            # POST /scan, GET /typologies, POST /report
├── controllers/           # HTTP controllers
├── services/              # MCP server logic, rule engine, scam classifier
└── README.md
```

---

## 3. Database Tables (see `src/database/init.sql`)

- `scam_typologies` (UUID id, category, title, pattern, risk_weight, cbsl_rule_reference)
- `scam_reports` (UUID id, reported_by, target_url, risk_score, typology_matches, status)
- `chatbot_conversations` (UUID id, user_id, session_id, messages JSONB)

---

## 4. Inter-Module Contracts

- Calls Module 5 `POST /api/audit/anchor` when critical risk flags or scam typologies are confirmed.
- Queries Module 5 for proof-of-inclusion verification on behalf of the chatbot user.
