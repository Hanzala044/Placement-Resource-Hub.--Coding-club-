import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { AiSummary } from "./types";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local to use the AI summary feature."
    );
  }
  client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * Bonus AI feature: summarize an interview experience write-up into a
 * 2-3 sentence TL;DR plus 3-5 suggested topic tags. Asks Gemini for strict
 * JSON so the caller doesn't have to guess at a string-splitting format.
 */
export async function generateExperienceSummary(content: string): Promise<AiSummary> {
  const ai = getClient();

  const prompt = `You help students skim a placement interview-experience database.
Read the write-up below and respond with ONLY minified JSON (no markdown fences), exactly this shape:
{"summary": string (2-3 plain, specific sentences), "tags": string[] (3-5 short lowercase topic tags, e.g. "dsa", "system-design", "hr-round")}

Write-up:
"""
${content}
"""`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const raw = response.text ?? "";

  try {
    const parsed = JSON.parse(raw);
    const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t: unknown): t is string => typeof t === "string").slice(0, 5)
      : [];
    if (!summary) throw new Error("empty summary");
    return { summary, tags };
  } catch {
    // Model didn't return clean JSON — fall back to showing the raw text
    // rather than failing the request outright.
    return { summary: raw.trim() || "AI did not return a usable summary.", tags: [] };
  }
}
