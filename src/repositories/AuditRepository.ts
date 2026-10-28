import db from '../shared/db';

export interface AuditEventRecord {
  id?: string;
  sourceModule: string;
  eventType: string;
  entityId: string;
  dataHash: string;
  merkleRoot?: string | null;
  xrplTxHash?: string | null;
  xrplLedgerIndex?: number | null;
  status?: string;
  timestamp?: string;
}

export interface TrustIndexRecord {
  id?: string;
  companyId: string;
  score: number;
  components: any;
  calculatedAt?: string;
}

export interface IAuditRepository {
  appendEvent(event: AuditEventRecord): Promise<AuditEventRecord>;
  findUnanchoredEvents(limit?: number): Promise<AuditEventRecord[]>;
  updateMerkleProof(id: string, merkleRoot: string, xrplTxHash: string, ledgerIndex?: number): Promise<void>;
  getAuditTrail(filter?: { sourceModule?: string; limit?: number }): Promise<AuditEventRecord[]>;
  getLatestTrustIndex(companyId: string): Promise<TrustIndexRecord | null>;
  saveTrustIndex(record: TrustIndexRecord): Promise<TrustIndexRecord>;
}

export class AuditRepository implements IAuditRepository {
  public async appendEvent(event: AuditEventRecord): Promise<AuditEventRecord> {
    const res = await db.query(
      `INSERT INTO audit_trail (source_module, event_type, entity_id, data_hash, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [event.sourceModule, event.eventType, event.entityId, event.dataHash, event.status || 'PENDING']
    );
    return res.rows[0];
  }

  public async findUnanchoredEvents(limit = 100): Promise<AuditEventRecord[]> {
    const res = await db.query(
      `SELECT * FROM audit_trail WHERE status = 'PENDING' ORDER BY timestamp ASC LIMIT $1`,
      [limit]
    );
    return res.rows || [];
  }

  public async updateMerkleProof(id: string, merkleRoot: string, xrplTxHash: string, ledgerIndex?: number): Promise<void> {
    await db.query(
      `UPDATE audit_trail SET merkle_root = $1, xrpl_tx_hash = $2, xrpl_ledger_index = $3, status = 'ANCHORED' WHERE id = $4`,
      [merkleRoot, xrplTxHash, ledgerIndex || null, id]
    );
  }

  public async getAuditTrail(filter: { sourceModule?: string; limit?: number } = {}): Promise<AuditEventRecord[]> {
    const { sourceModule, limit = 50 } = filter;
    let query = 'SELECT * FROM audit_trail';
    const params: any[] = [];
    if (sourceModule) {
      query += ' WHERE source_module = $1';
      params.push(sourceModule);
    }
    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    const res = await db.query(query, params);
    return res.rows || [];
  }

  public async getLatestTrustIndex(companyId: string): Promise<TrustIndexRecord | null> {
    const res = await db.query(
      `SELECT * FROM trust_index WHERE company_id = $1 ORDER BY calculated_at DESC LIMIT 1`,
      [companyId]
    );
    if (!res.rows || res.rows.length === 0) return null;
    return res.rows[0];
  }

  public async saveTrustIndex(record: TrustIndexRecord): Promise<TrustIndexRecord> {
    const res = await db.query(
      `INSERT INTO trust_index (company_id, score, components) VALUES ($1, $2, $3) RETURNING *`,
      [record.companyId, record.score, JSON.stringify(record.components)]
    );
    return res.rows[0];
  }
}

export default new AuditRepository();
