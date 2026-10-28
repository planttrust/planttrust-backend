import { Router } from 'express';
import marketplaceController from '../../controllers/MarketplaceController';

const router = Router();

router.get('/', (req, res) => marketplaceController.getListings(req, res));

export default router;
