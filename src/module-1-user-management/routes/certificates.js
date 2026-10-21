const express = require('express');
const router = express.Router();

// @route GET /api/certificates
router.get('/', (req, res) => {
  res.json({ message: 'certificates API is working (scaffolded)' });
});

module.exports = router;
