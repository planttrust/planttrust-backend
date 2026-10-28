import db from '../shared/db';
import { Project, ProjectStatus } from '../domain/Project';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  create(project: Project): Promise<Project>;
}

export class ProjectRepository implements IProjectRepository {
  public async findById(id: string): Promise<Project | null> {
    const res = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!res.rows || res.rows.length === 0) return null;
    const r = res.rows[0];
    return new Project(r.id, r.title, r.description, r.company_id, Number(r.target_amount), Number(r.raised_amount), r.status as ProjectStatus, Number(r.trust_score), r.created_at);
  }

  public async findAll(): Promise<Project[]> {
    const res = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    return (res.rows || []).map((r: any) => new Project(r.id, r.title, r.description, r.company_id, Number(r.target_amount), Number(r.raised_amount), r.status as ProjectStatus, Number(r.trust_score), r.created_at));
  }

  public async create(project: Project): Promise<Project> {
    await db.query(
      'INSERT INTO projects (id, title, description, company_id, target_amount, raised_amount, status, trust_score, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [project.id, project.title, project.description, project.companyId, project.targetAmount, project.raisedAmount, project.status, project.trustScore, project.createdAt]
    );
    return project;
  }
}

export default new ProjectRepository();
