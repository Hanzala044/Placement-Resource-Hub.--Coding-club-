import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { Company, Experience } from "@/lib/types";
import { SearchBox } from "@/components/SearchBox";
import { CompanyCard } from "@/components/CompanyCard";
import { ExperienceCard } from "@/components/ExperienceCard";
import { EmptyState } from "@/components/EmptyState";
import { BuildingIcon, FileTextIcon, LinkIcon, ArrowRightIcon } from "@/components/icons";
import { surface } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [{ data: companies }, { data: experienceRows }, { data: resourceRows }, { data: recent }] =
    await Promise.all([
      supabaseAdmin.from("companies").select("id, name, industry, created_at").order("name"),
      supabaseAdmin.from("experiences").select("company_id").eq("status", "open"),
      supabaseAdmin.from("resources").select("company_id").eq("status", "open"),
      supabaseAdmin
        .from("experiences")
        .select("*, companies(id, name, industry)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  const experienceCounts = new Map<string, number>();
  for (const row of (experienceRows ?? []) as { company_id: string | null }[]) {
    if (!row.company_id) continue;
    experienceCounts.set(row.company_id, (experienceCounts.get(row.company_id) ?? 0) + 1);
  }
  const resourceCounts = new Map<string, number>();
  for (const row of (resourceRows ?? []) as { company_id: string | null }[]) {
    if (!row.company_id) continue;
    resourceCounts.set(row.company_id, (resourceCounts.get(row.company_id) ?? 0) + 1);
  }

  const stats = [
    { label: "Companies", value: companies?.length ?? 0, icon: BuildingIcon },
    { label: "Experiences", value: experienceRows?.length ?? 0, icon: FileTextIcon },
    { label: "Resources", value: resourceRows?.length ?? 0, icon: LinkIcon },
  ];

  return (
    <div className="flex flex-col gap-14">
      <section className="hero-glow -mx-4 flex flex-col items-center gap-6 rounded-3xl px-4 py-14 text-center sm:-mx-6 sm:px-6">
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300">
          AITM Coding Club Screening · Track 2
        </span>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Placement prep, straight from the seniors who&rsquo;ve been through it
        </h1>
        <p className="max-w-xl text-zinc-500 dark:text-zinc-400">
          Search interview experiences and prep resources by company, role, or topic — no more
          scattered notes and WhatsApp screenshots.
        </p>
        <SearchBox />

        <div className="mt-2 flex flex-wrap justify-center gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`flex items-center gap-3 px-5 py-3 ${surface}`}
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-400">
                <s.icon width={17} height={17} />
              </span>
              <div className="text-left">
                <p className="text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-50">{s.value}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent experiences</h2>
          <Link href="/experiences" className="flex items-center gap-1 text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
            Browse all <ArrowRightIcon width={14} height={14} />
          </Link>
        </div>
        {recent && recent.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(recent as Experience[]).map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No experiences shared yet"
            description="Be the first — it takes less than five minutes."
          />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Browse by company</h2>
        {companies && companies.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(companies as Company[]).map((company) => (
              <CompanyCard
                key={company.id}
                id={company.id}
                name={company.name}
                industry={company.industry}
                experienceCount={experienceCounts.get(company.id) ?? 0}
                resourceCount={resourceCounts.get(company.id) ?? 0}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No companies yet" description="Companies appear automatically as experiences are submitted." />
        )}
      </section>
    </div>
  );
}
