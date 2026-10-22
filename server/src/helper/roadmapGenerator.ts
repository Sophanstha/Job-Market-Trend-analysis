import { anthropic } from "../utils/Client.ts";
import { generateGeminiJson } from "../utils/geminiClient.ts";

export interface RoadmapResource {
  title: string;
  type: "documentation" | "course" | "book" | "github";
  url?: string;
  free: boolean;
}

export interface RoadmapProject {
  title: string;
  description: string;
  keySkills: string[];
  deliverable: string;
}

export interface RoadmapChecklistItem {
  id: string;
  text: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  duration: string;
  objective: string;
  topics: string[];
  projects: RoadmapProject[];
  resources: RoadmapResource[];
  milestones: RoadmapChecklistItem[];
}

export interface CareerRoadmap {
  roleTitle: string;
  seniority: string;
  durationWeeks: number;
  estimatedSalaryUplift: string;
  summary: string;
  prerequisites: string[];
  phases: RoadmapPhase[];
  certifications: string[];
  recommendedPortfolioProjects: string[];
}

export interface GenerateRoadmapParams {
  targetRole: string;
  currentSkills?: string[];
  skillGaps?: string[];
  seniority?: string;
  timeCommitment?: string;
  customFocus?: string;
  customApiKey?: string;
}

/**
 * Generates a structured career upskilling roadmap using Google Gemini AI,
 * with graceful fallback to Anthropic.
 */
export const generateCareerRoadmap = async ({
  targetRole,
  currentSkills = [],
  skillGaps = [],
  seniority = "Mid-to-Senior Level",
  timeCommitment = "10–15 hours / week",
  customFocus = "",
  customApiKey,
}: GenerateRoadmapParams): Promise<CareerRoadmap> => {
  const prompt = `You are a principal staff engineer and engineering mentor designing an actionable, career upskilling roadmap for a professional targeting: "${targetRole}" (${seniority}).

Candidate Profile & Gap Analysis:
- Target Role: "${targetRole}"
- Target Seniority: "${seniority}"
- Known Skills: ${currentSkills.length > 0 ? currentSkills.join(", ") : "General software fundamentals"}
- Key Skill Gaps to Bridge: ${skillGaps.length > 0 ? skillGaps.join(", ") : "Modern production engineering standards for " + targetRole}
- Weekly Time Commitment: "${timeCommitment}"
${customFocus ? `- Custom Focus / Context: "${customFocus}"` : ""}

Design a structured, high-impact career upskilling roadmap organized into 3 to 4 sequential phases (spanning 8 to 14 weeks).
Ensure:
1. Each phase has concrete, practical topics (no vague hand-waving).
2. Each phase features hands-on, portfolio-grade project ideas with specific engineering deliverables.
3. Each phase lists high-value, reputable resources (official documentation, top GitHub repos, free books/tutorials).
4. Each phase provides 3 to 4 measurable milestone checklist items.
5. Provide a realistic estimated salary uplift in market value upon completing this roadmap.

Return ONLY a valid JSON object matching this exact shape with no markdown code fences:
{
  "roleTitle": "${targetRole}",
  "seniority": "${seniority}",
  "durationWeeks": 12,
  "estimatedSalaryUplift": "+$18,000 - $35,000 / year",
  "summary": "Concise 2-sentence executive summary of the upskilling path.",
  "prerequisites": ["Foundational requirement 1", "Foundational requirement 2"],
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Phase 1: Core Architecture & Foundations",
      "duration": "Weeks 1–3",
      "objective": "Clear description of the learning outcome.",
      "topics": ["Specific topic 1", "Specific topic 2", "Specific topic 3"],
      "projects": [
        {
          "title": "Project Title",
          "description": "Technical description of what to build.",
          "keySkills": ["Skill 1", "Skill 2"],
          "deliverable": "Working GitHub repo with benchmarks, unit tests, and CI/CD."
        }
      ],
      "resources": [
        {
          "title": "Resource Name",
          "type": "documentation",
          "url": "https://...",
          "free": true
        }
      ],
      "milestones": [
        { "id": "p1-m1", "text": "Deploy and test..." },
        { "id": "p1-m2", "text": "Benchmark throughput..." }
      ]
    }
  ],
  "certifications": ["Industry Standard Cert 1", "Industry Standard Cert 2"],
  "recommendedPortfolioProjects": ["Key Capstone Project 1", "Key Capstone Project 2"]
}
`;

  const geminiKey = (customApiKey && customApiKey.trim().length > 0)
    ? customApiKey.trim()
    : process.env.GEMINI_API_KEY?.trim();

  if (geminiKey) {
    try {
      const parsed = await generateGeminiJson<CareerRoadmap>(prompt, geminiKey);
      return {
        roleTitle: parsed.roleTitle || targetRole,
        seniority: parsed.seniority || seniority,
        durationWeeks: parsed.durationWeeks || 12,
        estimatedSalaryUplift: parsed.estimatedSalaryUplift || "+$15,000 - $30,000 / year",
        summary: parsed.summary || "",
        prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites : [],
        phases: Array.isArray(parsed.phases) ? parsed.phases : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        recommendedPortfolioProjects: Array.isArray(parsed.recommendedPortfolioProjects) ? parsed.recommendedPortfolioProjects : [],
      };
    } catch (geminiError: any) {
      console.warn("Gemini roadmap generation failed, checking for Anthropic fallback:", geminiError.message);
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(`Gemini AI error: ${geminiError.message}`);
      }
    }
  }

  // Fallback to Anthropic if Gemini is not set or failed
  if (process.env.ANTHROPIC_API_KEY) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
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

    const parsed = JSON.parse(cleaned) as CareerRoadmap;
    return {
      roleTitle: parsed.roleTitle || targetRole,
      seniority: parsed.seniority || seniority,
      durationWeeks: parsed.durationWeeks || 12,
      estimatedSalaryUplift: parsed.estimatedSalaryUplift || "+$15,000 - $30,000 / year",
      summary: parsed.summary || "",
      prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites : [],
      phases: Array.isArray(parsed.phases) ? parsed.phases : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      recommendedPortfolioProjects: Array.isArray(parsed.recommendedPortfolioProjects) ? parsed.recommendedPortfolioProjects : [],
    };
  }

  throw new Error("Please configure GEMINI_API_KEY in server/.env or enter your key in settings.");
};
