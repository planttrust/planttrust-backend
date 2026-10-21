const express = require('express');
const router = express.Router();

// @route GET /api/trust-index
router.get('/', (req, res) => {
  res.json({ message: 'trust-index API is working (scaffolded)' });
});

module.exports = router;
