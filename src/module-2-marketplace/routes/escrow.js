const express = require('express');
const router = express.Router();

// @route GET /api/escrow
router.get('/', (req, res) => {
  res.json({ message: 'escrow API is working (scaffolded)' });
});

module.exports = router;
