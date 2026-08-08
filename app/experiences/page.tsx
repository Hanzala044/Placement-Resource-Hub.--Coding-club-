import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { Experience } from "@/lib/types";
import { FilterBar } from "@/components/FilterBar";
import { ExperienceCard } from "@/components/ExperienceCard";
import { EmptyState } from "@/components/EmptyState";
import { PlusIcon, FileTextIcon } from "@/components/icons";
import { button, surface } from "@/lib/ui";
import { experienceSort } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExperiencesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const get = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const status = get("status") ?? "open";
  const company = get("company");
  const difficulty = get("difficulty");
  const outcome = get("outcome");
  const level = get("level");
  const tag = get("tag");
  const search = get("search");
  const { column, ascending } = experienceSort(get("sort") ?? null);

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

  const [{ data: experiences }, { data: companies }] = await Promise.all([
    query,
    supabaseAdmin.from("companies").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex size-10 items-center justify-center rounded-xl ${surface} text-indigo-600 dark:text-indigo-400`}>
            <FileTextIcon width={20} height={20} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Interview Experiences</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {experiences?.length ?? 0} result{experiences?.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <Link href="/submit-experience" className={button.primary}>
          <PlusIcon width={16} height={16} />
          Share an experience
        </Link>
      </div>

      <FilterBar kind="experience" companies={companies ?? []} />

      {experiences && experiences.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(experiences as Experience[]).map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      ) : (
        <EmptyState title="No experiences match those filters" description="Try clearing a filter or search term." />
      )}
    </div>
  );
}
