import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { experienceCreateSchema } from "@/lib/validators";
import { errorResponse, experienceSort, parseMulti, resolveCompanyId, zodErrorResponse } from "@/lib/db";

// GET /api/experiences?company=&tag=&difficulty=&outcome=&level=&search=&status=open&sort=newest|oldest|helpful
// company/difficulty/outcome/level accept comma-separated values (multi-select filter bar).
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const company = parseMulti(params.get("company"));
  const tag = params.get("tag");
  const difficulty = parseMulti(params.get("difficulty"));
  const outcome = parseMulti(params.get("outcome"));
  const level = parseMulti(params.get("level"));
  const search = params.get("search")?.trim();
  const status = params.get("status") ?? "open";
  const { column, ascending } = experienceSort(params.get("sort"));

  let query = supabaseAdmin
    .from("experiences")
    .select("*, companies(id, name, industry)")
    .order(column, { ascending })
    .limit(100);

  if (status !== "all") query = query.eq("status", status);
  if (company.length > 0) query = query.in("company_id", company);
  if (difficulty.length > 0) query = query.in("difficulty", difficulty);
  if (outcome.length > 0) query = query.in("outcome", outcome);
  if (level.length > 0) query = query.in("experience_level", level);
  if (tag) query = query.contains("tags", [tag]);
  if (search) {
    const like = `%${search}%`;
    query = query.or(`role.ilike.${like},content.ilike.${like},rounds.ilike.${like}`);
  }

  const { data, error } = await query;
  if (error) return errorResponse(error.message, 500);
  return NextResponse.json({ experiences: data });
}

// POST /api/experiences — create (validate: role, rounds, content non-empty)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = experienceCreateSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { company_name, ...rest } = parsed.data;

  try {
    const company_id = await resolveCompanyId(company_name);
    const { data, error } = await supabaseAdmin
      .from("experiences")
      .insert({ ...rest, company_id })
      .select("*, companies(id, name, industry)")
      .single();
    if (error) return errorResponse(error.message, 500);
    return NextResponse.json({ experience: data }, { status: 201 });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to create experience", 500);
  }
}
