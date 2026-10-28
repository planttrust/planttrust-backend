import { Router, Request, Response } from 'express';

const router = Router();

// @route GET /api/geofence
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'geofence API is working (scaffolded)' });
});

export default router;
