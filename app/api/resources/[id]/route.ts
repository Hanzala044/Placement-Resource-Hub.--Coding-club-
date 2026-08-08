import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resourceUpdateSchema } from "@/lib/validators";
import { errorResponse, zodErrorResponse } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/resources/[id] — detail (used by the edit form)
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("resources")
    .select("*, companies(id, name, industry)")
    .eq("id", id)
    .maybeSingle();

  if (error) return errorResponse(error.message, 500);
  if (!data) return errorResponse("Resource not found", 404);
  return NextResponse.json({ resource: data });
}

// PATCH /api/resources/[id] — edit (also used to archive/reopen via { status })
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = resourceUpdateSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);
  if (Object.keys(parsed.data).length === 0) {
    return errorResponse("No fields to update", 400);
  }

  const { data, error } = await supabaseAdmin
    .from("resources")
    .update(parsed.data)
    .eq("id", id)
    .select("*, companies(id, name, industry)")
    .maybeSingle();

  if (error) return errorResponse(error.message, 500);
  if (!data) return errorResponse("Resource not found", 404);
  return NextResponse.json({ resource: data });
}

// DELETE /api/resources/[id] — delete
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error, count } = await supabaseAdmin
    .from("resources")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) return errorResponse(error.message, 500);
  if (!count) return errorResponse("Resource not found", 404);
  return new NextResponse(null, { status: 204 });
}
