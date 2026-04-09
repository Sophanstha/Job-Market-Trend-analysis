import type { IJobData } from "../type/types.ts";

// ── Build a keyword vector for a job ─────────────────────────
const buildVector = (job: IJobData): Map<string, number> => {
  const vector = new Map<string, number>();

  // Keywords carry the most weight
  job.keywords.forEach((kw) => {
    vector.set(kw.toLowerCase(), (vector.get(kw.toLowerCase()) || 0) + 3);
  });

  // Skills carry medium weight
  job.topSkills.forEach((skill) => {
    const key = skill.toLowerCase();
    vector.set(key, (vector.get(key) || 0) + 2);
  });

  // Industries carry light weight
  job.industries.forEach((ind) => {
    const key = ind.toLowerCase();
    vector.set(key, (vector.get(key) || 0) + 1);
  });

  // Trend similarity
  vector.set(`trend_${job.trend}`, 2);

  return vector;
};

// ── Cosine similarity between two vectors ────────────────────
const cosineSimilarity = (
  vecA: Map<string, number>,
  vecB: Map<string, number>
): number => {
  let dotProduct  = 0;
  let magnitudeA  = 0;
  let magnitudeB  = 0;

  // Dot product — only iterate vecA keys
  vecA.forEach((valA, key) => {
    const valB = vecB.get(key) || 0;
    dotProduct += valA * valB;
    magnitudeA += valA * valA;
  });

  // Magnitude of vecB
  vecB.forEach((valB) => {
    magnitudeB += valB * valB;
  });

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
};

// ── Main recommendation function ─────────────────────────────
export interface RecommendationResult {
  job: IJobData;
  similarityScore: number;
  reason: string;
}

export const getRecommendations = (
  targetJob: IJobData,
  allJobs: IJobData[],
  limit: number = 3
): RecommendationResult[] => {
  const targetVector = buildVector(targetJob);

  const recommendations = allJobs
    // Exclude the job itself
    .filter((job) => job.category !== targetJob.category)
    .map((job) => {
      const jobVector    = buildVector(job);
      const similarity   = cosineSimilarity(targetVector, jobVector);

      // Build a human-readable reason
      const sharedSkills = job.topSkills.filter((s) =>
        targetJob.topSkills.includes(s)
      );
      const sharedIndustries = job.industries.filter((i) =>
        targetJob.industries.includes(i)
      );

      let reason = "";
      if (sharedSkills.length > 0) {
        reason = `Shares skills: ${sharedSkills.slice(0, 2).join(", ")}`;
      } else if (sharedIndustries.length > 0) {
        reason = `Works in same industries: ${sharedIndustries.slice(0, 2).join(", ")}`;
      } else if (job.trend === targetJob.trend) {
        reason = `Both are ${job.trend} fields`;
      } else {
        reason = "Complementary career path";
      }

      return {
        job,
        similarityScore: Math.round(similarity * 100),
        reason,
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  return recommendations;
};

// ── Query-based recommendation (no target job needed) ────────
export const getRecommendationsByQuery = (
  query: string,
  allJobs: IJobData[],
  excludeCategory: string,
  limit: number = 3
): RecommendationResult[] => {
  const queryLower = query.toLowerCase();

  // Score each job by how many query words appear in keywords/skills
  const scored = allJobs
    .filter((job) => job.category !== excludeCategory)
    .map((job) => {
      const queryWords   = queryLower.split(/\s+/);
      const allJobTerms  = [
        ...job.keywords,
        ...job.topSkills.map((s) => s.toLowerCase()),
      ];

      const matchCount = queryWords.filter((word) =>
        allJobTerms.some((term) => term.includes(word) || word.includes(term))
      ).length;

      return {
        job,
        similarityScore: Math.round((matchCount / queryWords.length) * 100),
        reason: "Related to your search",
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  return scored;
};