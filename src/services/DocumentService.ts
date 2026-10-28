export class DocumentService {
  public getDocumentsStatus() {
    return { message: 'documents API is working (scaffolded)' };
  }

  public getCertificatesStatus() {
    return { message: 'certificates API is working (scaffolded)' };
  }
}

export default new DocumentService();
