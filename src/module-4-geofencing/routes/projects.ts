import { Router } from 'express';
import geofenceController from '../../controllers/GeofenceController';

const router = Router();

router.get('/', (req, res) => geofenceController.getProjects(req, res));

export default router;
