export type ProjectStatus = 'draft' | 'pending_verification' | 'active' | 'funded' | 'completed' | 'suspended';

export class Project {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public companyId: string,
    public targetAmount: number,
    public raisedAmount: number = 0,
    public status: ProjectStatus = 'active',
    public trustScore: number = 90,
    public readonly createdAt: string = new Date().toISOString()
  ) {}

  public getFundingProgress(): number {
    if (this.targetAmount <= 0) return 0;
    return Math.min(100, Math.round((this.raisedAmount / this.targetAmount) * 100));
  }

  public isFullyFunded(): boolean {
    return this.raisedAmount >= this.targetAmount;
  }

  public addFunds(amount: number): void {
    if (amount <= 0) throw new Error('Investment amount must be positive');
    this.raisedAmount += amount;
    if (this.isFullyFunded() && this.status === 'active') {
      this.status = 'funded';
    }
  }

  public toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      companyId: this.companyId,
      targetAmount: this.targetAmount,
      raisedAmount: this.raisedAmount,
      status: this.status,
      trustScore: this.trustScore,
      fundingProgress: this.getFundingProgress(),
      isFullyFunded: this.isFullyFunded(),
      createdAt: this.createdAt
    };
  }
}
