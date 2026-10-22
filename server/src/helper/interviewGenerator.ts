import { anthropic } from "../utils/Client.ts";
import { generateGeminiJson } from "../utils/geminiClient.ts";

export interface InterviewQuestion {
  question: string;
  hint: string;
}

export interface InterviewQuestionSet {
  technical: InterviewQuestion[];
  behavioral: InterviewQuestion[];
  roleSpecific: InterviewQuestion[];
}

export interface AnswerEvaluation {
  overallScore: number; // 0 to 10
  status: "exceptional" | "strong" | "adequate" | "needs_work";
  scores: {
    technicalAccuracy: number; // 0 to 10
    clarityAndCommunication: number; // 0 to 10
    completeness: number; // 0 to 10
  };
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  idealAnswer: string;
  followUpQuestion: string;
}

export interface GenerateQuestionsParams {
  matchedTitle: string;
  skills?: string[];
  summary?: string;
  seniority?: string;
  customFocus?: string;
  customApiKey?: string;
}

export interface GenerateQuestionsResult {
  matchedTitle: string;
  skills: string[];
  seniority?: string;
  questions: InterviewQuestionSet;
}

/**
 * Generate tailored interview questions dynamically using Google Gemini AI,
 * supporting any custom role, skills, seniority, and focus with zero hardcoded constraints.
 */
export const generateInterviewQuestions = async ({
  matchedTitle,
  skills = [],
  summary = "",
  seniority,
  customFocus,
  customApiKey,
}: GenerateQuestionsParams): Promise<GenerateQuestionsResult> => {
  const targetSeniority = seniority || "Mid-to-Senior Level";
  const userSkillsProvided = skills.length > 0;

  const prompt = `You are a technical hiring manager and engineering interviewer for the role: "${matchedTitle}".

Candidate & Screening Configuration:
- Target Role: "${matchedTitle}"
- Seniority Level: ${targetSeniority}
${userSkillsProvided ? `- Target Competencies: ${skills.join(", ")}` : `- Target Competencies: Dynamically infer the 5-6 most essential modern technical tools, languages, and architecture patterns for "${matchedTitle}".`}
${customFocus ? `- Focus Area / Scenario: ${customFocus}` : ""}
${summary ? `- Background Context: ${summary}` : ""}

Generate a set of interview questions calibrated to ${targetSeniority} expectations for "${matchedTitle}".

Return ONLY a valid JSON object in this exact format, with no markdown code fences:
{
  "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
  "questions": {
    "technical": [
      { "question": "...", "hint": "..." }
    ],
    "behavioral": [
      { "question": "...", "hint": "..." }
    ],
    "roleSpecific": [
      { "question": "...", "hint": "..." }
    ]
  }
}

Rules:
- "skills": List 4-6 primary skills tested. If the user provided skills, keep them; otherwise provide the industry-standard competencies for "${matchedTitle}".
- "technical": exactly 5 questions testing technical concepts, architecture, or tools directly relevant to "${matchedTitle}".
- "behavioral": exactly 3 questions testing communication, team conflict, ambiguity, or project ownership in the context of "${matchedTitle}".
- "roleSpecific": exactly 3 questions testing domain problem solving, scaling, or production decisions specific to "${matchedTitle}".
- "hint": 1 concise sentence highlighting key points a standout answer should cover.
- Calibrate question difficulty and expectations to ${targetSeniority}.
- Keep each question under 28 words.
`;

  const geminiKey = (customApiKey && customApiKey.trim().length > 0)
    ? customApiKey.trim()
    : process.env.GEMINI_API_KEY?.trim();

  if (geminiKey) {
    try {
      const parsed = await generateGeminiJson<{
        skills?: string[];
        questions?: InterviewQuestionSet;
        technical?: InterviewQuestion[];
        behavioral?: InterviewQuestion[];
        roleSpecific?: InterviewQuestion[];
      }>(prompt, geminiKey);

      const resolvedQuestions: InterviewQuestionSet = {
        technical: Array.isArray(parsed.questions?.technical)
          ? parsed.questions.technical
          : Array.isArray(parsed.technical)
          ? parsed.technical
          : [],
        behavioral: Array.isArray(parsed.questions?.behavioral)
          ? parsed.questions.behavioral
          : Array.isArray(parsed.behavioral)
          ? parsed.behavioral
          : [],
        roleSpecific: Array.isArray(parsed.questions?.roleSpecific)
          ? parsed.questions.roleSpecific
          : Array.isArray(parsed.roleSpecific)
          ? parsed.roleSpecific
          : [],
      };

      const resolvedSkills = Array.isArray(parsed.skills) && parsed.skills.length > 0
        ? parsed.skills
        : skills.length > 0
        ? skills
        : ["Architecture", "System Design", "Problem Solving", "Core Concepts"];

      return {
        matchedTitle,
        skills: resolvedSkills,
        seniority: targetSeniority,
        questions: resolvedQuestions,
      };
    } catch (geminiError: any) {
      console.warn("Gemini question generation failed, checking for Anthropic fallback:", geminiError.message);
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(`Gemini AI error: ${geminiError.message}`);
      }
    }
  }

  // Fallback to Anthropic if Gemini is not set or failed
  if (process.env.ANTHROPIC_API_KEY) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((block: any) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI model");
    }

    const cleaned = textBlock.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    const resolvedQuestions: InterviewQuestionSet = {
      technical: Array.isArray(parsed.questions?.technical)
        ? parsed.questions.technical
        : Array.isArray(parsed.technical)
        ? parsed.technical
        : [],
      behavioral: Array.isArray(parsed.questions?.behavioral)
        ? parsed.questions.behavioral
        : Array.isArray(parsed.behavioral)
        ? parsed.behavioral
        : [],
      roleSpecific: Array.isArray(parsed.questions?.roleSpecific)
        ? parsed.questions.roleSpecific
        : Array.isArray(parsed.roleSpecific)
        ? parsed.roleSpecific
        : [],
    };

    return {
      matchedTitle,
      skills: Array.isArray(parsed.skills) ? parsed.skills : skills,
      seniority: targetSeniority,
      questions: resolvedQuestions,
    };
  }

  throw new Error("Please configure GEMINI_API_KEY in server/.env or enter your key in settings.");
};

