import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { Experience, Resource } from "@/lib/types";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ResourceCard } from "@/components/ResourceCard";
import { EmptyState } from "@/components/EmptyState";
import { BuildingIcon, ArrowRightIcon, PlusIcon } from "@/components/icons";
import { surface, button } from "@/lib/ui";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: PageProps) {
  const { id } = await params;

  const [{ data: company }, { data: experiences }, { data: resources }] = await Promise.all([
    supabaseAdmin.from("companies").select("*").eq("id", id).maybeSingle(),
    supabaseAdmin
      .from("experiences")
      .select("*, companies(id, name, industry)")
      .eq("company_id", id)
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("resources")
      .select("*, companies(id, name, industry)")
      .eq("company_id", id)
      .eq("status", "open")
      .order("created_at", { ascending: false }),
  ]);

  if (!company) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-4">
        <span className={`flex size-14 items-center justify-center rounded-2xl ${surface} text-indigo-600 dark:text-indigo-400`}>
          <BuildingIcon width={26} height={26} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{company.name}</h1>
          {company.industry && <p className="text-zinc-500 dark:text-zinc-400">{company.industry}</p>}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Experiences</h2>
          <div className="flex items-center gap-3 text-sm">
            <Link href={`/experiences?company=${id}`} className="flex items-center gap-1 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
              Filter these <ArrowRightIcon width={13} height={13} />
            </Link>
            <Link href={`/submit-experience?company=${encodeURIComponent(company.name)}`} className={button.secondary}>
              <PlusIcon width={14} height={14} />
              Share one
            </Link>
          </div>
        </div>
        {experiences && experiences.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(experiences as Experience[]).map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        ) : (
          <EmptyState title={`No experiences for ${company.name} yet`} />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Resources</h2>
          <div className="flex items-center gap-3 text-sm">
            <Link href={`/resources?company=${id}`} className="flex items-center gap-1 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
              Filter these <ArrowRightIcon width={13} height={13} />
            </Link>
            <Link href={`/submit-resource?company=${encodeURIComponent(company.name)}`} className={button.secondary}>
              <PlusIcon width={14} height={14} />
              Add one
            </Link>
          </div>
        </div>
        {resources && resources.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(resources as Resource[]).map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <EmptyState title={`No resources for ${company.name} yet`} />
        )}
      </section>
    </div>
  );
}
