import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/reports
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'reports API is working (scaffolded)' });
});

export default router;
