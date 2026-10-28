import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/scam
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'scam API is working (scaffolded)' });
});

export default router;
