// Polygon maths for land boundaries. Pure functions: no database, easy to test.
//
// Coordinates are { lat, lng } in degrees (WGS84, what Leaflet and phone GPS use).
// Internally x = lng and y = lat. A boundary is a closed ring: the last point equals the first.

import { createHash } from 'node:crypto';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const EARTH_RADIUS_M = 6_371_008.8;
const SQ_M_PER_HECTARE = 10_000;
/** Points closer than this (in degrees, about 1 cm) count as the same point. */
const EPSILON = 1e-7;

const samePoint = (a: LatLng, b: LatLng) =>
  Math.abs(a.lat - b.lat) < EPSILON && Math.abs(a.lng - b.lng) < EPSILON;

export const isValidLatLng = (p: LatLng) =>
  Number.isFinite(p.lat) &&
  Number.isFinite(p.lng) &&
  p.lat >= -90 &&
  p.lat <= 90 &&
  p.lng >= -180 &&
  p.lng <= 180;

/** The ring without its closing point. */
function openRing(ring: LatLng[]): LatLng[] {
  return ring.length > 1 && samePoint(ring[0], ring[ring.length - 1]) ? ring.slice(0, -1) : ring;
}

/** Cross product of (b - a) × (c - a): > 0 left turn, < 0 right turn, 0 in line. */
function cross(a: LatLng, b: LatLng, c: LatLng): number {
  return (b.lng - a.lng) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lng - a.lng);
}

/** Is p on the segment a–b (including its ends)? */
function onSegment(p: LatLng, a: LatLng, b: LatLng): boolean {
  if (Math.abs(cross(a, b, p)) > EPSILON * EPSILON * 1e4) return false;
  return (
    p.lng >= Math.min(a.lng, b.lng) - EPSILON &&
    p.lng <= Math.max(a.lng, b.lng) + EPSILON &&
    p.lat >= Math.min(a.lat, b.lat) - EPSILON &&
    p.lat <= Math.max(a.lat, b.lat) + EPSILON
  );
}

/** Do segments p1–p2 and p3–p4 cross or touch? */
function segmentsIntersect(p1: LatLng, p2: LatLng, p3: LatLng, p4: LatLng): boolean {
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return (
    onSegment(p1, p3, p4) || onSegment(p2, p3, p4) || onSegment(p3, p1, p2) || onSegment(p4, p1, p2)
  );
}

/**
 * Checks a land boundary. Returns a list of problems (empty when the boundary is valid):
 * valid lat/lng, closed ring, at least 3 distinct points, no crossing edges, and a real area.
 */
export function validateBoundary(ring: LatLng[]): string[] {
  const problems: string[] = [];

  ring.forEach((p, i) => {
    if (!isValidLatLng(p)) problems.push(`Point ${i + 1} is not a valid latitude/longitude`);
  });
  if (problems.length > 0) return problems;

  if (ring.length < 2 || !samePoint(ring[0], ring[ring.length - 1])) {
    problems.push('The boundary must be closed: the last point must equal the first');
  }

  const points = openRing(ring);
  const distinct = points.filter((p, i) => points.findIndex((q) => samePoint(p, q)) === i);
  if (distinct.length < 3) {
    problems.push('The boundary needs at least 3 different points');
    return problems;
  }
  if (distinct.length !== points.length) {
    problems.push('The boundary must not visit the same point twice');
    return problems;
  }

  // Edges that are not neighbours must never meet.
  const n = points.length;
  outer: for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const neighbours = j === i + 1 || (i === 0 && j === n - 1);
      if (neighbours) continue;
      if (segmentsIntersect(points[i], points[(i + 1) % n], points[j], points[(j + 1) % n])) {
        problems.push('The boundary edges must not cross each other');
        break outer;
      }
    }
  }

  if (problems.length === 0 && areaHectares(ring) <= 0) {
    problems.push('The boundary has no area (all points are in a line)');
  }
  return problems;
}

/**
 * Projects the points onto a flat plane in metres around the polygon's mean latitude.
 * Accurate to well under 1% for farm-sized land, which is all we need.
 */
function toMetres(points: LatLng[]): { x: number; y: number }[] {
  const meanLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const k = (Math.PI / 180) * EARTH_RADIUS_M;
  const cosLat = Math.cos((meanLat * Math.PI) / 180);
  return points.map((p) => ({ x: p.lng * k * cosLat, y: p.lat * k }));
}

/** Area enclosed by the ring, in hectares (shoelace formula). */
export function areaHectares(ring: LatLng[]): number {
  const pts = toMetres(openRing(ring));
  let twiceArea = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    twiceArea += a.x * b.y - b.x * a.y;
  }
  return Math.abs(twiceArea) / 2 / SQ_M_PER_HECTARE;
}

/** Centre of mass of the polygon (used to centre the map and as the project's pin). */
export function centroid(ring: LatLng[]): LatLng {
  const pts = openRing(ring);
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    const f = p.lng * q.lat - q.lng * p.lat;
    a += f;
    cx += (p.lng + q.lng) * f;
    cy += (p.lat + q.lat) * f;
  }
  if (Math.abs(a) < EPSILON * EPSILON) {
    // Degenerate shape: fall back to the average of the points.
    return {
      lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
      lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
    };
  }
  return { lat: cy / (3 * a), lng: cx / (3 * a) };
}

export function boundingBox(ring: LatLng[]): BoundingBox {
  return {
    minLat: Math.min(...ring.map((p) => p.lat)),
    maxLat: Math.max(...ring.map((p) => p.lat)),
    minLng: Math.min(...ring.map((p) => p.lng)),
    maxLng: Math.max(...ring.map((p) => p.lng)),
  };
}

/**
 * Ray casting: draw a ray from the point towards +lng and count how many edges it crosses.
 * Odd = inside, even = outside. A point exactly on an edge counts as inside.
 */
export function isPointInPolygon(point: LatLng, ring: LatLng[], box?: BoundingBox): boolean {
  if (box) {
    const outsideBox =
      point.lat < box.minLat - EPSILON ||
      point.lat > box.maxLat + EPSILON ||
      point.lng < box.minLng - EPSILON ||
      point.lng > box.maxLng + EPSILON;
    if (outsideBox) return false;
  }

  const pts = openRing(ring);
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (onSegment(point, a, b)) return true;
    const crossesRay =
      a.lat > point.lat !== b.lat > point.lat &&
      point.lng < ((b.lng - a.lng) * (point.lat - a.lat)) / (b.lat - a.lat) + a.lng;
    if (crossesRay) inside = !inside;
  }
  return inside;
}

/** SHA-256 (lowercase hex) of the ring, with sorted keys, as agreed in contracts/m5-audit.md. */
export function polygonHash(ring: LatLng[]): string {
  const canonical = JSON.stringify(ring.map((p) => ({ lat: p.lat, lng: p.lng })));
  return createHash('sha256').update(canonical).digest('hex');
}
