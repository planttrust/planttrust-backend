import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/projects
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'projects API is working (scaffolded)' });
});

export default router;
