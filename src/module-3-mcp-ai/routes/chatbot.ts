import { Router } from 'express';
import chatbotController from '../../controllers/ChatbotController';

const router = Router();

router.get('/', (req, res) => chatbotController.getChatbot(req, res));

export default router;
