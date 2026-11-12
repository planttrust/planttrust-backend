import { Router } from 'express';
import chatbotController from '../../controllers/ChatbotController';

const router = Router();

router.get('/', (req, res) => chatbotController.getScam(req, res));
router.post('/check', (req, res) => chatbotController.checkScam(req, res));

export default router;
