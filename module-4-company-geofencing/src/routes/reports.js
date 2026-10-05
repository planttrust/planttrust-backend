const express = require('express');
const router = express.Router();

// @route GET /api/reports
router.get('/', (req, res) => {
  res.json({ message: 'reports API is working (scaffolded)' });
});

module.exports = router;
