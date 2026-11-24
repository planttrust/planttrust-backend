import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../shared/auth';
import { unauthorized } from '../../shared/errors';
import { validateBoundary } from './m4.geometry';
import { checkLocation, listCompanyProjects, registerProject } from './m4.service';

export const SRI_LANKA_DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
] as const;

const latLng = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const boundary = z
  .array(latLng)
  .max(500, 'The boundary can have at most 500 points')
  .superRefine((ring, ctx) => {
    for (const message of validateBoundary(ring)) ctx.addIssue({ code: 'custom', message });
  });

const registerProjectBody = z.object({
  // 1. Project & photo
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(1).max(5000),
  cropType: z.string().trim().min(1).max(60),
  photoUrl: z.url().optional(),
  // 2. Land & location
  location: z.string().trim().min(1).max(120),
  district: z.enum(SRI_LANKA_DISTRICTS),
  boundary,
  // 3. Documents
  documents: z
    .array(z.object({ name: z.string().trim().min(1).max(200), url: z.url() }))
    .max(20)
    .default([]),
  // 4. Funding & terms
  fundingGoal: z.number().positive().max(999_999_999_999),
  expectedReturnPct: z.number().min(0).max(100),
  durationMonths: z.number().int().min(1).max(360),
  // 5. Milestones & risks
  milestones: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        targetDate: z.iso.date(),
        description: z.string().trim().max(2000).optional(),
      }),
    )
    .max(50)
    .default([]),
  risks: z.string().trim().max(5000).default(''),
  // 6. Review
  status: z.enum(['draft', 'open']).default('open'),
});

const checkBody = z.object({
  projectId: z.string().trim().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const m4Router = Router();

m4Router.get('/health', (_req, res) => {
  res.json({ module: 'm4-geofencing', status: 'ok' });
});

m4Router.post('/projects', requireAuth, requireRole('company'), async (req, res) => {
  if (!req.user) throw unauthorized();
  const input = registerProjectBody.parse(req.body);
  const project = await registerProject(req.user.id, input);
  res.status(201).json(project);
});

m4Router.get('/projects/mine', requireAuth, requireRole('company'), async (req, res) => {
  if (!req.user) throw unauthorized();
  res.json(await listCompanyProjects(req.user.id));
});

m4Router.post('/check', requireAuth, async (req, res) => {
  const { projectId, lat, lng } = checkBody.parse(req.body);
  res.json(await checkLocation(projectId, { lat, lng }));
});
