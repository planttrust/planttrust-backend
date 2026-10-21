// ─── Background Jobs ────────────────────────────────────────────────────
// This directory holds background job processors for:
//   - Blockchain anchoring (periodic hash anchoring to XRPL)
//   - Vision AI processing (document field extraction via Vision LLM)
//   - AI inference (scam scoring, chatbot training, etc.)
//
// Each job should export a function that can be invoked by a scheduler
// (e.g. node-cron, BullMQ worker, or a simple setInterval).
//
// Example:
//   module.exports = { start: () => { ... }, stop: () => { ... } };
