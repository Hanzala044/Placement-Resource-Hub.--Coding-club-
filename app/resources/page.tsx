import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { Resource } from "@/lib/types";
import { FilterBar } from "@/components/FilterBar";
import { ResourceCard } from "@/components/ResourceCard";
import { EmptyState } from "@/components/EmptyState";
import { PlusIcon, LinkIcon } from "@/components/icons";
import { button, surface } from "@/lib/ui";
import { parseMulti, resourceSort } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const get = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const status = get("status") ?? "open";
  const company = parseMulti(get("company") ?? null);
  const type = parseMulti(get("type") ?? null);
  const tag = get("tag");
  const search = get("search");
  const { column, ascending } = resourceSort(get("sort") ?? null);

  let query = supabaseAdmin
    .from("resources")
    .select("*, companies(id, name, industry)")
    .order(column, { ascending })
    .limit(100);

  if (status !== "all") query = query.eq("status", status);
  if (company.length > 0) query = query.in("company_id", company);
  if (type.length > 0) query = query.in("resource_type", type);
  if (tag) query = query.contains("tags", [tag]);
  if (search) {
    const like = `%${search}%`;
    query = query.or(`title.ilike.${like},url.ilike.${like}`);
  }

  const [{ data: resources }, { data: companies }] = await Promise.all([
    query,
    supabaseAdmin.from("companies").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex size-10 items-center justify-center rounded-xl ${surface} text-indigo-600 dark:text-indigo-400`}>
            <LinkIcon width={20} height={20} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Prep Resources</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {resources?.length ?? 0} result{resources?.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <Link href="/submit-resource" className={button.primary}>
          <PlusIcon width={16} height={16} />
          Add a resource
        </Link>
      </div>

      <FilterBar kind="resource" companies={companies ?? []} />

      {resources && resources.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(resources as Resource[]).map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <EmptyState title="No resources match those filters" description="Try clearing a filter or search term." />
      )}
    </div>
  );
}
