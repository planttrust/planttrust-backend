import { Request, Response } from 'express';
import geofenceService, { GeofenceService } from '../services/GeofenceService';

export class GeofenceController {
  constructor(private service: GeofenceService = geofenceService) {}

  public getProjects(req: Request, res: Response): void {
    res.json(this.service.getProjectsStatus());
  }

  public getReports(req: Request, res: Response): void {
    res.json(this.service.getReportsStatus());
  }

  public getGeofence(req: Request, res: Response): void {
    res.json(this.service.getGeofenceStatus());
  }

  public checkLocation(req: Request, res: Response): void {
    try {
      const { polygon, point } = req.body || {};
      if (!Array.isArray(polygon) || !point || typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
        res.status(400).json({ error: 'polygon (Coordinate[]) and point ({ latitude, longitude }) are required' });
        return;
      }
      const isInside = this.service.verifyLocation(polygon, point);
      res.json({
        isInside,
        point,
        vertexCount: polygon.length,
        algorithm: 'ray-casting',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Invalid geofence check payload' });
    }
  }
}

export default new GeofenceController();
