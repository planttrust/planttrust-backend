export class DocumentService {
  public getDocumentsStatus() {
    return { message: 'documents API is working (scaffolded)' };
  }

  public getCertificatesStatus() {
    return { message: 'certificates API is working (scaffolded)' };
  }

  public verifyCertificate(certificateId: string) {
    return {
      certificateId,
      companyName: 'GreenAgri Plantations PLC',
      status: 'UNVERIFIED_SCAFFOLD',
      verified: false,
      isMock: true,
      issuedAt: '2026-03-15T10:30:00Z',
      anchorTxHash: null,
      message: 'Scaffolded certificate lookup — live XRPL Testnet verification will be enabled in Checkpoint 2',
    };
  }
}

export default new DocumentService();
