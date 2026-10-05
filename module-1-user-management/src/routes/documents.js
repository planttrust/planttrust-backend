const express = require('express');
const router = express.Router();

// @route GET /api/documents
router.get('/', (req, res) => {
  res.json({ message: 'documents API is working (scaffolded)' });
});

module.exports = router;
