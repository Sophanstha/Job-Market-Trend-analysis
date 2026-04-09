import type { IJobData } from "../type/types.ts";


const WEIGHT = {
    growthRate:      0.35,  // How fast is the field growing?
  jobOpenings:     0.30,  // How many positions are available?
  averageSalary:   0.20,  // How well does it pay?
  remoteAvailability: 0.15,
}

const RANGE = {
    growthRate : { min: -20, max: 40  },
    jobOpening : {min :0 , max : 750000},
    averageSalary : {min: 40000, max: 180000},
     remoteAvailability: { min: 0, max: 100 },
}
// Normalize a value to 0-1 scale
const normalize = (value : number , min:number,max :number): number=>{
if(max === min) return 0 ;
const normalized = (value - min) / (max - min)

return Math.max(0,Math.min(1,normalized))
}

// ── Main demand score calculator ─────────────────────────────
export interface DemandResult {
  score: number;          // Final score 0-100
  breakdown: {
    growthScore:    number;
    openingsScore:  number;
    salaryScore:    number;
    remoteScore:    number;
  };
  label: string;          // "Very High", "High", etc.
  interpretation: string; // Plain English meaning
}

export const calculateDemandSccore =(job:IJobData): DemandResult =>{
const growthNorm = normalize(job.growthRate, RANGE.growthRate.min , RANGE.growthRate.max)
  const openNorm    = normalize(job.jobOpenings,        RANGE.jobOpening.min,        RANGE.jobOpening.max);
  const salaryNorm  = normalize(job.averageSalary,      RANGE.averageSalary.min,      RANGE.averageSalary.max);
  const remoteNorm  = normalize(job.remoteAvailability, RANGE.remoteAvailability.min, RANGE.remoteAvailability.max);


    const weightedScore = growthNorm * WEIGHT.growthRate + openNorm *WEIGHT.jobOpenings +salaryNorm * WEIGHT.averageSalary +remoteNorm*WEIGHT.remoteAvailability
    const score = Math.round(weightedScore*100)

     // Label and interpretation
  let label: string;
  let interpretation: string;

  if (score >= 85) {
    label = "Very High Demand";
    interpretation = "Excellent career choice. Massive hiring, strong salary, and fast growth. Skills in this area are urgently needed.";
  } else if (score >= 70) {
    label = "High Demand";
    interpretation = "Strong career choice. Consistent hiring and good salary. Competition exists but opportunities are plentiful.";
  } else if (score >= 55) {
    label = "Moderate Demand";
    interpretation = "Decent career choice. Steady opportunities but the market is competitive. Specialising helps stand out.";
  } else if (score >= 40) {
    label = "Low Demand";
    interpretation = "Challenging market. Fewer openings and slower growth. Consider combining with a higher-demand skill set.";
  } else {
    label = "Very Low Demand";
    interpretation = "Difficult market. Significant challenges in finding roles. Pivot or upskill into an adjacent growing field.";
  }
  return {
    score ,
    breakdown :{
    growthScore:   Math.round(growthNorm  * 100),
      openingsScore: Math.round(openNorm    * 100),
      salaryScore:   Math.round(salaryNorm  * 100),
      remoteScore:   Math.round(remoteNorm  * 100),
    },
    label,
    interpretation
  }

}

export const rankByDemand = (job :IJobData[]): Array<IJobData & { demandResult: DemandResult }>=>{
return job.map((job)=>({
    ...job.toObject(),
    demandResult : calculateDemandSccore(job)
})
)
 .sort((a, b) => b.demandResult.score - a.demandResult.score);
}

