import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { env } from '../../config/env';

// Test-only password for the demo accounts. Never used in production (see the check below).
export const DEMO_PASSWORD = 'Plantrust-demo-2026';

const DEMO_USERS = [
  {
    id: 'demo-investor',
    email: 'investor@plantrust.test',
    name: 'Demo Investor',
    role: 'investor',
  },
  {
    id: 'demo-company',
    email: 'company@plantrust.test',
    name: 'Demo Company Rep',
    role: 'company',
  },
  { id: 'demo-admin', email: 'admin@plantrust.test', name: 'Demo Admin', role: 'admin' },
  {
    id: 'demo-regulator',
    email: 'regulator@plantrust.test',
    name: 'Demo Regulator',
    role: 'regulator',
  },
] as const;

export async function seedM1(prisma: PrismaClient): Promise<void> {
  if (env.NODE_ENV === 'production') {
    console.info('M1: skipping demo accounts in production');
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const verifiedAt = new Date('2026-11-23T00:00:00Z');

  for (const u of DEMO_USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { email: u.email, name: u.name, role: u.role, passwordHash, status: 'active' },
      create: { ...u, passwordHash, emailVerifiedAt: verifiedAt },
    });
  }

  await prisma.investor.upsert({
    where: { userId: 'demo-investor' },
    update: {},
    create: { userId: 'demo-investor', kycStatus: 'approved' },
  });
  await prisma.company.upsert({
    where: { userId: 'demo-company' },
    update: {},
    create: {
      userId: 'demo-company',
      companyName: 'Green Hills Plantations (Pvt) Ltd',
      registrationNumber: 'PV-DEMO-0001',
      contactEmail: 'company@plantrust.test',
      kycStatus: 'approved',
    },
  });
  await prisma.admin.upsert({
    where: { userId: 'demo-admin' },
    update: {},
    create: { userId: 'demo-admin' },
  });

  console.info('M1: 4 demo accounts ready');
}
