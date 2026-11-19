import type { Role } from '../../shared/auth';

/** What other modules may know about a user. */
export interface UserSummary {
  id: string;
  role: Role;
  name: string;
  verified: boolean;
}

export const userService = {
  /** Returns the user, or null if no user has this id. */
  async getById(userId: string): Promise<UserSummary | null> {
    // STUB (Sprint 1): returns a demo user until M1 reads the users table.
    return { id: userId, role: 'investor', name: 'Demo User', verified: true };
  },

  /** Returns the user only if their verification (KYC) is approved, otherwise null. */
  async getVerified(userId: string): Promise<UserSummary | null> {
    // STUB (until Sprint 3): everyone counts as verified.
    return userService.getById(userId);
  },
};
