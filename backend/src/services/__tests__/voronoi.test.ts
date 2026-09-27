import { VoronoiService, Coord } from '../voronoi.service';

describe('VoronoiService Tessellation & Smoothing', () => {
  const boundingBox: [number, number, number, number] = [21.15, 21.35, 81.55, 81.75]; // Raipur sample

  it('generates non-empty smoothed Voronoi cells for 9 spatial seeds', () => {
    const seeds: Coord[] = [
      [81.65, 21.25], // center
      [81.65, 21.30], // north
      [81.65, 21.20], // south
      [81.70, 21.25], // east
      [81.60, 21.25], // west
      [81.70, 21.30], // north-east
      [81.60, 21.20], // south-west
      [81.70, 21.20], // south-east
      [81.60, 21.30]  // north-west
    ];

    const cells = VoronoiService.generateVoronoiTessellation(seeds, boundingBox);

    expect(cells).toHaveLength(9);

    cells.forEach((cell, idx) => {
      // Must have at least 4 vertices (triangle or quad or smoothed)
      expect(cell.length).toBeGreaterThanOrEqual(4);
      // Closed polygon
      const first = cell[0];
      const last = cell[cell.length - 1];
      expect(first[0]).toBeCloseTo(last[0], 5);
      expect(first[1]).toBeCloseTo(last[1], 5);

      // Verify all coordinates stay within reasonable bounding limits
      cell.forEach(pt => {
        expect(pt[0]).toBeGreaterThanOrEqual(81.54);
        expect(pt[0]).toBeLessThanOrEqual(81.76);
        expect(pt[1]).toBeGreaterThanOrEqual(21.14);
        expect(pt[1]).toBeLessThanOrEqual(21.36);
      });
    });
  });

  it('smooths sharp polygon corners without corrupting boundary', () => {
    const rawSquare: Coord[] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0]
    ];

    const smoothed = VoronoiService.smoothPolygon(rawSquare, 1);
    expect(smoothed.length).toBe(9); // 4 edges * 2 cuts + 1 closing point
    expect(smoothed[0][0]).toBe(smoothed[smoothed.length - 1][0]);
    expect(smoothed[0][1]).toBe(smoothed[smoothed.length - 1][1]);
  });
});
