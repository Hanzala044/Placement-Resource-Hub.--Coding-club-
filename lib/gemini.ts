import "server-only";
import OpenAI from "openai";
import type { AiSummary } from "./types";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to .env.local to use the AI features."
    );
  }
  client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });
  return client;
}

function friendlyAiError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (raw.includes("401") || raw.includes("invalid_api_key")) {
    return "OpenRouter rejected the API key — double-check OPENROUTER_API_KEY in .env.local.";
  }
  if (raw.includes("402") || raw.includes("insufficient_quota")) {
    return "OpenRouter credits exhausted. Check your billing at openrouter.ai.";
  }
  return `AI request failed: ${raw.slice(0, 300)}`;
}

/**
 * Summarize an interview experience write-up into a 2-3 sentence TL;DR 
 * plus 3-5 suggested topic tags.
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
    response = await ai.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free", // Good free/cheap model on OpenRouter, or you can use "meta-llama/llama-3-8b-instruct:free"
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
  } catch (e) {
    throw new Error(friendlyAiError(e));
  }

  const raw = response.choices[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(raw);
    const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t: unknown): t is string => typeof t === "string").slice(0, 5)
      : [];
    if (!summary) throw new Error("empty summary");
    return { summary, tags };
  } catch {
    return { summary: raw.trim() || "AI did not return a usable summary.", tags: [] };
  }
}

/**
 * Generates a 5-question multiple choice quiz on the requested topic.
 */
export async function generateQuiz(topic: string) {
  const ai = getClient();

  const prompt = `You are a technical interviewer for placement preparation.
Generate a 5-question multiple-choice quiz about "${topic}".
Make the difficulty medium-hard, focusing on practical knowledge.
Respond with ONLY minified JSON (no markdown fences) exactly matching this shape:
{"questions": [{"question": string, "options": [string, string, string, string], "correctIndex": number (0-3)}]}
`;

  let response;
  try {
    response = await ai.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free", 
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
  } catch (e) {
    throw new Error(friendlyAiError(e));
  }

  const raw = response.choices[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid format");
    }
    return parsed.questions;
  } catch {
    throw new Error("AI failed to generate a valid quiz. Try again.");
  }
}

/**
 * Acts as an AI interviewer for a mock interview simulation.
 */
export async function simulateInterview(messages: { role: string; content: string }[], context: string) {
  const ai = getClient();
  const systemInstruction = `You are a strict but fair technical interviewer for a top tier tech company.
The context of the interview is: ${context}.
Ask ONE question at a time. Do not give the user the answer right away.
Critique their previous answer if they provided one, then ask the next question.
Keep your responses concise and conversational (max 3-4 sentences).`;

  const formattedMessages: { role: "user" | "assistant" | "system", content: string }[] = messages.map(m => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content
  }));

  try {
    const response = await ai.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        { role: "system", content: systemInstruction },
        ...formattedMessages
      ],
    });
    return response.choices[0]?.message?.content || "";
  } catch (e) {
    throw new Error(friendlyAiError(e));
  }
}
