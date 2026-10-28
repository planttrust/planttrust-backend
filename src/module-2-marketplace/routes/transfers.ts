import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/transfers
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'transfers API is working (scaffolded)' });
});

export default router;
