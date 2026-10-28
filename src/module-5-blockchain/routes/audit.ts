import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/audit
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'audit API is working (scaffolded)' });
});

export default router;
