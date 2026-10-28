import { Request, Response } from 'express';
import auditService, { AuditService } from '../services/AuditService';

export class AuditController {
  constructor(private service: AuditService = auditService) {}

  public getAudit(req: Request, res: Response): void {
    res.json(this.service.getAuditStatus());
  }

  public getTrustIndex(req: Request, res: Response): void {
    const rawProjectId = req.params.projectId;
    const projectId = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;
    res.json(this.service.getTrustIndex(projectId));
  }

  public verify(req: Request, res: Response): void {
    const rawAnchorId = req.params.anchorId;
    const anchorId = Array.isArray(rawAnchorId) ? rawAnchorId[0] : rawAnchorId;
    res.json(this.service.verifyAnchor(anchorId));
  }
}

export default new AuditController();
