import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/listings
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'listings API is working (scaffolded)' });
});

export default router;
