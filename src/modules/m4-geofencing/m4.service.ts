import type {
  Prisma,
  Project,
  ProjectDocument as ProjectDocumentRow,
  ProjectPolygon,
} from '@prisma/client';
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

export type ProjectDocumentType = 'LAND_DEED' | 'SURVEY_PLAN' | 'OTHER';

/** What the client sends for each document. */
export interface ProjectDocumentInput {
  documentType: ProjectDocumentType;
  name: string;
  url: string;
  fileHash: string; // SHA-256 of the file, lowercase hex
}

/** What the server returns. */
export interface ProjectDocument extends ProjectDocumentInput {
  id: string; // refId of M5 DOCUMENT_UPLOADED
  uploadedAt: string;
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
  documents: ProjectDocumentInput[];
  fundingGoal: number;
  expectedReturnPct: number;
  durationMonths: number;
  milestones: Milestone[];
  risks: string;
  status: 'draft' | 'open';
}

type ProjectWithLand = Project & {
  polygon: ProjectPolygon | null;
  documents: ProjectDocumentRow[];
};

const withLand = {
  polygon: true,
  documents: { orderBy: { uploadedAt: 'asc' } },
} satisfies Prisma.ProjectInclude;

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

function toDocument(d: ProjectDocumentRow): ProjectDocument {
  return {
    id: d.id,
    documentType: d.documentType,
    name: d.name,
    url: d.url,
    fileHash: d.fileHash,
    uploadedAt: d.uploadedAt.toISOString(),
  };
}

function toDetail(p: ProjectWithLand): ProjectDetail {
  return {
    ...toSummary(p),
    description: p.description,
    cropType: p.cropType,
    photoUrl: p.photoUrl,
    district: p.district,
    boundary: (p.polygon?.points ?? []) as unknown as LatLng[],
    centroid: { lat: p.polygon?.centroidLat ?? 0, lng: p.polygon?.centroidLng ?? 0 },
    areaHectares: Number(p.polygon?.areaHectares ?? 0),
    documents: p.documents.map(toDocument),
    expectedReturnPct: Number(p.expectedReturnPct),
    durationMonths: p.durationMonths,
    milestones: p.milestones as unknown as Milestone[],
    risks: p.risks,
    anchorId: p.anchorId,
    createdAt: p.createdAt.toISOString(),
  };
}

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

/**
 * Saves a project with its land boundary and documents (one atomic write), then records
 * PROJECT_REGISTERED and one DOCUMENT_UPLOADED per document with M5.
 */
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
      documents: {
        create: input.documents.map((d) => ({
          documentType: d.documentType,
          name: d.name,
          url: d.url,
          fileHash: d.fileHash,
        })),
      },
    },
    include: withLand,
  });

  // Anchor after the save has committed. Payloads agreed in contracts/m5-audit.md:
  // hashes only, never the raw boundary or documents. A failed anchor never undoes the save.
  let saved: ProjectWithLand = project;
  try {
    const receipt = await auditService.anchor('PROJECT_REGISTERED', project.id, {
      projectId: project.id,
      companyId,
      polygonHash: polygonHash(input.boundary),
      areaHectares: hectares,
      fundingGoal: input.fundingGoal,
      documentHashes: input.documents.map((d) => d.fileHash),
      registeredAt: project.createdAt.toISOString(),
    });
    saved = await prisma.project.update({
      where: { id: project.id },
      data: { anchorId: receipt.anchorId },
      include: withLand,
    });
  } catch (err) {
    // A missing anchorId shows the project still needs anchoring.
    console.error('M4: anchoring PROJECT_REGISTERED failed', err);
  }

  for (const doc of project.documents) {
    try {
      await auditService.anchor('DOCUMENT_UPLOADED', doc.id, {
        documentId: doc.id,
        projectId: project.id,
        companyId,
        documentType: doc.documentType,
        fileHash: doc.fileHash,
        uploadedAt: doc.uploadedAt.toISOString(),
      });
    } catch (err) {
      console.error(`M4: anchoring DOCUMENT_UPLOADED for ${doc.id} failed`, err);
    }
  }

  return toDetail(saved);
}

/** The logged-in company's own projects, newest first. */
export async function listCompanyProjects(companyId: string): Promise<ProjectDetail[]> {
  const projects = await prisma.project.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    include: withLand,
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
