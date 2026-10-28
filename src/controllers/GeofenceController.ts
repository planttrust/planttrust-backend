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
}

export default new GeofenceController();
