import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resourceCreateSchema } from "@/lib/validators";
import { errorResponse, resolveCompanyId, resourceSort, zodErrorResponse } from "@/lib/db";

// GET /api/resources?company=&tag=&type=&search=&status=open&sort=newest|oldest
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const company = params.get("company");
  const tag = params.get("tag");
  const type = params.get("type");
  const search = params.get("search")?.trim();
  const status = params.get("status") ?? "open";
  const { column, ascending } = resourceSort(params.get("sort"));

  let query = supabaseAdmin
    .from("resources")
    .select("*, companies(id, name, industry)")
    .order(column, { ascending })
    .limit(100);

  if (status !== "all") query = query.eq("status", status);
  if (company) query = query.eq("company_id", company);
  if (type) query = query.eq("resource_type", type);
  if (tag) query = query.contains("tags", [tag]);
  if (search) {
    const like = `%${search}%`;
    query = query.or(`title.ilike.${like},url.ilike.${like}`);
  }

  const { data, error } = await query;
  if (error) return errorResponse(error.message, 500);
  return NextResponse.json({ resources: data });
}

// POST /api/resources — create
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = resourceCreateSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { company_name, ...rest } = parsed.data;

  try {
    const company_id = company_name ? await resolveCompanyId(company_name) : null;
    const { data, error } = await supabaseAdmin
      .from("resources")
      .insert({ ...rest, company_id })
      .select("*, companies(id, name, industry)")
      .single();
    if (error) return errorResponse(error.message, 500);
    return NextResponse.json({ resource: data }, { status: 201 });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to create resource", 500);
  }
}
