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
    score: 94,
    trustScore: 94,
    grade: 'A+',
    isMock: true,
    status: 'SCAFFOLD_MOCK',
    message: 'Scaffolded Trust Index - live multi-factor computation will be enabled in Checkpoint 2',
    components: {
      kycVerification: 25,
      escrowDiscipline: 30,
      milestoneReality: 39,
      complianceScore: 20,
      documentVerification: 96,
      escrowHealth: 95,
      geofencePassRate: 98,
    },
    lastUpdated: new Date().toISOString(),
  });
});

module.exports = router;