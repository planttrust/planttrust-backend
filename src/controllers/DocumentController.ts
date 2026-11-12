import { Request, Response } from 'express';
import documentService, { DocumentService } from '../services/DocumentService';

export class DocumentController {
  constructor(private service: DocumentService = documentService) {}

  public getDocuments(req: Request, res: Response): void {
    res.json(this.service.getDocumentsStatus());
  }

  public getCertificates(req: Request, res: Response): void {
    res.json(this.service.getCertificatesStatus());
  }

  public verifyCertificate(req: Request, res: Response): void {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    res.json(this.service.verifyCertificate(id));
  }
}

export default new DocumentController();
