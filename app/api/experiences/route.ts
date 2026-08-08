import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { experienceCreateSchema } from "@/lib/validators";
import { errorResponse, experienceSort, resolveCompanyId, zodErrorResponse } from "@/lib/db";

// GET /api/experiences?company=&tag=&difficulty=&outcome=&level=&search=&status=open&sort=newest|oldest|helpful
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const company = params.get("company");
  const tag = params.get("tag");
  const difficulty = params.get("difficulty");
  const outcome = params.get("outcome");
  const level = params.get("level");
  const search = params.get("search")?.trim();
  const status = params.get("status") ?? "open";
  const { column, ascending } = experienceSort(params.get("sort"));

  let query = supabaseAdmin
    .from("experiences")
    .select("*, companies(id, name, industry)")
    .order(column, { ascending })
    .limit(100);

  if (status !== "all") query = query.eq("status", status);
  if (company) query = query.eq("company_id", company);
  if (difficulty) query = query.eq("difficulty", difficulty);
  if (outcome) query = query.eq("outcome", outcome);
  if (level) query = query.eq("experience_level", level);
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
