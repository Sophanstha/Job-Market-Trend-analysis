import type { Response, Request } from "express";
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} from "../helper/interviewGenerator.ts";
import JobData from "../models/JobData.model.ts";

export const generateQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { matchedTitle, skills, summary, seniority, customFocus, apiKey } = req.body;
    const headerKey = req.headers["x-gemini-api-key"] as string | undefined;
    const activeApiKey = apiKey || headerKey;

    if (!matchedTitle || typeof matchedTitle !== "string" || matchedTitle.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "A target career role or job title is required.",
      });
      return;
    }

    matchedTitle = matchedTitle.trim();

    // If user provided no skills, attempt to find in database, or let Gemini infer dynamically
    if (!Array.isArray(skills) || skills.length === 0) {
      const job = await JobData.findOne({
        $or: [
          { category: matchedTitle.toLowerCase() },
          { title: new RegExp(`^${matchedTitle}$`, "i") },
        ],
      }).lean();

      if (job && job.topSkills?.length) {
        skills = job.topSkills;
      } else {
        skills = [];
      }
    }

    const result = await generateInterviewQuestions({
      matchedTitle,
      skills,
      summary: summary || "",
      seniority,
      customFocus,
      customApiKey: activeApiKey,
    });

    res.status(200).json({
      success: true,
      matchedTitle: result.matchedTitle,
      skills: result.skills,
      seniority: result.seniority,
      questions: result.questions,
    });
  } catch (error) {
    console.error("Interview question generation error:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || "Failed to generate interview questions.",
    });
  }
};

export const evaluateAnswer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      jobTitle,
      category = "technical",
      question,
      hint = "",
      userAnswer,
      skills = [],
      seniority,
      apiKey,
    } = req.body;

    const headerKey = req.headers["x-gemini-api-key"] as string | undefined;
    const activeApiKey = apiKey || headerKey;

    if (!question || !userAnswer || userAnswer.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Both question and candidate userAnswer are required.",
      });
      return;
    }

    const evaluation = await evaluateInterviewAnswer({
      jobTitle: jobTitle || "Engineering Professional",
      category,
      question,
      hint,
      userAnswer: userAnswer.trim(),
      skills: Array.isArray(skills) ? skills : [],
      seniority,
      customApiKey: activeApiKey,
    });

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("Interview answer evaluation error:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || "Failed to evaluate interview answer.",
    });
  }
};

export const getInterviewRoles = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const jobs = await JobData.find({})
      .select("category title topSkills topRoles averageSalary")
      .lean();

    const roles = jobs.map((j) => ({
      category: j.category,
      title: j.title,
      topSkills: j.topSkills || [],
      topRoles: j.topRoles || [],
      averageSalary: j.averageSalary,
    }));

    res.status(200).json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error("Fetch interview roles error:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || "Failed to load roles.",
    });
  }
};