const express = require('express');
const router = express.Router();

// @route GET /api/verify
router.get('/', (req, res) => {
  res.json({ message: 'verify API is working (scaffolded)' });
});

module.exports = router;
