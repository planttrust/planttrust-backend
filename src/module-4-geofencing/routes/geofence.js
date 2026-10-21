const express = require('express');
const router = express.Router();

// @route GET /api/geofence
router.get('/', (req, res) => {
  res.json({ message: 'geofence API is working (scaffolded)' });
});

module.exports = router;
