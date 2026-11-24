// M1 only: account sign-up and login, used by m1.routes.ts.
// Other modules must not import this file; they use userService in m1.service.ts.
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import type { Role } from '../../shared/auth';
import { conflict, forbidden, unauthorized } from '../../shared/errors';
import { prisma } from '../../shared/prisma';

const BCRYPT_ROUNDS = 10;

// Used when the email doesn't exist, so a wrong email takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

const ARTICLE: Record<Role, string> = { investor: 'an', company: 'a', admin: 'an', regulator: 'a' };

export interface AccountResult {
  id: string;
  role: Role;
  name: string;
}

export interface RegisterData {
  role: 'investor' | 'company';
  name: string;
  email: string;
  password: string;
  company?: { companyName: string; registrationNumber: string; contactEmail: string };
}

export async function registerAccount(data: RegisterData): Promise<AccountResult> {
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  try {
    return await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        ...(data.role === 'company' && data.company
          ? { company: { create: data.company } }
          : { investor: { create: {} } }),
      },
      select: { id: true, role: true, name: true },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const fields = String(err.meta?.target ?? '');
      throw conflict(
        fields.includes('registrationNumber')
          ? 'A company with this registration number is already registered'
          : 'An account with this email already exists',
      );
    }
    throw err;
  }
}

export interface LoginData {
  email: string;
  password: string;
  role: Role;
}

export async function loginAccount(data: LoginData): Promise<AccountResult> {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  const passwordOk = await bcrypt.compare(data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordOk) throw unauthorized('Invalid credentials');

  if (user.role !== data.role) {
    throw forbidden(`This account is not ${ARTICLE[data.role]} ${data.role} account`);
  }
  if (user.status === 'suspended') throw forbidden('This account is suspended');

  return { id: user.id, role: user.role, name: user.name };
}
