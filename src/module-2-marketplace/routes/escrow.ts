import { Router } from 'express';
import marketplaceController from '../../controllers/MarketplaceController';

const router = Router();

router.get('/', (req, res) => marketplaceController.getEscrow(req, res));
router.post('/fund', (req, res) => marketplaceController.fundEscrow(req, res));
router.get('/:escrowId/history', (req, res) => marketplaceController.getEscrowHistory(req, res));

export default router;
