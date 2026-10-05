const express = require('express');
const router = express.Router();

// @route GET /api/scam
router.get('/', (req, res) => {
  res.json({ message: 'scam API is working (scaffolded)' });
});

module.exports = router;
