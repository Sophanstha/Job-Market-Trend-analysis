import type { Response, Request } from "express";
import { generateInterviewQuestions } from "../helper/interviewGenerator.ts";

export const generateQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { matchedTitle, skills, summary } = req.body;

    if (!matchedTitle || !Array.isArray(skills) || skills.length === 0) {
      res.status(400).json({
        success: false,
        message: "matchedTitle and a non-empty skills array are required.",
      });
      return;
    }

    const questions = await generateInterviewQuestions(
      matchedTitle,
      skills,
      summary || ""
    );

    res.status(200).json({
      success: true,
      matchedTitle,
      questions,
    });

  } catch (error) {
    console.error("Interview question generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate interview questions. Please try again.",
    });
  }
};