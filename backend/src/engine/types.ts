export type ObjectiveDirection = 'MINIMIZE' | 'MAXIMIZE';

export interface Candidate {
  id: string | number;
  key: string;
  name?: string;
  objectives: number[]; // Array of objective values matching the directions array
  rank?: number;        // 1-indexed Pareto front rank (1 = Pareto optimal)
  crowdingDistance?: number;
  weightedScore?: number; // Normalized 0-100 composite score if weighted mode used
  radarScores?: Record<string, number>;
  exclusionReasons?: string[];
  [key: string]: any;
}

export interface ParetoResult {
  fronts: Candidate[][];
  ranked: Candidate[];
  paretoFrontier: Candidate[]; // Front 1
  dominated: Candidate[];      // Fronts 2..k
}

export interface EngineStats {
  totalEvaluated: number;
  paretoCount: number;
  frontsCount: number;
  executionTimeMs: number;
}
