import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { errorResponse } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/experiences/[id]/archive — resolve/close (or reopen).
// Body { status: "open" | "archived" } is optional; omitted body toggles
// the current status, which is what the UI's single Archive/Reopen button uses.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const requested = body?.status;
  let nextStatus: "open" | "archived" | null =
    requested === "open" || requested === "archived" ? requested : null;

  if (!nextStatus) {
    const { data: current, error: findError } = await supabaseAdmin
      .from("experiences")
      .select("status")
      .eq("id", id)
      .maybeSingle();
    if (findError) return errorResponse(findError.message, 500);
    if (!current) return errorResponse("Experience not found", 404);
    nextStatus = current.status === "archived" ? "open" : "archived";
  }

  const { data, error } = await supabaseAdmin
    .from("experiences")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, companies(id, name, industry)")
    .maybeSingle();

  if (error) return errorResponse(error.message, 500);
  if (!data) return errorResponse("Experience not found", 404);
  return NextResponse.json({ experience: data });
}
