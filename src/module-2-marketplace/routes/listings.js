const express = require('express');
const router = express.Router();

// @route GET /api/listings
router.get('/', (req, res) => {
  res.json({ message: 'listings API is working (scaffolded)' });
});

module.exports = router;
