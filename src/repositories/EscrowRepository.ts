import db from '../shared/db';
import { EscrowRecord, EscrowStatus } from '../domain/EscrowRecord';

export interface IEscrowRepository {
  findById(id: string): Promise<EscrowRecord | null>;
  create(record: EscrowRecord): Promise<EscrowRecord>;
  updateStatus(id: string, status: EscrowStatus, txHash?: string): Promise<void>;
}

export class EscrowRepository implements IEscrowRepository {
  public async findById(id: string): Promise<EscrowRecord | null> {
    const res = await db.query('SELECT * FROM escrow_records WHERE id = $1', [id]);
    if (!res.rows || res.rows.length === 0) return null;
    const r = res.rows[0];
    return new EscrowRecord(r.id, r.project_id, r.investor_id, Number(r.amount), r.status, r.xrpl_tx_hash, r.nft_token_id, r.created_at);
  }

  public async create(record: EscrowRecord): Promise<EscrowRecord> {
    await db.query(
      'INSERT INTO escrow_records (id, project_id, investor_id, amount, status, xrpl_tx_hash, nft_token_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [record.id, record.projectId, record.investorId, record.amount, record.status, record.xrplTxHash, record.nftTokenId, record.createdAt]
    );
    return record;
  }

  public async updateStatus(id: string, status: EscrowStatus, txHash?: string): Promise<void> {
    await db.query(
      'UPDATE escrow_records SET status = $1, xrpl_tx_hash = COALESCE($2, xrpl_tx_hash), updated_at = NOW() WHERE id = $3',
      [status, txHash || null, id]
    );
  }
}

export default new EscrowRepository();
