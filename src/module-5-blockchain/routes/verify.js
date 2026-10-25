const express = require('express');
const router = express.Router();

// @route GET /api/verify or /api/audit/verify
router.get('/', (req, res) => {
  res.json({ message: 'verify API is working (scaffolded)' });
});

// @route GET /api/verify/:anchorId or /api/audit/verify/:anchorId
router.get('/:anchorId', (req, res) => {
  res.json({
    anchorId: req.params.anchorId,
    dataHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    merkleRoot: '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9',
    merkleProof: [],
    txHash: null,
    verified: false,
    status: 'UNVERIFIED_SCAFFOLD',
    isMock: true,
    message: 'Scaffolded verification - live XRPL Testnet verification will be enabled in Checkpoint 2',
    explorerUrl: null,
  });
});

module.exports = router;