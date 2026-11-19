/**
 * Shared XRPL client. Owned by M5 (Mirath) and implemented in Sprint 2.
 * Other modules never call this directly: they call auditService.anchor() or auditService.mint().
 */
export interface XrplClient {
  /** Writes a hash to XRPL Testnet (in a transaction memo) and returns the transaction details. */
  submitHash(hash: string, memoType: string): Promise<{ txHash: string; ledgerIndex: number }>;
  /** Mints an XRPL NFT for an investment and returns its token ID. */
  mintNft(metadataUri: string): Promise<{ nftId: string; txHash: string }>;
}

export const xrplClient: XrplClient = {
  async submitHash() {
    throw new Error('XRPL client not implemented yet (M5, Sprint 2)');
  },
  async mintNft() {
    throw new Error('XRPL NFT minting not implemented yet (M5, Sprint 4)');
  },
};
