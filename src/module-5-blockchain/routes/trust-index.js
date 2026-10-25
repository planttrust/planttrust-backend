const express = require('express');
const router = express.Router();

// @route GET /api/trust-index or /api/audit/trust-index
router.get('/', (req, res) => {
  res.json({ message: 'trust-index API is working (scaffolded)' });
});

// @route GET /api/trust-index/:projectId or /api/audit/trust-index/:projectId
router.get('/:projectId', (req, res) => {
  res.json({
    projectId: req.params.projectId,
    trustScore: 94,
    components: {
      documentVerification: 96,
      escrowHealth: 95,
      complianceScore: 20,
      geofencePassRate: 98,
    },
    lastUpdated: new Date().toISOString(),
  });
});

module.exports = router;