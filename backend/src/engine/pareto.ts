import { Candidate, ObjectiveDirection, ParetoResult } from './types';

/**
 * Checks whether candidate A dominates candidate B.
 * A dominates B (A ≺ B) iff:
 * 1. A is no worse than B in all objectives.
 * 2. A is strictly better than B in at least one objective.
 */
export function dominates(
  a: number[],
  b: number[],
  directions: ObjectiveDirection[]
): boolean {
  let strictlyBetterInAtLeastOne = false;
  const numObj = directions.length;

  for (let i = 0; i < numObj; i++) {
    const valA = a[i];
    const valB = b[i];

    if (directions[i] === 'MINIMIZE') {
      if (valA > valB) {
        return false; // A is worse than B in objective i
      }
      if (valA < valB) {
        strictlyBetterInAtLeastOne = true;
      }
    } else { // MAXIMIZE
      if (valA < valB) {
        return false; // A is worse than B in objective i
      }
      if (valA > valB) {
        strictlyBetterInAtLeastOne = true;
      }
    }
  }

  return strictlyBetterInAtLeastOne;
}

/**
 * Executes Kalyanmoy Deb's O(M * N^2) Fast Non-Dominated Sorting algorithm.
 * Partitions population into Pareto fronts:
 * - Front 1: The true non-dominated Pareto frontier
 * - Front 2: Dominated only by Front 1
 * - Front k: Dominated by fronts 1..k-1
 */
export function fastNonDominatedSort(
  candidates: Candidate[],
  directions: ObjectiveDirection[]
): Candidate[][] {
  const n = candidates.length;
  if (n === 0) return [];

  const S: number[][] = Array.from({ length: n }, () => []);
  const dominationCounts: number[] = new Array(n).fill(0);
  const firstFrontIndices: number[] = [];

  for (let p = 0; p < n; p++) {
    for (let q = 0; q < n; q++) {
      if (p === q) continue;

      if (dominates(candidates[p].objectives, candidates[q].objectives, directions)) {
        S[p].push(q);
      } else if (dominates(candidates[q].objectives, candidates[p].objectives, directions)) {
        dominationCounts[p]++;
      }
    }

    if (dominationCounts[p] === 0) {
      firstFrontIndices.push(p);
    }
  }

  const fronts: Candidate[][] = [];
  if (firstFrontIndices.length > 0) {
    fronts.push(firstFrontIndices.map(idx => candidates[idx]));
  }

  let currentFrontIndices = firstFrontIndices;
  while (currentFrontIndices.length > 0) {
    const nextFrontIndices: number[] = [];

    for (const p of currentFrontIndices) {
      for (const q of S[p]) {
        dominationCounts[q]--;
        if (dominationCounts[q] === 0) {
          nextFrontIndices.push(q);
        }
      }
    }

    if (nextFrontIndices.length > 0) {
      fronts.push(nextFrontIndices.map(idx => candidates[idx]));
    }
    currentFrontIndices = nextFrontIndices;
  }

  return fronts;
}

/**
 * Assigns crowding distance values to candidates within a front.
 * Boundary solutions in each objective receive Infinity.
 * Internal points receive the normalized difference between their nearest neighbours.
 */
export function calculateCrowdingDistances(
  front: Candidate[],
  directions: ObjectiveDirection[]
): void {
  const frontSize = front.length;
  if (frontSize === 0) return;

  if (frontSize <= 2) {
    for (const c of front) {
      c.crowdingDistance = Infinity;
    }
    return;
  }

  // Initialize crowding distances
  for (const c of front) {
    c.crowdingDistance = 0.0;
  }

  const numObj = directions.length;

  for (let m = 0; m < numObj; m++) {
    // Sort front by objective m
    front.sort((a, b) => a.objectives[m] - b.objectives[m]);

    // Boundary points get infinity
    front[0].crowdingDistance = Infinity;
    front[frontSize - 1].crowdingDistance = Infinity;

    const minVal = front[0].objectives[m];
    const maxVal = front[frontSize - 1].objectives[m];
    const range = maxVal - minVal;

    if (Math.abs(range) > 1e-9) {
      for (let i = 1; i < frontSize - 1; i++) {
        if (front[i].crowdingDistance !== Infinity) {
          const prevVal = front[i - 1].objectives[m];
          const nextVal = front[i + 1].objectives[m];
          front[i].crowdingDistance! += (nextVal - prevVal) / range;
        }
      }
    }
  }
}

/**
 * Complete Pareto optimization runner.
 * Computes non-dominated ranks (1-indexed) and crowding distance diversity measures.
 * Returns sorted candidates: primarily by rank ascending, secondarily by crowding distance descending.
 */
export function rankByPareto(
  candidates: Candidate[],
  directions: ObjectiveDirection[]
): ParetoResult {
  if (candidates.length === 0) {
    return {
      fronts: [],
      ranked: [],
      paretoFrontier: [],
      dominated: []
    };
  }

  // Deep clone candidates to avoid mutating originals
  const cloned: Candidate[] = candidates.map(c => ({ ...c }));
  const fronts = fastNonDominatedSort(cloned, directions);

  const ranked: Candidate[] = [];

  fronts.forEach((front, index) => {
    const rank = index + 1;
    for (const candidate of front) {
      candidate.rank = rank;
    }
    calculateCrowdingDistances(front, directions);

    // Sort within front by crowding distance descending
    front.sort((a, b) => {
      const distA = a.crowdingDistance ?? 0;
      const distB = b.crowdingDistance ?? 0;
      if (distA === Infinity && distB !== Infinity) return -1;
      if (distA !== Infinity && distB === Infinity) return 1;
      return distB - distA;
    });

    ranked.push(...front);
  });

  const paretoFrontier = fronts.length > 0 ? fronts[0] : [];
  const dominated = ranked.filter(c => (c.rank ?? 1) > 1);

  return {
    fronts,
    ranked,
    paretoFrontier,
    dominated
  };
}
