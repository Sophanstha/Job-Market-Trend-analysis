import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Returns a GoogleGenAI client initialized with the provided key
 * or falls back to process.env.GEMINI_API_KEY.
 */
export const getGeminiClient = (customApiKey?: string): GoogleGenAI => {
  const apiKey = (customApiKey && customApiKey.trim().length > 0)
    ? customApiKey.trim()
    : process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Gemini API Key is missing. Please set GEMINI_API_KEY in server/.env or provide your key in the Interview settings."
    );
  }

  return new GoogleGenAI({ apiKey });
};

const CANDIDATE_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
];

/**
 * Helper to call Gemini and parse JSON responses reliably with graceful model fallback.
 */
export const generateGeminiJson = async <T>(
  prompt: string,
  customApiKey?: string,
  preferredModel?: string
): Promise<T> => {
  const ai = getGeminiClient(customApiKey);

  const modelsToTry = preferredModel
    ? [preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== preferredModel)]
    : CANDIDATE_MODELS;

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text || "";
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      if (!cleaned) {
        throw new Error("Empty response received from Gemini model.");
      }

      return JSON.parse(cleaned) as T;
    } catch (err: any) {
      console.warn(`[Gemini] Model ${model} failed: ${err.message || err}. Trying next fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed to generate content.");
};
