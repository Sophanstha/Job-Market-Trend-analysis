import type { Response, Request } from "express";
import pdfParse from "pdf-parse-fork";
import {
  calculateResumeScore,
  calculateSkillMatch,
  extractSkillsFromResume,
  findSkillGaps,
  generateResumeSummary,
} from "../algorithms/resumeParser.ts";
import JobData                  from "../models/JobData.model.ts";
import { calculateDemandSccore } from "../algorithms/demandScore.ts";
import { getRecommendations }   from "../algorithms/recommend.ts";

const analyzeResume = async (
  req: Request & { file?: Express.Multer.File },
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No PDF file uploaded." });
      return;
    }

    if (req.file.mimetype !== "application/pdf") {
      res.status(400).json({ success: false, message: "Only PDF files are accepted." });
      return;
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text    = pdfData.text;

    if (!text || text.trim().length < 50) {
      res.status(400).json({ success: false, message: "Could not extract text from PDF." });
      return;
    }

    const extractedSkills = extractSkillsFromResume(text);

    if (extractedSkills.length === 0) {
      res.status(400).json({ success: false, message: "No recognizable skills found." });
      return;
    }

    const allJobs = await JobData.find({});

    if (allJobs.length === 0) {
      res.status(500).json({ success: false, message: "Job data not found." });
      return;
    }

    let bestMatch = allJobs[0]!;
    let bestMatchScore = 0;

    allJobs.forEach((job) => {
      const score = calculateSkillMatch(extractedSkills, job.category);
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch      = job;
      }
    });

    const demand          = calculateDemandSccore(bestMatch);
    const skillGaps       = findSkillGaps(extractedSkills, bestMatch.category);
    const recommendations = getRecommendations(bestMatch, allJobs, 3);
    const summary         = generateResumeSummary(
      extractedSkills, bestMatch.title, bestMatchScore, demand.score
    );
    const resumeScore = calculateResumeScore(
      extractedSkills.length, bestMatchScore, demand.score
    );

    res.status(200).json({
      success: true,
      extractedSkills,
      matchedCategory: {
        title:              bestMatch.title,
        category:           bestMatch.category,
        demandScore:        demand.score,
        matchScore:         bestMatchScore,
        trend:              bestMatch.trend,
        averageSalary:      bestMatch.averageSalary,
        growthRate:         bestMatch.growthRate,
        remoteAvailability: bestMatch.remoteAvailability,
        interpretation:     demand.interpretation,
      },
      skillGaps,
      recommendations: recommendations.map((r) => ({
        title:           r.job.title,
        category:        r.job.category,
        demandScore:     r.job.demandScore,
        similarityScore: r.similarityScore,
        reason:          r.reason,
      })),
      summary,
      resumeScore,
    });

  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export default analyzeResume;