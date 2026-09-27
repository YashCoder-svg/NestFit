/**
 * Compare Mode Delta Calculation Engine
 * 
 * Computes comparative deltas, best-in-category flags, and differential
 * trade-offs across 2-3 candidate neighborhoods for NestFit Compare Mode.
 */

export interface NeighborhoodComparisonInput {
  key: string;
  name: string;
  rent: number;
  commuteMinutes: number;
  aqi: number;
  hospitalCount: number;
  groceryCount: number;
}

export interface MetricDelta {
  value: number;
  isBest: boolean;
  delta: number; // For MIN objectives (rent, commute, aqi): value - bestMin. For MAX (hosp, groc): value - bestMax.
  formattedDelta: string;
}

export interface NeighborhoodComparisonResult {
  key: string;
  name: string;
  rent: MetricDelta;
  commute: MetricDelta;
  aqi: MetricDelta;
  hospitals: MetricDelta;
  groceries: MetricDelta;
}

export interface ComparisonSummary {
  minRent: number;
  minCommute: number;
  bestAqi: number;
  maxHospitals: number;
  maxGroceries: number;
  results: Record<string, NeighborhoodComparisonResult>;
  areas: NeighborhoodComparisonResult[];
}

/**
 * Computes side-by-side comparative deltas for an array of 2 to 3 candidate neighborhoods.
 */
export function computeComparisonDeltas(areas: NeighborhoodComparisonInput[]): ComparisonSummary {
  if (!areas || areas.length === 0) {
    return {
      minRent: 0,
      minCommute: 0,
      bestAqi: 0,
      maxHospitals: 0,
      maxGroceries: 0,
      results: {},
      areas: []
    };
  }

  const minRent = Math.min(...areas.map(a => a.rent));
  const minCommute = Math.min(...areas.map(a => a.commuteMinutes));
  const bestAqi = Math.min(...areas.map(a => a.aqi));
  const maxHospitals = Math.max(...areas.map(a => a.hospitalCount));
  const maxGroceries = Math.max(...areas.map(a => a.groceryCount));

  const results: Record<string, NeighborhoodComparisonResult> = {};
  const areaResults: NeighborhoodComparisonResult[] = [];

  for (const area of areas) {
    const rentDeltaVal = area.rent - minRent;
    const commuteDeltaVal = Math.round(area.commuteMinutes - minCommute);
    const aqiDeltaVal = Math.round(area.aqi - bestAqi);
    const hospDeltaVal = area.hospitalCount - maxHospitals;
    const grocDeltaVal = area.groceryCount - maxGroceries;

    const item: NeighborhoodComparisonResult = {
      key: area.key,
      name: area.name,
      rent: {
        value: area.rent,
        isBest: area.rent === minRent,
        delta: rentDeltaVal,
        formattedDelta: rentDeltaVal > 0 ? `+₹${rentDeltaVal.toLocaleString('en-IN')}/mo` : 'Best Rent'
      },
      commute: {
        value: area.commuteMinutes,
        isBest: area.commuteMinutes === minCommute,
        delta: commuteDeltaVal,
        formattedDelta: commuteDeltaVal > 0 ? `+${commuteDeltaVal}m slower` : 'Fastest Commute'
      },
      aqi: {
        value: area.aqi,
        isBest: area.aqi === bestAqi,
        delta: aqiDeltaVal,
        formattedDelta: aqiDeltaVal > 0 ? `+${aqiDeltaVal} AQI higher` : 'Cleanest Air'
      },
      hospitals: {
        value: area.hospitalCount,
        isBest: area.hospitalCount === maxHospitals,
        delta: hospDeltaVal,
        formattedDelta: hospDeltaVal < 0 ? `${hospDeltaVal} fewer` : 'Most Centers'
      },
      groceries: {
        value: area.groceryCount,
        isBest: area.groceryCount === maxGroceries,
        delta: grocDeltaVal,
        formattedDelta: grocDeltaVal < 0 ? `${grocDeltaVal} fewer` : 'Highest Density'
      }
    };

    results[area.key] = item;
    areaResults.push(item);
  }

  return {
    minRent,
    minCommute,
    bestAqi,
    maxHospitals,
    maxGroceries,
    results,
    areas: areaResults
  };
}
