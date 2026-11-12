export class Certificate {
  constructor(
    public readonly certificateId: string,
    public readonly companyName: string,
    public readonly registryNumber: string,
    public readonly issuer: string = 'Department of Registrar of Companies (eROC), Sri Lanka',
    public readonly issuedAt: string = new Date().toISOString(),
    public readonly isValid: boolean = true
  ) {}

  public toJSON() {
    return {
      certificateId: this.certificateId,
      companyName: this.companyName,
      registryNumber: this.registryNumber,
      issuer: this.issuer,
      issuedAt: this.issuedAt,
      isValid: this.isValid
    };
  }
}
