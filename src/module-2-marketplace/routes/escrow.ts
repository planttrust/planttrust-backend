import { Router } from 'express';
import marketplaceController from '../../controllers/MarketplaceController';

const router = Router();

router.get('/', (req, res) => marketplaceController.getEscrow(req, res));

export default router;
