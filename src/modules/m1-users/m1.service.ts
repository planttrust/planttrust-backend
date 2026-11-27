import type { Role } from '../../shared/auth';
import { prisma } from '../../shared/prisma';

/** What other modules may know about a user. */
export interface UserSummary {
  id: string;
  role: Role;
  name: string;
  verified: boolean;
}

function toSummary(user: { id: string; role: Role; name: string }): UserSummary {
  // Sprint 3: verified comes from kycStatus. Until then everyone counts as verified.
  return { id: user.id, role: user.role, name: user.name, verified: true };
}

export const userService = {
  /** Returns the user, or null if no user has this id. */
  async getById(userId: string): Promise<UserSummary | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true },
    });
    return user ? toSummary(user) : null;
  },

  /** Returns the user only if their verification (KYC) is approved, otherwise null. */
  async getVerified(userId: string): Promise<UserSummary | null> {
    // STUB (until Sprint 3): everyone counts as verified.
    return userService.getById(userId);
  },
};
