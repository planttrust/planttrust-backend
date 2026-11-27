// M4 demo data: four projects on real Sri Lankan land, called from prisma/seed.ts.
// Safe to run again: it replaces these projects (fixed ids) every time.

import type { Prisma, PrismaClient } from '@prisma/client';
import { areaHectares, boundingBox, centroid, validateBoundary, type LatLng } from './m4.geometry';

/**
 * Owner of the demo projects. Must match the id of M1's seeded demo company account,
 * so "My projects" shows these when you log in as it. Agree the value with M1 (Nimsara).
 */
export const DEMO_COMPANY_ID = 'demo-company';

interface SeedProject {
  id: string;
  title: string;
  description: string;
  cropType: string;
  location: string;
  district: string;
  fundingGoal: number;
  expectedReturnPct: number;
  durationMonths: number;
  status: 'draft' | 'open';
  risks: string;
  milestones: { title: string; targetDate: string }[];
  boundary: LatLng[];
}

const projects: SeedProject[] = [
  {
    id: '4a0e0001-0000-4000-8000-000000000001',
    title: 'Pedro hill-country tea replanting',
    description: 'Replanting ageing tea bushes with high-yield clones on a hillside estate.',
    cropType: 'Tea',
    location: 'Pedro, Nuwara Eliya',
    district: 'Nuwara Eliya',
    fundingGoal: 12_000_000,
    expectedReturnPct: 11,
    durationMonths: 36,
    status: 'open',
    risks: 'Heavy monsoon rain can delay planting; frost at high elevation.',
    milestones: [
      { title: 'Uproot old bushes and terrace the slope', targetDate: '2027-02-28' },
      { title: 'Plant 20,000 VP clones', targetDate: '2027-06-30' },
      { title: 'First plucking round', targetDate: '2028-09-30' },
    ],
    boundary: [
      { lat: 6.981, lng: 80.784 },
      { lat: 6.9822, lng: 80.7885 },
      { lat: 6.9801, lng: 80.7912 },
      { lat: 6.9772, lng: 80.7898 },
      { lat: 6.9768, lng: 80.7852 },
      { lat: 6.981, lng: 80.784 },
    ],
  },
  {
    id: '4a0e0001-0000-4000-8000-000000000002',
    title: 'Baddegama Ceylon cinnamon garden',
    description: 'Expanding a family cinnamon garden with true Ceylon cinnamon (Cinnamomum verum).',
    cropType: 'Cinnamon',
    location: 'Baddegama',
    district: 'Galle',
    fundingGoal: 6_500_000,
    expectedReturnPct: 14,
    durationMonths: 30,
    status: 'open',
    risks: 'Price swings in the export market; stem borer pests.',
    milestones: [
      { title: 'Prepare land and nursery', targetDate: '2027-01-31' },
      { title: 'Plant 8,000 seedlings', targetDate: '2027-05-31' },
      { title: 'First harvest and peeling', targetDate: '2029-03-31' },
    ],
    boundary: [
      { lat: 6.17, lng: 80.179 },
      { lat: 6.1712, lng: 80.1835 },
      { lat: 6.1689, lng: 80.1868 },
      { lat: 6.1651, lng: 80.1852 },
      { lat: 6.1648, lng: 80.1801 },
      { lat: 6.17, lng: 80.179 },
    ],
  },
  {
    id: '4a0e0001-0000-4000-8000-000000000003',
    title: 'Kuliyapitiya coconut triangle estate',
    description: 'Intercropping a coconut estate in the coconut triangle with pepper and banana.',
    cropType: 'Coconut',
    location: 'Kuliyapitiya',
    district: 'Kurunegala',
    fundingGoal: 9_000_000,
    expectedReturnPct: 9.5,
    durationMonths: 48,
    status: 'open',
    risks: 'Drought in the dry season; coconut leaf wilt disease.',
    milestones: [
      { title: 'Install drip irrigation', targetDate: '2027-03-31' },
      { title: 'Plant pepper vines on 600 palms', targetDate: '2027-08-31' },
    ],
    boundary: [
      { lat: 7.472, lng: 80.036 },
      { lat: 7.4728, lng: 80.0425 },
      { lat: 7.469, lng: 80.0448 },
      { lat: 7.4655, lng: 80.042 },
      { lat: 7.466, lng: 80.0365 },
      { lat: 7.472, lng: 80.036 },
    ],
  },
  {
    id: '4a0e0001-0000-4000-8000-000000000004',
    title: 'Puttalam lagoon mangrove restoration',
    description: 'Restoring mangroves on abandoned shrimp ponds at the edge of Puttalam lagoon.',
    cropType: 'Mangrove',
    location: 'Puttalam lagoon',
    district: 'Puttalam',
    fundingGoal: 4_000_000,
    expectedReturnPct: 6,
    durationMonths: 60,
    status: 'draft',
    risks: 'Storm surges; survival rate of young seedlings.',
    milestones: [{ title: 'Restore tidal channels', targetDate: '2027-04-30' }],
    boundary: [
      { lat: 8.033, lng: 79.825 },
      { lat: 8.0335, lng: 79.83 },
      { lat: 8.0295, lng: 79.8318 },
      { lat: 8.027, lng: 79.8285 },
      { lat: 8.0285, lng: 79.8248 },
      { lat: 8.033, lng: 79.825 },
    ],
  },
];

export async function seedM4(prisma: PrismaClient, companyId = DEMO_COMPANY_ID) {
  await prisma.project.deleteMany({ where: { id: { in: projects.map((p) => p.id) } } });

  for (const { boundary, milestones, ...p } of projects) {
    const problems = validateBoundary(boundary);
    if (problems.length > 0) throw new Error(`Seed boundary for "${p.title}": ${problems}`);
    const centre = centroid(boundary);

    await prisma.project.create({
      data: {
        ...p,
        companyId,
        milestones: milestones as unknown as Prisma.InputJsonValue,
        polygon: {
          create: {
            points: boundary as unknown as Prisma.InputJsonValue,
            centroidLat: centre.lat,
            centroidLng: centre.lng,
            ...boundingBox(boundary),
            areaHectares: Number(areaHectares(boundary).toFixed(4)),
          },
        },
      },
    });
  }
  console.info(`M4: seeded ${projects.length} projects for company "${companyId}".`);
}
