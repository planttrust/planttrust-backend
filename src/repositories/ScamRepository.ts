import db from '../shared/db';

export interface ScamTypologyRecord {
  id: string;
  category: string;
  title: string;
  pattern: string;
  riskWeight: number;
  description?: string;
  cbslRuleReference?: string;
  createdAt?: string;
}

export interface ScamReportRecord {
  id?: string;
  reportedBy?: string;
  targetUrl?: string;
  targetEntity?: string;
  riskScore?: number;
  typologyMatches?: any;
  status?: string;
  xrplTxHash?: string;
  createdAt?: string;
}

export interface IScamRepository {
  findAllTypologies(): Promise<ScamTypologyRecord[]>;
  findByCategory(category: string): Promise<ScamTypologyRecord[]>;
  createReport(report: ScamReportRecord): Promise<ScamReportRecord>;
  findRecentReports(limit?: number): Promise<ScamReportRecord[]>;
}

export class ScamRepository implements IScamRepository {
  public async findAllTypologies(): Promise<ScamTypologyRecord[]> {
    const res = await db.query('SELECT * FROM scam_typologies ORDER BY risk_weight DESC');
    return (res.rows || []).map(this.mapRowToTypology);
  }

  public async findByCategory(category: string): Promise<ScamTypologyRecord[]> {
    const res = await db.query('SELECT * FROM scam_typologies WHERE category = $1', [category]);
    return (res.rows || []).map(this.mapRowToTypology);
  }

  public async createReport(report: ScamReportRecord): Promise<ScamReportRecord> {
    const res = await db.query(
      `INSERT INTO scam_reports (reported_by, target_url, target_entity, risk_score, typology_matches, status, xrpl_tx_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        report.reportedBy || null,
        report.targetUrl || null,
        report.targetEntity || null,
        report.riskScore || 0,
        JSON.stringify(report.typologyMatches || []),
        report.status || 'pending',
        report.xrplTxHash || null,
      ]
    );
    return res.rows[0];
  }

  public async findRecentReports(limit = 50): Promise<ScamReportRecord[]> {
    const res = await db.query('SELECT * FROM scam_reports ORDER BY created_at DESC LIMIT $1', [limit]);
    return res.rows || [];
  }

  private mapRowToTypology(row: any): ScamTypologyRecord {
    return {
      id: row.id,
      category: row.category,
      title: row.title,
      pattern: row.pattern,
      riskWeight: Number(row.risk_weight) || 1.0,
      description: row.description,
      cbslRuleReference: row.cbsl_rule_reference,
      createdAt: row.created_at,
    };
  }
}

export default new ScamRepository();
