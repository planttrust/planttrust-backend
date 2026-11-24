import { createHash } from 'node:crypto';
import type { Prisma, Project, ProjectPolygon } from '@prisma/client';
import { forbidden, notFoundError } from '../../shared/errors';
import { prisma } from '../../shared/prisma';
import { userService } from '../m1-users/m1.service';
import { auditService } from '../m5-audit/m5.service';
import {
  areaHectares,
  boundingBox,
  centroid,
  isPointInPolygon,
  polygonHash,
  type LatLng,
} from './m4.geometry';

export type { LatLng } from './m4.geometry';

export type ProjectStatus = 'draft' | 'open' | 'funded' | 'completed';

export interface ProjectSummary {
  id: string;
  companyId: string;
  title: string;
  location: string;
  fundingGoal: number;
  status: ProjectStatus;
}

export interface Milestone {
  title: string;
  targetDate: string;
  description?: string;
}

export interface ProjectDocument {
  name: string;
  url: string;
}

export interface ProjectDetail extends ProjectSummary {
  description: string;
  cropType: string;
  photoUrl: string | null;
  district: string;
  boundary: LatLng[];
  centroid: LatLng;
  areaHectares: number;
  documents: ProjectDocument[];
  expectedReturnPct: number;
  durationMonths: number;
  milestones: Milestone[];
  risks: string;
  anchorId: string | null;
  createdAt: string;
}

/** Already validated by the route (see m4.routes.ts). The boundary is a closed ring. */
export interface RegisterProjectInput {
  title: string;
  description: string;
  cropType: string;
  photoUrl?: string;
  location: string;
  district: string;
  boundary: LatLng[];
  documents: ProjectDocument[];
  fundingGoal: number;
  expectedReturnPct: number;
  durationMonths: number;
  milestones: Milestone[];
  risks: string;
  status: 'draft' | 'open';
}

type ProjectWithPolygon = Project & { polygon: ProjectPolygon | null };

function toSummary(p: Project): ProjectSummary {
  return {
    id: p.id,
    companyId: p.companyId,
    title: p.title,
    location: p.location,
    fundingGoal: Number(p.fundingGoal),
    status: p.status,
  };
}

function toDetail(p: ProjectWithPolygon): ProjectDetail {
  return {
    ...toSummary(p),
    description: p.description,
    cropType: p.cropType,
    photoUrl: p.photoUrl,
    district: p.district,
    boundary: (p.polygon?.points ?? []) as unknown as LatLng[],
    centroid: { lat: p.polygon?.centroidLat ?? 0, lng: p.polygon?.centroidLng ?? 0 },
    areaHectares: Number(p.polygon?.areaHectares ?? 0),
    documents: p.documents as unknown as ProjectDocument[],
    expectedReturnPct: Number(p.expectedReturnPct),
    durationMonths: p.durationMonths,
    milestones: p.milestones as unknown as Milestone[],
    risks: p.risks,
    anchorId: p.anchorId,
    createdAt: p.createdAt.toISOString(),
  };
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/** Exported for other modules (see contracts/m4-geofencing.md). */
export const projectService = {
  /** Projects that are open for investment, newest first. */
  async listOpen(): Promise<ProjectSummary[]> {
    const projects = await prisma.project.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map(toSummary);
  },

  /** One project, or null if it doesn't exist. */
  async getById(projectId: string): Promise<ProjectSummary | null> {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    return project ? toSummary(project) : null;
  },
};

// ----- Used only by M4's own routes -----

/** Saves a project and its land boundary, then records PROJECT_REGISTERED with M5. */
export async function registerProject(
  companyId: string,
  input: RegisterProjectInput,
): Promise<ProjectDetail> {
  const company = await userService.getVerified(companyId);
  if (!company) throw forbidden('Your company must be verified before it can register projects');

  const box = boundingBox(input.boundary);
  const centre = centroid(input.boundary);
  const hectares = Number(areaHectares(input.boundary).toFixed(4));

  const project = await prisma.project.create({
    data: {
      companyId,
      title: input.title,
      description: input.description,
      cropType: input.cropType,
      photoUrl: input.photoUrl ?? null,
      location: input.location,
      district: input.district,
      documents: input.documents as unknown as Prisma.InputJsonValue,
      fundingGoal: input.fundingGoal,
      expectedReturnPct: input.expectedReturnPct,
      durationMonths: input.durationMonths,
      milestones: input.milestones as unknown as Prisma.InputJsonValue,
      risks: input.risks,
      status: input.status,
      polygon: {
        create: {
          points: input.boundary as unknown as Prisma.InputJsonValue,
          centroidLat: centre.lat,
          centroidLng: centre.lng,
          ...box,
          areaHectares: hectares,
        },
      },
    },
    include: { polygon: true },
  });

  // Anchor after the save has committed. Payload agreed in contracts/m5-audit.md:
  // hashes only, never the raw boundary or documents.
  let saved: ProjectWithPolygon = project;
  try {
    const receipt = await auditService.anchor('PROJECT_REGISTERED', project.id, {
      projectId: project.id,
      companyId,
      polygonHash: polygonHash(input.boundary),
      areaHectares: hectares,
      fundingGoal: input.fundingGoal,
      documentHashes: input.documents.map((d) =>
        sha256(JSON.stringify({ name: d.name, url: d.url })),
      ),
      registeredAt: project.createdAt.toISOString(),
    });
    saved = await prisma.project.update({
      where: { id: project.id },
      data: { anchorId: receipt.anchorId },
      include: { polygon: true },
    });
  } catch (err) {
    // The project is saved either way; a missing anchorId shows it still needs anchoring.
    console.error('M4: anchoring PROJECT_REGISTERED failed', err);
  }

  return toDetail(saved);
}

/** The logged-in company's own projects, newest first. */
export async function listCompanyProjects(companyId: string): Promise<ProjectDetail[]> {
  const projects = await prisma.project.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    include: { polygon: true },
  });
  return projects.map(toDetail);
}

/** Is the point inside the project's land boundary? */
export async function checkLocation(
  projectId: string,
  point: LatLng,
): Promise<{ projectId: string; inside: boolean }> {
  const polygon = await prisma.projectPolygon.findUnique({ where: { projectId } });
  if (!polygon) throw notFoundError('Project not found');
  const ring = polygon.points as unknown as LatLng[];
  return { projectId, inside: isPointInPolygon(point, ring, polygon) };
}
