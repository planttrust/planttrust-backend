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
}

export default new DocumentController();
