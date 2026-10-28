import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/documents
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'documents API is working (scaffolded)' });
});

export default router;
