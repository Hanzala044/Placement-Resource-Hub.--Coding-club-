import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { experienceUpdateSchema } from "@/lib/validators";
import { errorResponse, zodErrorResponse } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/experiences/[id] — detail
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("experiences")
    .select("*, companies(id, name, industry)")
    .eq("id", id)
    .maybeSingle();

  if (error) return errorResponse(error.message, 500);
  if (!data) return errorResponse("Experience not found", 404);
  return NextResponse.json({ experience: data });
}

// PATCH /api/experiences/[id] — edit fields
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = experienceUpdateSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);
  if (Object.keys(parsed.data).length === 0) {
    return errorResponse("No fields to update", 400);
  }

  const { data, error } = await supabaseAdmin
    .from("experiences")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, companies(id, name, industry)")
    .maybeSingle();

  if (error) return errorResponse(error.message, 500);
  if (!data) return errorResponse("Experience not found", 404);
  return NextResponse.json({ experience: data });
}

// DELETE /api/experiences/[id] — hard delete
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error, count } = await supabaseAdmin
    .from("experiences")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) return errorResponse(error.message, 500);
  if (!count) return errorResponse("Experience not found", 404);
  return new NextResponse(null, { status: 204 });
}
