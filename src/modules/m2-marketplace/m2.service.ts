export interface Listing {
  projectId: string;
  title: string;
  location: string;
  fundingGoal: number;
  fundedAmount: number;
  status: 'open' | 'fully_funded' | 'closed';
}

export interface EscrowReleaseResult {
  projectId: string;
  reportId: string;
  status: 'RELEASED' | 'BLOCKED';
  amount: number;
}

export const listingService = {
  /** Open projects for the marketplace and M3's assistant. */
  async list(): Promise<Listing[]> {
    // STUB: empty until M2 reads projects through projectService (M4).
    return [];
  },
};

export const escrowService = {
  /** Releases escrowed money for a project after M4 approves a progress report. */
  async release(projectId: string, reportId: string): Promise<EscrowReleaseResult> {
    // STUB (until Sprint 3): always "released" with no money moved.
    return { projectId, reportId, status: 'RELEASED', amount: 0 };
  },
};
