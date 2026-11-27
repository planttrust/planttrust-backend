import { describe, expect, it } from 'vitest';
import {
  areaHectares,
  boundingBox,
  centroid,
  isPointInPolygon,
  polygonHash,
  validateBoundary,
  type LatLng,
} from './m4.geometry';

// About 1.1 km × 1.1 km near Kandy.
const square: LatLng[] = [
  { lat: 7.29, lng: 80.63 },
  { lat: 7.29, lng: 80.64 },
  { lat: 7.3, lng: 80.64 },
  { lat: 7.3, lng: 80.63 },
  { lat: 7.29, lng: 80.63 },
];

// An L shape: the notch at the top right is outside.
const lShape: LatLng[] = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 2 },
  { lat: 1, lng: 2 },
  { lat: 1, lng: 1 },
  { lat: 2, lng: 1 },
  { lat: 2, lng: 0 },
  { lat: 0, lng: 0 },
];

describe('validateBoundary', () => {
  it('accepts a closed square', () => {
    expect(validateBoundary(square)).toEqual([]);
  });

  it('accepts a closed triangle (3 distinct points)', () => {
    const triangle = [square[0], square[1], square[2], square[0]];
    expect(validateBoundary(triangle)).toEqual([]);
  });

  it('rejects a ring that is not closed', () => {
    expect(validateBoundary(square.slice(0, -1))).toContain(
      'The boundary must be closed: the last point must equal the first',
    );
  });

  it('rejects fewer than 3 distinct points', () => {
    expect(validateBoundary([square[0], square[1], square[0]])).toContain(
      'The boundary needs at least 3 different points',
    );
  });

  it('rejects invalid latitude/longitude', () => {
    const bad = [{ lat: 91, lng: 80 }, ...square.slice(1, -1), { lat: 91, lng: 80 }];
    expect(validateBoundary(bad)[0]).toMatch(/not a valid latitude\/longitude/);
  });

  it('rejects a bow-tie whose edges cross', () => {
    const bowTie = [square[0], square[2], square[1], square[3], square[0]];
    expect(validateBoundary(bowTie)).toContain('The boundary edges must not cross each other');
  });

  it('rejects points that are all in a line', () => {
    const line = [
      { lat: 0, lng: 0 },
      { lat: 1, lng: 1 },
      { lat: 2, lng: 2 },
      { lat: 0, lng: 0 },
    ];
    expect(validateBoundary(line).length).toBeGreaterThan(0);
  });
});

describe('areaHectares / centroid / boundingBox', () => {
  it('measures the Kandy square at about 122.6 ha', () => {
    expect(areaHectares(square)).toBeGreaterThan(121);
    expect(areaHectares(square)).toBeLessThan(124);
  });

  it('gives the same area whichever way round the points go', () => {
    expect(areaHectares([...square].reverse())).toBeCloseTo(areaHectares(square), 6);
  });

  it('finds the centre of the square', () => {
    const c = centroid(square);
    expect(c.lat).toBeCloseTo(7.295, 6);
    expect(c.lng).toBeCloseTo(80.635, 6);
  });

  it('finds the bounding box', () => {
    expect(boundingBox(square)).toEqual({
      minLat: 7.29,
      maxLat: 7.3,
      minLng: 80.63,
      maxLng: 80.64,
    });
  });
});

describe('isPointInPolygon (ray casting)', () => {
  it('finds a point inside', () => {
    expect(isPointInPolygon({ lat: 7.295, lng: 80.635 }, square)).toBe(true);
  });

  it('finds a point outside', () => {
    expect(isPointInPolygon({ lat: 7.31, lng: 80.635 }, square)).toBe(false);
  });

  it('counts a point on an edge or corner as inside', () => {
    expect(isPointInPolygon({ lat: 7.29, lng: 80.635 }, square)).toBe(true);
    expect(isPointInPolygon({ lat: 7.3, lng: 80.64 }, square)).toBe(true);
  });

  it('handles a concave shape (the notch of an L is outside)', () => {
    expect(isPointInPolygon({ lat: 0.5, lng: 1.5 }, lShape)).toBe(true);
    expect(isPointInPolygon({ lat: 1.5, lng: 0.5 }, lShape)).toBe(true);
    expect(isPointInPolygon({ lat: 1.5, lng: 1.5 }, lShape)).toBe(false);
  });

  it('rejects quickly using the bounding box', () => {
    expect(isPointInPolygon({ lat: 6.9, lng: 79.86 }, square, boundingBox(square))).toBe(false);
  });
});

describe('polygonHash', () => {
  it('is a stable lowercase SHA-256 hex string', () => {
    expect(polygonHash(square)).toMatch(/^[0-9a-f]{64}$/);
    expect(polygonHash(square)).toBe(polygonHash(structuredClone(square)));
  });

  it('changes when the boundary changes', () => {
    expect(polygonHash(lShape)).not.toBe(polygonHash(square));
  });
});
