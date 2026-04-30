import type { Response } from "express";
import type { AuthRequest, IJobData } from "../type/types.ts";
import JobData from "../models/JobData.model.ts";
import rankJobsByQuery from "../algorithms/tfitdf.ts";
import { calculateDemandSccore } from "../algorithms/demandScore.ts";
import { getRecommendations } from "../algorithms/recommend.ts";
import SearchHistory from "../models/SearchHistory.ts";


export const search = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;
    console.log(query)
    //  Load all jobs from MongoDB
    const allJobs = await JobData.find({});
    if (!JobData) {
      res
        .status(404)
        .json({ message: "No job data found. Please seed the database." });
      return;
    }
    // Run TF-IDF search
    const tfidfResults = rankJobsByQuery(query, allJobs);
    if (tfidfResults.length === 0) {
      res
        .status(404)
        .json({ message: "No matching results found for your query." });
      return;
    }
    //   take a top resilt
    const topMatch = tfidfResults[0];
    if (!topMatch) {
      res.status(404).json({ message: "No matching results found." });
      return;
    }
    const topResult = topMatch.job;

    // 4 Calculate demand score
    const demandResult = calculateDemandSccore(topResult);

    // 5  Get recommendations
    const recommendation = getRecommendations(topResult, allJobs, 3);

    //6 save to the history data
    const userid = req.user?._id;
    const historyEntry = await SearchHistory.create
    ({
        userId : userid ?? null,
        query,
        resultsCount : tfidfResults.length,
        topResult : topResult.title
    })
    // link to user if login
    if(req.user){
        await req.user.updateOne({
            $push : {searchHistory : historyEntry._id}
        })
    }
    res.status(200).json({
            success: true,
        query,
        result: {
          job: topResult,
          relevanceScore: Math.round((topMatch.score ?? 0) * 100) / 100,
          demand: demandResult,
        },
        otherMatches: tfidfResults.slice(1, 4).map((r) => ({
          title: r.job.title,
          category: r.job.category,
          score: Math.round(r.score * 100) / 100,
        })),
        recommendations: recommendation.map((r) => ({
          title: r.job.title,
          category: r.job.category,
          demandScore: r.job.demandScore,
          similarityScore: r.similarityScore,
          reason: r.reason,
        })),
    })

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const compare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { a, b } = req.query;

    if (!a || !b) {
      res.status(400).json({ 
        message: "Provide two jobs: ?a=ai&b=cloud or ?a=software engineer&b=data scientist" 
      });
      return;
    }

    // ── Search by category OR title (case-insensitive) ────────
    const findJob = async (query: string) => {
      const q = query.trim().toLowerCase();

      // First try exact category match
      const byCategory = await JobData.findOne({
        category: { $regex: `^${q}$`, $options: "i" },
      });
      if (byCategory) return byCategory;

      // Then try partial title match
      const byTitle = await JobData.findOne({
        title: { $regex: q, $options: "i" },
      });
      if (byTitle) return byTitle;

      // Finally try keyword match
      const byKeyword = await JobData.findOne({
        keywords: { $elemMatch: { $regex: q, $options: "i" } },
      });
      return byKeyword;
    };

    const jobA = await findJob(a as string);
    const jobB = await findJob(b as string);

    // ── Detailed not found message ────────────────────────────
    if (!jobA && !jobB) {
      res.status(404).json({ 
        message: `Neither "${a}" nor "${b}" found. Try: ai, software, data, cybersecurity, cloud, healthcare, finance, remote, green, design` 
      });
      return;
    }
    if (!jobA) {
      res.status(404).json({ 
        message: `"${a}" not found. Try: ai, software, data, cybersecurity, cloud` 
      });
      return;
    }
    if (!jobB) {
      res.status(404).json({ 
        message: `"${b}" not found. Try: ai, software, data, cybersecurity, cloud` 
      });
      return;
    }

    // ── Prevent comparing same job ────────────────────────────
    if (jobA.category === jobB.category) {
      res.status(400).json({ 
        message: "Both queries matched the same category. Try different jobs." 
      });
      return;
    }

    // ── Calculate demand scores ───────────────────────────────
    const demandA = calculateDemandSccore(jobA);
    const demandB = calculateDemandSccore(jobB);

    // ── Determine winner per metric ───────────────────────────
    const higherSalary  = jobA.averageSalary  >= jobB.averageSalary  ? "A" : "B";
    const higherGrowth  = jobA.growthRate     >= jobB.growthRate     ? "A" : "B";
    const higherDemand  = demandA.score       >= demandB.score       ? "A" : "B";
    const higherRemote  = jobA.remoteAvailability >= jobB.remoteAvailability ? "A" : "B";

    res.status(200).json({
      success: true,
      comparison: {
        categoryA: {
          title:              jobA.title,
          category:           jobA.category,
          demand:             demandA,
          averageSalary:      jobA.averageSalary,
          entryLevelSalary:   jobA.entryLevelSalary,
          seniorLevelSalary:  jobA.seniorLevelSalary,
          growthRate:         jobA.growthRate,
          trend:              jobA.trend,
          topSkills:          jobA.topSkills,
          remoteAvailability: jobA.remoteAvailability,
          jobOpenings:        jobA.jobOpenings,
        },
        categoryB: {
          title:              jobB.title,
          category:           jobB.category,
          demand:             demandB,
          averageSalary:      jobB.averageSalary,
          entryLevelSalary:   jobB.entryLevelSalary,
          seniorLevelSalary:  jobB.seniorLevelSalary,
          growthRate:         jobB.growthRate,
          trend:              jobB.trend,
          topSkills:          jobB.topSkills,
          remoteAvailability: jobB.remoteAvailability,
          jobOpenings:        jobB.jobOpenings,
        },
        winner: {
          overall:    demandA.score >= demandB.score ? jobA.title : jobB.title,
          salary:     higherSalary  === "A" ? jobA.title : jobB.title,
          growth:     higherGrowth  === "A" ? jobA.title : jobB.title,
          demand:     higherDemand  === "A" ? jobA.title : jobB.title,
          remote:     higherRemote  === "A" ? jobA.title : jobB.title,
        },
        differences: {
          salaryDiff: Math.abs(jobA.averageSalary      - jobB.averageSalary),
          growthDiff: Math.abs(jobA.growthRate         - jobB.growthRate),
          demandDiff: Math.abs(demandA.score           - demandB.score),
          remoteDiff: Math.abs(jobA.remoteAvailability - jobB.remoteAvailability),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};