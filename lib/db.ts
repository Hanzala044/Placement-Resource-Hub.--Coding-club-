import "server-only";
import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { supabaseAdmin } from "./supabase";

export function errorResponse(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ error: message, issues }, { status });
}

export function zodErrorResponse(error: ZodError) {
  return errorResponse("Validation failed", 422, error.flatten().fieldErrors);
}

/** Maps the `sort` query param to an `.order()` call for experiences. */
export function experienceSort(sort: string | null): { column: "created_at" | "helpful_count"; ascending: boolean } {
  if (sort === "oldest") return { column: "created_at", ascending: true };
  if (sort === "helpful") return { column: "helpful_count", ascending: false };
  return { column: "created_at", ascending: false };
}

/** Maps the `sort` query param to an `.order()` call for resources. */
export function resourceSort(sort: string | null): { column: "created_at"; ascending: boolean } {
  return { column: "created_at", ascending: sort === "oldest" };
}

/** Find-or-create a company by name (case-insensitive) and return its id. */
export async function resolveCompanyId(name: string, industry?: string): Promise<string> {
  const trimmed = name.trim();

  const { data: existing, error: findError } = await supabaseAdmin
    .from("companies")
    .select("id")
    .ilike("name", trimmed)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id as string;

  const { data: created, error: createError } = await supabaseAdmin
    .from("companies")
    .insert({ name: trimmed, industry: industry || null })
    .select("id")
    .single();
  if (createError) throw createError;
  return created.id as string;
}
