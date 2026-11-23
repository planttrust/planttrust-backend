import { createHash } from 'node:crypto';

export type AnchorType =
  | 'PROJECT_REGISTERED'
  | 'DOCUMENT_UPLOADED'
  | 'KYC_DECISION'
  | 'INVESTMENT_CREATED'
  | 'ESCROW_STATE_CHANGED'
  | 'PROGRESS_REPORT'
  | 'CERTIFICATE'
  | 'SCAM_FLAG'
  | 'OWNERSHIP_TRANSFER';
export interface AnchorReceipt {
  anchorId: string;
  hash: string;
  status: 'pending' | 'anchored';
  txHash: string | null;
}

export interface MintReceipt {
  nftId: string;
  txHash: string;
  investorId: string;
  projectId: string;
  stake: number;
  escrowRef: string;
}

export interface TrustIndex {
  companyId: string;
  score: number;
  components: Record<string, number>;
  updatedAt: string;
}

export const auditService = {
  /** Records an event's SHA-256 hash for on-chain anchoring. Every module calls this. */
  async anchor(type: AnchorType, refId: string, data: unknown): Promise<AnchorReceipt> {
    const hash = createHash('sha256').update(JSON.stringify({ type, refId, data })).digest('hex');
    // STUB (Sprint 1): not stored or sent to XRPL yet.
    return { anchorId: `stub-${hash.slice(0, 12)}`, hash, status: 'pending', txHash: null };
  },

  /** Mints the investor's NFT for a funded investment (Sprint 4). */
  async mint(
    investorId: string,
    projectId: string,
    stake: number,
    escrowRef: string,
  ): Promise<MintReceipt> {
    // STUB (until Sprint 4): nothing is minted.
    return {
      nftId: `stub-nft-${projectId}-${investorId}`,
      txHash: 'stub',
      investorId,
      projectId,
      stake,
      escrowRef,
    };
  },
};

export const trustIndexService = {
  /** A company's current Trust Index (0–100). */
  async get(companyId: string): Promise<TrustIndex> {
    // STUB (until Sprint 3): every company scores 50.
    return { companyId, score: 50, components: {}, updatedAt: new Date().toISOString() };
  },

  /** Recalculates the Trust Index after a company event (Sprint 3). */
  async recalculate(companyId: string): Promise<TrustIndex> {
    // STUB (until Sprint 3).
    return trustIndexService.get(companyId);
  },
};
