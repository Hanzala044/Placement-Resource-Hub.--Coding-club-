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

/** Turns the SDK's raw (often a giant nested-JSON-in-a-string) error into
 *  one sentence a user can act on, instead of dumping the whole payload. */
function friendlyGeminiError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes('"code":429')) {
    return "Gemini's free-tier quota for this API key is exhausted (0 requests/day allotted). Generate a fresh key at aistudio.google.com/apikey on a personal Google account, or check billing/quota on the linked Cloud project.";
  }
  if (raw.includes("API_KEY_INVALID") || raw.includes('"code":400')) {
    return "Gemini rejected the API key — double-check GEMINI_API_KEY in .env.local.";
  }
  if (raw.includes("PERMISSION_DENIED") || raw.includes('"code":403')) {
    return "Gemini denied this API key permission to call generateContent — check the key's API restrictions in Google Cloud Console.";
  }
  return `Gemini request failed: ${raw.slice(0, 300)}`;
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

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
  } catch (e) {
    throw new Error(friendlyGeminiError(e));
  }

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
