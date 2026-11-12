import { Router } from 'express';
import geofenceController from '../../controllers/GeofenceController';

const router = Router();

router.get('/', (req, res) => geofenceController.getGeofence(req, res));
router.post('/check', (req, res) => geofenceController.checkLocation(req, res));

export default router;
