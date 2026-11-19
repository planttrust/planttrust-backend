export interface ProjectSummary {
  id: string;
  companyId: string;
  title: string;
  location: string;
  fundingGoal: number;
  status: 'draft' | 'open' | 'funded' | 'completed';
}

export const projectService = {
  /** Projects that are open for investment. */
  async listOpen(): Promise<ProjectSummary[]> {
    // STUB: empty until M4 saves registered projects.
    return [];
  },

  /** One project, or null if it doesn't exist. */
  async getById(projectId: string): Promise<ProjectSummary | null> {
    // STUB: returns a demo project for any id.
    return {
      id: projectId,
      companyId: 'company-1',
      title: 'Demo project',
      location: 'Kandy',
      fundingGoal: 0,
      status: 'open',
    };
  },
};
