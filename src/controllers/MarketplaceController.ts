import { Request, Response } from 'express';
import marketplaceService, { MarketplaceService } from '../services/MarketplaceService';

export class MarketplaceController {
  constructor(private service: MarketplaceService = marketplaceService) {}

  public getListings(req: Request, res: Response): void {
    res.json(this.service.getListingsStatus());
  }

  public getEscrow(req: Request, res: Response): void {
    res.json(this.service.getEscrowStatus());
  }

  public async fundEscrow(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, investorId, amount } = req.body || {};
      const record = await this.service.fundEscrow(projectId, investorId, Number(amount));
      res.status(201).json({
        ...record.toJSON(),
        isMock: true,
        message: 'Escrow state transition CREATED -> FUNDED recorded (XRPL anchor queued for Checkpoint 2)',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Invalid escrow fund request' });
    }
  }

  public getEscrowHistory(req: Request, res: Response): void {
    const rawId = req.params.escrowId;
    const escrowId = Array.isArray(rawId) ? rawId[0] : rawId;
    res.json(this.service.getEscrowHistory(escrowId));
  }

  public getTransfers(req: Request, res: Response): void {
    res.json(this.service.getTransfersStatus());
  }
}

export default new MarketplaceController();
