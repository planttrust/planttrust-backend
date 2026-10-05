const express = require('express');
const router = express.Router();

// @route GET /api/audit
router.get('/', (req, res) => {
  res.json({ message: 'audit API is working (scaffolded)' });
});

module.exports = router;
