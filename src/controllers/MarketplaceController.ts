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

  public getTransfers(req: Request, res: Response): void {
    res.json(this.service.getTransfersStatus());
  }
}

export default new MarketplaceController();
