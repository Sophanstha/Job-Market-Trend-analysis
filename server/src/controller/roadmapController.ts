import type { Response, Request } from "express";
import { generateCareerRoadmap } from "../helper/roadmapGenerator.ts";
import JobData from "../models/JobData.model.ts";

export const generateRoadmap = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let {
      targetRole,
      currentSkills = [],
      skillGaps = [],
      seniority = "Mid-to-Senior Level",
      timeCommitment = "10–15 hours / week",
      customFocus = "",
      apiKey,
    } = req.body;

    const headerKey = req.headers["x-gemini-api-key"] as string | undefined;
    const activeApiKey = apiKey || headerKey;

    if (!targetRole || typeof targetRole !== "string" || targetRole.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "A target career role or job title is required.",
      });
      return;
    }

    targetRole = targetRole.trim();

    // If no skillGaps provided, check if JobData exists to supply recommended skills
    if (!Array.isArray(skillGaps) || skillGaps.length === 0) {
      const job = await JobData.findOne({
        $or: [
          { category: targetRole.toLowerCase() },
          { title: new RegExp(`^${targetRole}$`, "i") },
        ],
      }).lean();

      if (job && job.topSkills?.length) {
        // Missing skills are job's topSkills not in currentSkills
        skillGaps = job.topSkills.filter(
          (s) => !currentSkills.map((c: string) => c.toLowerCase()).includes(s.toLowerCase())
        );
        if (skillGaps.length === 0) {
          skillGaps = job.topSkills.slice(0, 4);
        }
      }
    }

    const roadmap = await generateCareerRoadmap({
      targetRole,
      currentSkills: Array.isArray(currentSkills) ? currentSkills : [],
      skillGaps: Array.isArray(skillGaps) ? skillGaps : [],
      seniority,
      timeCommitment,
      customFocus,
      customApiKey: activeApiKey,
    });

    res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || "Failed to generate career roadmap.",
    });
  }
};
