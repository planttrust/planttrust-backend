const express = require('express');
const router = express.Router();

// @route GET /api/verify or /api/audit/verify
router.get('/', (req, res) => {
  res.json({ message: 'verify API is working (scaffolded)' });
});

// @route GET /api/verify/:anchorId or /api/audit/verify/:anchorId
router.get('/:anchorId', (req, res) => {
  const txHash = '41738F3C5562711F68615024C49774780655F60B0E5A74FF83BC3F95F4D3C523';
  res.json({
    anchorId: req.params.anchorId,
    dataHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    merkleRoot: '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9',
    merkleProof: ['0000000000000000000000000000000000000000000000000000000000000000'],
    txHash: txHash,
    verified: true,
    explorerUrl: 'https://testnet.xrpl.org/transactions/' + txHash,
  });
});

module.exports = router;