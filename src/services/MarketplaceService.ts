import { EscrowRecord, EscrowStatus } from '../domain/EscrowRecord';
import escrowRepository, { IEscrowRepository } from '../repositories/EscrowRepository';
import { v4 as uuidv4 } from 'uuid';

export class MarketplaceService {
  constructor(private escrowRepo: IEscrowRepository = escrowRepository) {}

  public getListingsStatus() {
    return { message: 'listings API is working (scaffolded)' };
  }

  public getEscrowStatus() {
    return { message: 'escrow API is working (scaffolded)' };
  }

  public getTransfersStatus() {
    return { message: 'transfers API is working (scaffolded)' };
  }

  public async fundEscrow(projectId: string, investorId: string, amount: number): Promise<EscrowRecord> {
    const record = new EscrowRecord(
      uuidv4(),
      projectId,
      investorId,
      amount,
      'FUNDED',
      '4A9D3F82E5C9A17482D42079148F2A8CD996B34A9988D4D6B9C23145E7A29F31',
      '00080000MOCKNFTTOKENID'
    );
    await this.escrowRepo.create(record);
    return record;
  }
}

export default new MarketplaceService();
