import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { companySchema } from "@/lib/validators";
import { errorResponse, zodErrorResponse } from "@/lib/db";

// GET /api/companies — list all companies (for dropdowns + company pages)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("id, name, industry, created_at")
    .order("name", { ascending: true });

  if (error) return errorResponse(error.message, 500);
  return NextResponse.json({ companies: data });
}

// POST /api/companies — create if not exists (upsert by case-insensitive name)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = companySchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { name, industry } = parsed.data;

  const { data: existing, error: findError } = await supabaseAdmin
    .from("companies")
    .select("*")
    .ilike("name", name)
    .maybeSingle();
  if (findError) return errorResponse(findError.message, 500);
  if (existing) return NextResponse.json({ company: existing });

  const { data: created, error: createError } = await supabaseAdmin
    .from("companies")
    .insert({ name, industry: industry ?? null })
    .select("*")
    .single();
  if (createError) return errorResponse(createError.message, 500);

  return NextResponse.json({ company: created }, { status: 201 });
}
