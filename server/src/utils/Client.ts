import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config()

if (!process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
  console.warn("Neither GEMINI_API_KEY nor ANTHROPIC_API_KEY is configured. AI generation features will require a client-supplied key.");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});