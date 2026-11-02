import { Router } from 'express';
import auditController from '../../controllers/AuditController';

const router = Router();

router.get('/', (req, res) => auditController.getTrustIndex(req, res));
router.get('/:projectId', (req, res) => auditController.getTrustIndex(req, res));

export default router;
