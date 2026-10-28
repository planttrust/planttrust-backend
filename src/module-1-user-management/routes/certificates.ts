import { Router } from 'express';
import documentController from '../../controllers/DocumentController';

const router = Router();

router.get('/', (req, res) => documentController.getCertificates(req, res));

export default router;
