export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskCheckResult {
  projectId: string;
  level: RiskLevel;
  reasons: string[];
}

export const scamService = {
  /** Scam/compliance risk for a project. M2 calls this before every escrow release. */
  async riskCheck(projectId: string): Promise<RiskCheckResult> {
    // STUB (until Sprint 3): every project is low risk.
    return { projectId, level: 'low', reasons: [] };
  },
};
