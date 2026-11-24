import { Router } from 'express';
import { z } from 'zod';
import {
  clearSessionCookie,
  requireAuth,
  ROLES,
  setSessionCookie,
  signToken,
} from '../../shared/auth';
import { forbidden, unauthorized } from '../../shared/errors';
import { loginAccount, registerAccount } from './m1.accounts';
import { userService } from './m1.service';

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());
const name = z.string().trim().min(2).max(100);
const newPassword = z.string().min(8).max(72);

const companyDetails = z.object({
  companyName: z.string().trim().min(2).max(200),
  registrationNumber: z.string().trim().min(2).max(50),
  contactEmail: email,
});

const registerBody = z.discriminatedUnion('role', [
  z
    .object({
      role: z.literal('investor'),
      name,
      email,
      password: newPassword,
    })
    .strict(),
  z
    .object({
      role: z.literal('company'),
      name,
      email,
      password: newPassword,
      company: companyDetails,
    })
    .strict(),
]);

const roleField = z.object({ role: z.string() });

const loginBody = z.object({
  email,
  password: z.string().min(1).max(72),
  role: z.enum(ROLES),
});

export const m1Router = Router();

m1Router.get('/health', (_req, res) => {
  res.json({ module: 'm1-users', status: 'ok' });
});

m1Router.post('/register', async (req, res) => {
  const requested = roleField.safeParse(req.body);
  if (
    requested.success &&
    (requested.data.role === 'admin' || requested.data.role === 'regulator')
  ) {
    throw forbidden('Admin and regulator accounts are created by invitation');
  }
  const data = registerBody.parse(req.body);
  const user = await registerAccount(data);
  setSessionCookie(res, signToken({ id: user.id, role: user.role }));
  res.status(201).json(user);
});

m1Router.post('/login', async (req, res) => {
  const user = await loginAccount(loginBody.parse(req.body));
  setSessionCookie(res, signToken({ id: user.id, role: user.role }));
  res.json(user);
});

m1Router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

m1Router.get('/me', requireAuth, async (req, res) => {
  const user = req.user ? await userService.getById(req.user.id) : null;
  if (!user) throw unauthorized();
  res.json({ id: user.id, role: user.role, name: user.name });
});
