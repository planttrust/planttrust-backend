const express = require('express');
const router = express.Router();

// @route GET /api/chatbot
router.get('/', (req, res) => {
  res.json({ message: 'chatbot API is working (scaffolded)' });
});

module.exports = router;
