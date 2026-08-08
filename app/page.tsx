import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { Company, Experience } from "@/lib/types";
import { SearchBox } from "@/components/SearchBox";
import { DashboardHero } from "@/components/DashboardHero";
import { CompanyCard } from "@/components/CompanyCard";
import { EmptyState } from "@/components/EmptyState";
import { StatTile } from "@/components/StatTile";
import { RecentExperiencesTable } from "@/components/RecentExperiencesTable";
import { TrendAreaChart, type TrendPoint } from "@/components/charts/TrendAreaChart";
import { OutcomeStackedBar } from "@/components/charts/OutcomeStackedBar";
import { TopCompaniesBars } from "@/components/charts/TopCompaniesBars";
import { BuildingIcon, FileTextIcon, LinkIcon, ThumbsUpIcon } from "@/components/icons";
import { card } from "@/lib/ui";
import { dayKey, formatShortDate, isoDaysAgo, startOfDaysAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const TREND_DAYS = 14;

export default async function DashboardPage() {
  const sevenDaysAgo = isoDaysAgo(7);
  const trendStart = startOfDaysAgo(TREND_DAYS - 1);

  const [
    { data: companies },
    { data: experienceRows },
    { data: resourceRows },
    { data: recent },
    { data: recentExperienceDates },
    { data: recentResourceDates },
    { data: trendRows },
  ] = await Promise.all([
    supabaseAdmin.from("companies").select("id, name, industry, created_at").order("name"),
    supabaseAdmin.from("experiences").select("company_id, outcome, helpful_count").eq("status", "open"),
    supabaseAdmin.from("resources").select("company_id").eq("status", "open"),
    supabaseAdmin
      .from("experiences")
      .select("*, companies(id, name, industry)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(8),
    supabaseAdmin.from("experiences").select("id").gte("created_at", sevenDaysAgo),
    supabaseAdmin.from("resources").select("id").gte("created_at", sevenDaysAgo),
    supabaseAdmin.from("experiences").select("created_at").gte("created_at", trendStart.toISOString()),
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

  const outcomeCounts = { selected: 0, pending: 0, rejected: 0 };
  let helpfulTotal = 0;
  for (const row of (experienceRows ?? []) as { outcome: keyof typeof outcomeCounts; helpful_count: number }[]) {
    outcomeCounts[row.outcome] = (outcomeCounts[row.outcome] ?? 0) + 1;
    helpfulTotal += row.helpful_count ?? 0;
  }

  // Bucket submissions per day for the trend chart.
  const buckets = new Map<string, number>();
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date(trendStart.getTime() + i * 86_400_000);
    buckets.set(dayKey(d), 0);
  }
  for (const row of (trendRows ?? []) as { created_at: string }[]) {
    const key = dayKey(new Date(row.created_at));
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const trendData: TrendPoint[] = [...buckets.entries()].map(([key, value]) => ({
    label: formatShortDate(new Date(key)),
    value,
  }));

  const topCompanies = (companies ?? [])
    .map((c) => ({ id: c.id, name: c.name, count: experienceCounts.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalExperiences = experienceRows?.length ?? 0;
  const totalResources = resourceRows?.length ?? 0;
  const decidedOutcomes = outcomeCounts.selected + outcomeCounts.rejected;
  const selectedRate = decidedOutcomes > 0 ? Math.round((outcomeCounts.selected / decidedOutcomes) * 100) : null;

  return (
    <div className="flex flex-col gap-10">
      <DashboardHero
        experienceCount={totalExperiences}
        companyCount={companies?.length ?? 0}
        resourceCount={totalResources}
        weeklyDelta={recentExperienceDates?.length ?? 0}
        selectedRate={selectedRate}
        topCompanies={topCompanies}
      />

      <div className="flex justify-center">
        <SearchBox />
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Companies" value={companies?.length ?? 0} icon={BuildingIcon} tone="indigo" />
        <StatTile
          label="Experiences"
          value={totalExperiences}
          icon={FileTextIcon}
          tone="blue"
          delta={recentExperienceDates && recentExperienceDates.length > 0 ? `+${recentExperienceDates.length} this week` : undefined}
        />
        <StatTile
          label="Resources"
          value={totalResources}
          icon={LinkIcon}
          tone="emerald"
          delta={recentResourceDates && recentResourceDates.length > 0 ? `+${recentResourceDates.length} this week` : undefined}
        />
        <StatTile label="Helpful votes" value={helpfulTotal} icon={ThumbsUpIcon} tone="amber" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`p-5 lg:col-span-2 ${card}`}>
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Submissions, last {TREND_DAYS} days</h2>
          <div className="mt-4">
            <TrendAreaChart data={trendData} />
          </div>
        </div>
        <div className={`p-5 ${card}`}>
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Outcomes</h2>
          <div className="mt-4">
            <OutcomeStackedBar selected={outcomeCounts.selected} pending={outcomeCounts.pending} rejected={outcomeCounts.rejected} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-2 lg:col-span-2">
          <h2 className="px-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Recent experiences</h2>
          {recent && recent.length > 0 ? (
            <RecentExperiencesTable experiences={recent as Experience[]} totalCount={totalExperiences} />
          ) : (
            <EmptyState title="No experiences shared yet" description="Be the first — it takes less than five minutes." />
          )}
        </div>
        <div className={`p-5 ${card}`}>
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Top companies</h2>
          <div className="mt-4">
            <TopCompaniesBars companies={topCompanies} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Browse by company</h2>
          <Link href="/experiences" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
            Browse all experiences →
          </Link>
        </div>
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
