export interface Coordinate {
  latitude: number;
  longitude: number;
}

export class GeofencePolygon {
  constructor(
    public readonly name: string,
    public readonly coordinates: Coordinate[]
  ) {
    if (coordinates.length < 3) {
      throw new Error('A polygon requires at least 3 coordinates to form a closed boundary');
    }
  }

  /**
   * Ray-casting algorithm to determine if a GPS coordinate is inside the polygon boundary
   */
  public containsPoint(point: Coordinate): boolean {
    const { latitude: lat, longitude: lng } = point;
    let isInside = false;
    const coords = this.coordinates;

    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const xi = coords[i].latitude;
      const yi = coords[i].longitude;
      const xj = coords[j].latitude;
      const yj = coords[j].longitude;

      const intersect = yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
      if (intersect) isInside = !isInside;
    }

    return isInside;
  }

  public getCentroid(): Coordinate {
    let latSum = 0;
    let lngSum = 0;
    for (const c of this.coordinates) {
      latSum += c.latitude;
      lngSum += c.longitude;
    }
    return {
      latitude: latSum / this.coordinates.length,
      longitude: lngSum / this.coordinates.length
    };
  }
}
