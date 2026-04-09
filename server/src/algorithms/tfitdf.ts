import type { IJobData } from "../type/types.ts";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "it",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "and",
  "or",
  "but",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "i",
  "me",
  "my",
  "we",
  "you",
  "he",
  "she",
  "they",
  "what",
  "which",
  "who",
  "this",
  "that",
  "these",
  "those",
  "with",
  "as",
  "by",
  "from",
  "about",
  "into",
  "through",
  "how",
  "good",
  "best",
  "jobs",
  "job",
  "work",
  "career",
  "field",
  "industry",
  "now",
]);
// 1 token size and clean text
const tokenize = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
};

// 2 Count term frequency in a document
const computeTF = (tokens: string[]): Map<string, number> => {
  const tf = new Map<string, number>();
  tokens.forEach((token) => {
    tf.set(token, (tf.get(token) || 0) + 1);
  });
  // Normalize by total token count
  tf.forEach((count, term) => {
    tf.set(term, count / tokens.length);
  });
  return tf;
};
// Compute idf across all the documnent
const computeIDF = (
  allDocuments: string[][],
  vocabulary: Set<string>,
): Map<string, number> => {
  const idf = new Map<string, number>();
  const N = allDocuments.length;

  vocabulary.forEach((term) => {
    const docsWithTerm = allDocuments.filter((doc) =>
      doc.includes(term),
    ).length;
    // IDF = log(N / (1 + docsWithTerm)) — the +1 prevents division by zero
    idf.set(term, Math.log(N / (1 + docsWithTerm)));
  });

  return idf;
};
// Build document from a job entry
const buildJobDocument = (job: IJobData): string => {
  return [
    job.title,
    job.category,
    job.summary,
    ...job.keywords,
    ...job.topSkills,
    ...job.topRoles,
    ...job.industries,
  ].join(" ");
};

//  ── Main TF-IDF scoring function ─────────────────────────────
export interface TFIDResult {
  job: IJobData;
  score: number;
}
export const rankJobsByQuery = (
  query: string,
  jobs: IJobData[],
): TFIDResult[] => {
  if (!query.trim() || jobs.length === 0) return [];

  // Tokenize query
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  // Build all job documents
  const jobDocuments = jobs.map((job) => tokenize(buildJobDocument(job)));

  // Build vocabulary from query tokens only (we score against query)
  const vocabulary = new Set(queryTokens);

  // Compute IDF across all job documents
  const idf = computeIDF(jobDocuments, vocabulary);

  // Score each job
  const results: TFIDResult[] = jobs.map((job, index) => {
    const docTokens = jobDocuments[index] ?? [];
    const tf = computeTF(docTokens);

    // TF-IDF score = sum of (tf * idf) for each query term
    let score = 0;
    queryTokens.forEach((term) => {
      const termTF = tf.get(term) || 0;
      const termIDF = idf.get(term) || 0;
      score += termTF * termIDF;
    });

    // Bonus: exact keyword match in job.keywords array
    const queryLower = query.toLowerCase();
    const keywordBonus = job.keywords.some(
      (kw) => queryLower.includes(kw) || kw.includes(queryTokens[0] || ""),
    )
      ? 0.3
      : 0;

    // Bonus: category match
    const categoryBonus = queryLower.includes(job.category) ? 0.5 : 0;

    return {
      job,
      score: score + keywordBonus + categoryBonus,
    };
  });

  // Sort by score descending, filter out zero scores
  return results.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
};

export default rankJobsByQuery;
