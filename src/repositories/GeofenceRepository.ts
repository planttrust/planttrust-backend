import db from '../shared/db';
import { Coordinate } from '../domain/GeofencePolygon';

export interface GeofenceProjectRecord {
  id?: string;
  companyId?: string;
  projectId?: string;
  name: string;
  polygonCoordinates: Coordinate[] | [number, number][];
  createdAt?: string;
}

export interface ProgressReportRecord {
  id?: string;
  projectId: string;
  companyId: string;
  milestoneIndex?: number;
  title: string;
  description?: string;
  imageUrl: string;
  exifLatitude?: number;
  exifLongitude?: number;
  isGeofenceValid?: boolean;
  dhash?: string;
  antiSpoofingScore?: number;
  status?: string;
  xrplTxHash?: string;
  createdAt?: string;
}

export interface IGeofenceRepository {
  findProjectGeofence(projectId: string): Promise<GeofenceProjectRecord | null>;
  createProjectGeofence(record: GeofenceProjectRecord): Promise<GeofenceProjectRecord>;
  createProgressReport(report: ProgressReportRecord): Promise<ProgressReportRecord>;
  findReportsByProject(projectId: string): Promise<ProgressReportRecord[]>;
}

export class GeofenceRepository implements IGeofenceRepository {
  public async findProjectGeofence(projectId: string): Promise<GeofenceProjectRecord | null> {
    const res = await db.query('SELECT * FROM geofence_projects WHERE project_id = $1 LIMIT 1', [projectId]);
    if (!res.rows || res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      companyId: r.company_id,
      projectId: r.project_id,
      name: r.name,
      polygonCoordinates: r.polygon_coordinates,
      createdAt: r.created_at,
    };
  }

  public async createProjectGeofence(record: GeofenceProjectRecord): Promise<GeofenceProjectRecord> {
    const res = await db.query(
      `INSERT INTO geofence_projects (company_id, project_id, name, polygon_coordinates)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [record.companyId || null, record.projectId || null, record.name, JSON.stringify(record.polygonCoordinates)]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      companyId: r.company_id,
      projectId: r.project_id,
      name: r.name,
      polygonCoordinates: r.polygon_coordinates,
      createdAt: r.created_at,
    };
  }

  public async createProgressReport(report: ProgressReportRecord): Promise<ProgressReportRecord> {
    const res = await db.query(
      `INSERT INTO progress_reports
       (project_id, company_id, milestone_index, title, description, image_url, exif_latitude, exif_longitude, is_geofence_valid, dhash, anti_spoofing_score, status, xrpl_tx_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        report.projectId,
        report.companyId,
        report.milestoneIndex || 1,
        report.title,
        report.description || null,
        report.imageUrl,
        report.exifLatitude || null,
        report.exifLongitude || null,
        report.isGeofenceValid ?? false,
        report.dhash || null,
        report.antiSpoofingScore || 0,
        report.status || 'SUBMITTED',
        report.xrplTxHash || null,
      ]
    );
    return res.rows[0];
  }

  public async findReportsByProject(projectId: string): Promise<ProgressReportRecord[]> {
    const res = await db.query('SELECT * FROM progress_reports WHERE project_id = $1 ORDER BY milestone_index ASC', [projectId]);
    return res.rows || [];
  }
}

export default new GeofenceRepository();
