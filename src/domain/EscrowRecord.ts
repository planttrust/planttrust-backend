export type EscrowStatus = 'CREATED' | 'FUNDED' | 'LOCKED' | 'RELEASED' | 'REFUNDED';

export class EscrowRecord {
  private static readonly VALID_TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
    CREATED: ['FUNDED', 'REFUNDED'],
    FUNDED: ['LOCKED', 'REFUNDED'],
    LOCKED: ['RELEASED', 'REFUNDED'],
    RELEASED: [],
    REFUNDED: []
  };

  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly investorId: string,
    public readonly amount: number,
    private _status: EscrowStatus = 'CREATED',
    public xrplTxHash: string | null = null,
    public nftTokenId: string | null = null,
    public readonly createdAt: string = new Date().toISOString()
  ) {}

  public get status(): EscrowStatus {
    return this._status;
  }

  public canTransitionTo(nextStatus: EscrowStatus): boolean {
    return EscrowRecord.VALID_TRANSITIONS[this._status]?.includes(nextStatus) ?? false;
  }

  public transitionTo(nextStatus: EscrowStatus, txHash?: string): void {
    if (!this.canTransitionTo(nextStatus)) {
      throw new Error(`Invalid escrow state transition from ${this._status} to ${nextStatus}`);
    }
    this._status = nextStatus;
    if (txHash) this.xrplTxHash = txHash;
  }

  public isSettled(): boolean {
    return this._status === 'RELEASED' || this._status === 'REFUNDED';
  }

  public toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      investorId: this.investorId,
      amount: this.amount,
      status: this._status,
      xrplTxHash: this.xrplTxHash,
      nftTokenId: this.nftTokenId,
      createdAt: this.createdAt
    };
  }
}
