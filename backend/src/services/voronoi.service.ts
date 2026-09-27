/**
 * Voronoi Tessellation & Polygon Smoothing Module for NestFit
 * Generates contiguous, non-overlapping, natural-looking organic neighborhood polygons
 * from spatial centroids, clipped to city administrative bounds.
 */

export interface Point2D {
  x: number; // lon
  y: number; // lat
}

export type Coord = [number, number]; // [lon, lat]

export class VoronoiService {
  /**
   * Clips a convex polygon against the half-plane closer to seed P1 than seed P2.
   * Half-plane equation: distSq(X, P1) <= distSq(X, P2)
   */
  private static clipPolygonWithBisector(
    polygon: Coord[],
    p1: Coord,
    p2: Coord
  ): Coord[] {
    if (polygon.length < 3) return polygon;

    // Remove closing point if present for processing
    const pts = polygon[0][0] === polygon[polygon.length - 1][0] &&
                polygon[0][1] === polygon[polygon.length - 1][1]
      ? polygon.slice(0, -1)
      : [...polygon];

    const isInside = (pt: Coord): boolean => {
      const d1 = (pt[0] - p1[0]) ** 2 + (pt[1] - p1[1]) ** 2;
      const d2 = (pt[0] - p2[0]) ** 2 + (pt[1] - p2[1]) ** 2;
      return d1 <= d2 + 1e-9;
    };

    const computeIntersection = (cp1: Coord, cp2: Coord): Coord => {
      // Bisector midpoint M and normal vector N = p2 - p1
      const mx = (p1[0] + p2[0]) / 2;
      const my = (p1[1] + p2[1]) / 2;
      const nx = p2[0] - p1[0];
      const ny = p2[1] - p1[1];

      // Line segment cp1 -> cp2 direction D = cp2 - cp1
      const dx = cp2[0] - cp1[0];
      const dy = cp2[1] - cp1[1];

      // Intersection parameter t: ((M - cp1) . N) / (D . N)
      const denom = dx * nx + dy * ny;
      if (Math.abs(denom) < 1e-12) return cp1;

      const t = ((mx - cp1[0]) * nx + (my - cp1[1]) * ny) / denom;
      const clampedT = Math.max(0, Math.min(1, t));

      return [
        cp1[0] + clampedT * dx,
        cp1[1] + clampedT * dy
      ];
    };

    const outputList: Coord[] = [];
    let s = pts[pts.length - 1];

    for (const e of pts) {
      if (isInside(e)) {
        if (isInside(s)) {
          outputList.push(e);
        } else {
          outputList.push(computeIntersection(s, e));
          outputList.push(e);
        }
      } else if (isInside(s)) {
        outputList.push(computeIntersection(s, e));
      }
      s = e;
    }

    if (outputList.length > 0) {
      // Re-close polygon
      outputList.push([outputList[0][0], outputList[0][1]]);
    }

    return outputList;
  }

  /**
   * Applies Chaikin's corner cutting algorithm to smooth sharp geometric angles
   * into natural, organic neighborhood boundaries.
   */
  public static smoothPolygon(polygon: Coord[], iterations: number = 1): Coord[] {
    if (polygon.length < 4) return polygon;

    let pts = polygon[0][0] === polygon[polygon.length - 1][0] &&
              polygon[0][1] === polygon[polygon.length - 1][1]
      ? polygon.slice(0, -1)
      : [...polygon];

    for (let it = 0; it < iterations; it++) {
      const smoothed: Coord[] = [];
      const n = pts.length;
      for (let i = 0; i < n; i++) {
        const p0 = pts[i];
        const p1 = pts[(i + 1) % n];

        // 75% - 25% Chaikin cuts
        const q: Coord = [
          0.75 * p0[0] + 0.25 * p1[0],
          0.75 * p0[1] + 0.25 * p1[1]
        ];
        const r: Coord = [
          0.25 * p0[0] + 0.75 * p1[0],
          0.25 * p0[1] + 0.75 * p1[1]
        ];

        smoothed.push(q);
        smoothed.push(r);
      }
      pts = smoothed;
    }

    // Re-close polygon
    pts.push([pts[0][0], pts[0][1]]);
    return pts;
  }

  /**
   * Andrew's monotone chain 2D convex hull algorithm.
   * Returns vertices of convex hull in counter-clockwise order, closed.
   */
  public static computeConvexHull(points: Coord[]): Coord[] {
    if (points.length <= 3) return points;

    // Filter out invalid coords and sort lexicographically by x, then y
    const valid = points.filter(p => p && typeof p[0] === 'number' && typeof p[1] === 'number');
    const sorted = [...valid].sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));

    const crossProduct = (o: Coord, a: Coord, b: Coord): number => {
      return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    };

    // Build lower hull
    const lower: Coord[] = [];
    for (const p of sorted) {
      while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }

    // Build upper hull
    const upper: Coord[] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }

    lower.pop();
    upper.pop();
    const hull = lower.concat(upper);
    if (hull.length > 0) {
      hull.push([hull[0][0], hull[0][1]]);
    }
    return hull;
  }

  /**
   * Computes Voronoi cells for seeds inside a boundary polygon or bounding box.
   * If seeds is empty or single, returns the full boundary.
   */
  public static generateVoronoiTessellation(
    seeds: Coord[], // [[lon, lat], ...]
    boundingBox: [number, number, number, number], // [minLat, maxLat, minLon, maxLon]
    boundaryPolygon?: Coord[]
  ): Coord[][] {
    const [minLat, maxLat, minLon, maxLon] = boundingBox;

    // Base boundary rectangle
    const boxBoundary: Coord[] = [
      [minLon, minLat],
      [maxLon, minLat],
      [maxLon, maxLat],
      [minLon, maxLat],
      [minLon, minLat]
    ];

    let initialBoundary = boxBoundary;
    if (boundaryPolygon && boundaryPolygon.length >= 4) {
      const hull = this.computeConvexHull(boundaryPolygon);
      if (hull.length >= 4) {
        initialBoundary = hull;
      }
    }

    if (seeds.length <= 1) {
      return [initialBoundary];
    }

    const cells: Coord[][] = [];

    for (let i = 0; i < seeds.length; i++) {
      const p1 = seeds[i];
      let cell = [...initialBoundary];

      for (let j = 0; j < seeds.length; j++) {
        if (i === j) continue;
        const p2 = seeds[j];
        cell = this.clipPolygonWithBisector(cell, p1, p2);
      }

      // Smooth corners slightly with Chaikin's algorithm
      const smoothed = this.smoothPolygon(cell, 1);
      cells.push(smoothed);
    }

    return cells;
  }
}
