import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/certificates
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'certificates API is working (scaffolded)' });
});

export default router;
