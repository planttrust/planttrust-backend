import { Router } from 'express';
import auditController from '../../controllers/AuditController';

const router = Router();

router.get('/', (req, res) => auditController.getAudit(req, res));

export default router;
