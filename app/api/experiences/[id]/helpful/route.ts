import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { errorResponse } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/experiences/[id]/helpful — anonymous "this helped me" counter.
// No auth, so dedup against repeat clicks is enforced client-side via
// localStorage (see HelpfulButton) rather than server-side — good enough
// for a lightweight signal, not vote-fraud-proof.
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin.rpc("increment_helpful_count", { experience_id: id });

  if (!error) {
    return NextResponse.json({ helpful_count: data });
  }

  // Fallback if the increment_helpful_count() SQL function (see
  // sql/schema.sql) hasn't been created yet — read-then-write is racy under
  // concurrent clicks but keeps the feature working without an extra step.
  const { data: current, error: findError } = await supabaseAdmin
    .from("experiences")
    .select("helpful_count")
    .eq("id", id)
    .maybeSingle();
  if (findError) return errorResponse(findError.message, 500);
  if (!current) return errorResponse("Experience not found", 404);

  const nextCount = (current.helpful_count ?? 0) + 1;
  const { error: updateError } = await supabaseAdmin
    .from("experiences")
    .update({ helpful_count: nextCount })
    .eq("id", id);
  if (updateError) return errorResponse(updateError.message, 500);

  return NextResponse.json({ helpful_count: nextCount });
}
