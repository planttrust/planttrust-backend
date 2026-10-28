import { Router } from 'express';
import auditController from '../../controllers/AuditController';

const router = Router();

router.get('/', (req, res) => auditController.verify(req, res));
router.get('/:anchorId', (req, res) => auditController.verify(req, res));

export default router;
