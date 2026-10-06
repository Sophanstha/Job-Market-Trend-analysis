import { anthropic } from "../utils/Client.ts";

export interface InterviewQuestion {
  question: string;
  hint:     string;
}

export interface InterviewQuestionSet {
  technical:      InterviewQuestion[];
  behavioral:     InterviewQuestion[];
  roleSpecific:   InterviewQuestion[];
}

export const generateInterviewQuestions = async (
  matchedTitle: string,
  skills:       string[],
  summary:      string
): Promise<InterviewQuestionSet> => {

  const prompt = `You are a hiring manager preparing interview questions for a candidate.

Candidate profile:
- Matched career: ${matchedTitle}
- Skills detected on resume: ${skills.join(", ")}
- Resume summary: ${summary}

Generate interview questions tailored specifically to this candidate's actual skills and matched career. Do not generate generic questions unrelated to their listed skills.

Return ONLY valid JSON in exactly this shape, with no markdown formatting, no code fences, and no extra text before or after:

{
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

Rules:
- "technical" must have exactly 5 questions, each testing one of the candidate's actual listed skills
- "behavioral" must have exactly 3 general behavioral/soft-skill questions relevant to working in ${matchedTitle}
- "roleSpecific" must have exactly 3 questions specific to the ${matchedTitle} field, testing domain knowledge beyond just tools
- "hint" should be 1 short sentence guiding what a strong answer would cover — not the full answer
- Keep each question under 25 words
- Do not repeat the same skill twice across technical questions`;

  const response = await anthropic.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block:any) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Strip potential markdown code fences before parsing
  const cleaned = textBlock.text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed: InterviewQuestionSet;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Failed to parse interview questions from AI response");
  }

  // Basic shape validation with fallback
  return {
    technical:    Array.isArray(parsed.technical)    ? parsed.technical    : [],
    behavioral:   Array.isArray(parsed.behavioral)   ? parsed.behavioral   : [],
    roleSpecific: Array.isArray(parsed.roleSpecific) ? parsed.roleSpecific : [],
  };
};