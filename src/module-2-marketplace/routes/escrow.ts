import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/escrow
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'escrow API is working (scaffolded)' });
});

export default router;
