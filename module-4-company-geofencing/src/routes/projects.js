const express = require('express');
const router = express.Router();

// @route GET /api/projects
router.get('/', (req, res) => {
  res.json({ message: 'projects API is working (scaffolded)' });
});

module.exports = router;
