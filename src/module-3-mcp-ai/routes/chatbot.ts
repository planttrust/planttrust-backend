import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/chatbot
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'chatbot API is working (scaffolded)' });
});

export default router;
