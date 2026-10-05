const express = require('express');
const router = express.Router();

// @route GET /api/transfers
router.get('/', (req, res) => {
  res.json({ message: 'transfers API is working (scaffolded)' });
});

module.exports = router;
