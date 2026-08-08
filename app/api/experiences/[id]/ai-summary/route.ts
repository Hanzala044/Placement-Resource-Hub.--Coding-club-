import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateExperienceSummary } from "@/lib/gemini";
import { errorResponse } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/experiences/[id]/ai-summary — Gemini bonus: generates a 2-3
// line TL;DR + auto-suggested tags, and persists it to ai_summary.
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const { data: exp, error } = await supabaseAdmin
    .from("experiences")
    .select("content")
    .eq("id", id)
    .maybeSingle();
  if (error) return errorResponse(error.message, 500);
  if (!exp) return errorResponse("Experience not found", 404);

  try {
    const result = await generateExperienceSummary(exp.content);

    const { error: updateError } = await supabaseAdmin
      .from("experiences")
      .update({ ai_summary: JSON.stringify(result) })
      .eq("id", id);
    if (updateError) return errorResponse(updateError.message, 500);

    return NextResponse.json(result);
  } catch (e) {
    return errorResponse(
      e instanceof Error ? e.message : "Failed to generate AI summary",
      502
    );
  }
}
