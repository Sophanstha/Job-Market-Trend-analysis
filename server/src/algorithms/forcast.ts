export interface ForecastPoint {
  year:        number;
  score:       number;
  confidence:  "high" | "medium" | "low";
}

export interface PresentMarket {
  data:          ForecastPoint[];
  currentScore:  number;
  currentYear:   number;
  totalGrowth:   number;   // % growth from first year to now
  label:         string;
}

export interface FutureMarket {
  data:          ForecastPoint[];
  score2030:     number;
  peakYear:      number;
  peakScore:     number;
  cagr:          number;
  trend2030:     "surging" | "growing" | "plateauing" | "declining";
  insight:       string;
}

export interface ForecastResult {
  present: PresentMarket;
  future:  FutureMarket;
}

// ── Linear Regression ──────────────────────────────────────────
const linearRegression = (
  years:  number[],
  scores: number[]
): { slope: number; intercept: number } => {
  const n     = years.length;
  const sumX  = years.reduce((a, b) => a + b, 0);
  const sumY  = scores.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((a, y, i) => a + y * (scores[i] ?? 0), 0);
  const sumXX = years.reduce((a, y) => a + y * y, 0);

  const slope     = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

// ── Exponential Smoothing ───────────────────────────────────────
const exponentialSmooth = (scores: number[], alpha: number = 0.45): number[] => {
  const smoothed = [scores[0] ?? 0];
  for (let i = 1; i < scores.length; i++) {
    const prev = smoothed[i - 1] ?? 0;
    const curr = scores[i]       ?? 0;
    smoothed.push(alpha * curr + (1 - alpha) * prev);
  }
  return smoothed;
};

// ── CAGR ─────────────────────────────────────────────────────────
const calcCAGR = (start: number, end: number, years: number): number => {
  if (start <= 0 || years <= 0) return 0;
  return Math.round(((Math.pow(end / start, 1 / years) - 1) * 100) * 10) / 10;
};

const clamp = (val: number): number => Math.max(0, Math.min(100, Math.round(val)));

// ── Generate a synthetic 2025 point from existing data ──────────
// Your historicalDemand only goes to 2024, so extend one year
// using the recent trend before splitting present/future
const extendToCurrentYear = (
  historicalDemand: number[],
  years:            number[],
  growthRate:       number
): { demand: number[]; years: number[] } => {
  const lastYear  = years[years.length - 1] ?? 2024;
  const lastScore = historicalDemand[historicalDemand.length - 1] ?? 50;

  if (lastYear >= 2025) {
    return { demand: historicalDemand, years };
  }

  // Estimate 2025 using recent growth momentum
  const recent  = historicalDemand.slice(-3);
  const avgStep = recent.length > 1
    ? (recent[recent.length - 1]! - recent[0]!) / (recent.length - 1)
    : growthRate / 10;

  const score2025 = clamp(lastScore + avgStep);

  return {
    demand: [...historicalDemand, score2025],
    years:  [...years, 2025],
  };
};

// ── Main function ────────────────────────────────────────────────
export const forecastDemand = (
  historicalDemand: number[],
  years:            number[],
  growthRate:       number
): ForecastResult => {

  // ── Extend data to include 2025 (present) ──────────────────────
  const extended = extendToCurrentYear(historicalDemand, years, growthRate);

  // ══════════════════════════════════════════════════════════════
  // PART 1 — PRESENT MARKET (up to 2025)
  // ══════════════════════════════════════════════════════════════
  const presentData: ForecastPoint[] = extended.years.map((year, i) => ({
    year,
    score:      extended.demand[i] ?? 0,
    confidence: "high",
  }));

  const firstScore   = extended.demand[0] ?? 50;
  const currentScore = extended.demand[extended.demand.length - 1] ?? 50;
  const currentYear  = extended.years[extended.years.length - 1] ?? 2025;
  const totalGrowth  = firstScore > 0
    ? Math.round(((currentScore - firstScore) / firstScore) * 100)
    : 0;

  const presentLabel =
    currentScore >= 65 ? "Very High Demand" :
    currentScore >= 50 ? "High Demand"      :
    currentScore >= 38 ? "Moderate Demand"  :
    currentScore >= 25 ? "Low Demand"       :
                         "Very Low Demand";

  const present: PresentMarket = {
    data:         presentData,
    currentScore,
    currentYear,
    totalGrowth,
    label:        presentLabel,
  };

  // ══════════════════════════════════════════════════════════════
  // PART 2 — FUTURE MARKET (2026 to 2030)
  // ══════════════════════════════════════════════════════════════
  const { slope, intercept } = linearRegression(extended.years, extended.demand);
  const smoothed     = exponentialSmooth(extended.demand, 0.45);
  const lastSmoothed = smoothed[smoothed.length - 1] ?? currentScore;

  const growthMultiplier =
    growthRate >= 30 ? 0.85 :
    growthRate >= 15 ? 0.60 :
    growthRate >= 0  ? 0.30 :
                      -0.50;

  const futureYears = [2026, 2027, 2028, 2029, 2030];

  const futureData: ForecastPoint[] = futureYears.map((year, idx) => {
    const yearsAhead = idx + 1;

    const linearEst = slope * year + intercept;
    const growthEst = lastSmoothed + (growthMultiplier * (yearsAhead * 2.5));

    const blendWeight = Math.min(yearsAhead / 5, 0.7);
    const blended     = (1 - blendWeight) * growthEst + blendWeight * linearEst;
    const score       = clamp(blended);

    const confidence: "high" | "medium" | "low" =
      yearsAhead <= 2 ? "high" :
      yearsAhead <= 3 ? "medium" : "low";

    return { year, score, confidence };
  });

  const score2030 = futureData[futureData.length - 1]?.score ?? currentScore;
  const peakPoint = futureData.reduce((a, b) => b.score > a.score ? b : a);
  const cagr      = calcCAGR(currentScore, score2030, 5);

  const scoreDiff = score2030 - currentScore;
  const trend2030: FutureMarket["trend2030"] =
    scoreDiff >= 8  ? "surging"    :
    scoreDiff >= 2  ? "growing"    :
    scoreDiff >= -2 ? "plateauing" : "declining";

  const insight = generateInsight(trend2030, score2030, cagr);

  const future: FutureMarket = {
    data:      futureData,
    score2030,
    peakYear:  peakPoint.year,
    peakScore: peakPoint.score,
    cagr,
    trend2030,
    insight,
  };

  return { present, future };
};

const generateInsight = (
  trend:     string,
  score2030: number,
  cagr:      number
): string => {
  if (trend === "surging")
    return `Demand is projected to surge to ${score2030}/100 by 2030 with a ${cagr}% annual growth rate. This will be one of the hottest job markets globally. Skills here will be urgently needed.`;
  if (trend === "growing")
    return `Demand is expected to grow steadily to ${score2030}/100 by 2030 at ${cagr}% per year. Consistent opportunities with good career stability — a solid long-term investment.`;
  if (trend === "plateauing")
    return `Demand is projected to plateau around ${score2030}/100 by 2030. The market is maturing. Specialization and niche skills will be key to standing out.`;
  return `Demand may decline to ${score2030}/100 by 2030. Consider pivoting to adjacent growing fields or developing hybrid skills to stay competitive.`;
};