/**
 * Evaluates an interview answer using Gemini AI, providing scores,
 * rubric breakdown, actionable strengths, gaps, and an ideal model answer.
 */
export const evaluateInterviewAnswer = async ({
  jobTitle,
  category,
  question,
  hint,
  userAnswer,
  skills = [],
  seniority,
  customApiKey,
}: {
  jobTitle: string;
  category: string;
  question: string;
  hint: string;
  userAnswer: string;
  skills?: string[];
  seniority?: string;
  customApiKey?: string;
}): Promise<AnswerEvaluation> => {
  const targetSeniority = seniority || "Mid-to-Senior";

  const prompt = `You are a technical interviewer assessing a candidate for: "${jobTitle}" (${targetSeniority} level).
Target skills / competencies: ${skills.join(", ")}.

Question Category: ${category.toUpperCase()}
Interview Question: "${question}"
Expected Guidance / Hint: "${hint}"

Candidate's Answer:
"""
${userAnswer}
"""

Evaluate the candidate's answer with professional rigor calibrated to a ${targetSeniority} engineer:
1. Overall Score (1.0 - 10.0) and Status ("exceptional" [9.0-10], "strong" [7.5-8.9], "adequate" [5.0-7.4], "needs_work" [<5.0]).
2. Component scores (1 - 10):
   - technicalAccuracy: Correctness, understanding of nuances, trade-offs, avoidance of hand-waving.
   - clarityAndCommunication: Articulation, structure, conciseness.
   - completeness: Addressed prompt directly. For behavioral, evaluate adherence to STAR method.
3. Summary: 1-2 sentence executive assessment note.
4. Strengths: 2 to 3 concise bullet points noting what the candidate did well.
5. Areas to Improve: 2 to 3 concise, specific bullet points on what was missing or how to level up.
6. Ideal Answer: A model benchmark answer (around 90 to 150 words) that would impress a staff interviewer.
7. Follow-up Question: A natural next question an interviewer would probe with.

Return ONLY a valid JSON object in this exact structure, with no markdown code fences:
{
  "overallScore": 8.5,
  "status": "strong",
  "scores": {
    "technicalAccuracy": 9,
    "clarityAndCommunication": 8,
    "completeness": 8
  },
  "summary": "...",
  "strengths": ["...", "..."],
  "areasToImprove": ["...", "..."],
  "idealAnswer": "...",
  "followUpQuestion": "..."
}
`;

  const geminiKey = (customApiKey && customApiKey.trim().length > 0)
    ? customApiKey.trim()
    : process.env.GEMINI_API_KEY?.trim();

  if (geminiKey) {
    try {
      return await generateGeminiJson<AnswerEvaluation>(prompt, geminiKey);
    } catch (err: any) {
      console.warn("Gemini evaluation failed:", err.message);
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(`Gemini evaluation error: ${err.message}`);
      }
    }
  }

  // Fallback to Anthropic if Gemini is not set or failed
  if (process.env.ANTHROPIC_API_KEY) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((block: any) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI model");
    }

    const cleaned = textBlock.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    return JSON.parse(cleaned) as AnswerEvaluation;
  }

  throw new Error("Please configure GEMINI_API_KEY in server/.env or enter your key in settings.");
};