import { GeofencePolygon, Coordinate } from '../domain/GeofencePolygon';

export class GeofenceService {
  public getProjectsStatus() {
    return { message: 'projects API is working (scaffolded)' };
  }

  public getReportsStatus() {
    return { message: 'reports API is working (scaffolded)' };
  }

  public getGeofenceStatus() {
    return { message: 'geofence API is working (scaffolded)' };
  }

  public verifyLocation(polygonCoords: Coordinate[], point: Coordinate): boolean {
    const polygon = new GeofencePolygon('Site Boundary', polygonCoords);
    return polygon.containsPoint(point);
  }
}

export default new GeofenceService();
