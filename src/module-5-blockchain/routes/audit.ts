import { Router } from 'express';
import auditController from '../../controllers/AuditController';

const router = Router();

router.get('/', (req, res) => auditController.getAudit(req, res));
router.post('/anchor', (req, res) => auditController.anchor(req, res));
router.post('/mint', (req, res) => auditController.mint(req, res));

export default router;
