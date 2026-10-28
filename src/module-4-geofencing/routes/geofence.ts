import { Router } from 'express';
import geofenceController from '../../controllers/GeofenceController';

const router = Router();

router.get('/', (req, res) => geofenceController.getGeofence(req, res));

export default router;
