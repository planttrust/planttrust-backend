const express = require('express');
const router = express.Router();

// @route GET /api/mcp
router.get('/', (req, res) => {
  res.json({ message: 'mcp API is working (scaffolded)' });
});

module.exports = router;
