import type { IJobData } from "../type/types.ts";


const WEIGHT = {
  growthRate:         0.35,
  jobOpenings:        0.30,
  averageSalary:      0.20,
  remoteAvailability: 0.15,
};

const RANGE = {
  growthRate:         { min: -20,   max: 40    },
  jobOpenings:        { min: 0,     max: 10000 }, // ← lower max to match real data
  averageSalary:      { min: 40000, max: 200000 },
  remoteAvailability: { min: 0,     max: 100   },
};

const normalize = (value: number, min: number, max: number): number => {
  if (max === min) return 0;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(1, normalized));
};

export interface DemandResult {
  score: number;
  breakdown: {
    growthScore:   number;
    openingsScore: number;
    salaryScore:   number;
    remoteScore:   number;
  };
  label:          string;
  interpretation: string;
}

export const calculateDemandSccore = (job: IJobData): DemandResult => {
  const growthNorm = normalize(job.growthRate,         RANGE.growthRate.min,         RANGE.growthRate.max);
  const openNorm   = normalize(job.jobOpenings,        RANGE.jobOpenings.min,        RANGE.jobOpenings.max);
  const salNorm    = normalize(job.averageSalary,      RANGE.averageSalary.min,      RANGE.averageSalary.max);
  const remNorm    = normalize(job.remoteAvailability, RANGE.remoteAvailability.min, RANGE.remoteAvailability.max);

  const weightedScore =
    growthNorm * WEIGHT.growthRate +
    openNorm   * WEIGHT.jobOpenings +
    salNorm    * WEIGHT.averageSalary +
    remNorm    * WEIGHT.remoteAvailability;

  const score = Math.round(weightedScore * 100);

  let label:          string;
  let interpretation: string;

if (score >= 65) {
  label          = "Very High Demand";
  interpretation = "Excellent career choice. Massive hiring, strong salary, and fast growth. Skills in this area are urgently needed.";
} else if (score >= 50) {
  label          = "High Demand";
  interpretation = "Strong career choice. Consistent hiring and good salary. Competition exists but opportunities are plentiful.";
} else if (score >= 38) {
  label          = "Moderate Demand";
  interpretation = "Decent career choice. Steady opportunities but the market is competitive. Specialising helps stand out.";
} else if (score >= 25) {
  label          = "Low Demand";
  interpretation = "Challenging market. Fewer openings and slower growth. Consider combining with a higher-demand skill set.";
} else {
  label          = "Very Low Demand";
  interpretation = "Difficult market. Significant challenges in finding roles. Pivot or upskill into an adjacent growing field.";
}

  return {
    score,
    breakdown: {
      growthScore:   Math.round(growthNorm * 100),
      openingsScore: Math.round(openNorm   * 100),
      salaryScore:   Math.round(salNorm    * 100),
      remoteScore:   Math.round(remNorm    * 100),
    },
    label,
    interpretation,
  };
};

export const rankByDemand = (
  jobs: IJobData[]
): Array<IJobData & { demandResult: DemandResult }> => {
  return jobs
    .map((job) => ({
      ...job.toObject(),
      demandResult: calculateDemandSccore(job),  // ← fixed name
    }))
    .sort((a, b) => b.demandResult.score - a.demandResult.score);
};

