import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { Experience, AiSummary } from "@/lib/types";
import { formatDate, readingTime } from "@/lib/format";
import { DifficultyBadge, LevelBadge, OutcomeBadge, StatusBadge, TagChip } from "@/components/Badge";
import { AiSummaryPanel } from "@/components/AiSummaryPanel";
import { ArchiveToggleButton } from "@/components/ArchiveToggleButton";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { HelpfulButton } from "@/components/HelpfulButton";
import { ShareButton } from "@/components/ShareButton";
import { PencilIcon, ClockIcon, BuildingIcon } from "@/components/icons";
import { card, button } from "@/lib/ui";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function parseAiSummary(raw: string | null): AiSummary | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.summary === "string") {
      return { summary: parsed.summary, tags: Array.isArray(parsed.tags) ? parsed.tags : [] };
    }
  } catch {
    // Legacy/raw text stored before JSON format — show as-is.
    return { summary: raw, tags: [] };
  }
  return null;
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: experience } = await supabaseAdmin
    .from("experiences")
    .select("*, companies(id, name, industry)")
    .eq("id", id)
    .maybeSingle();

  if (!experience) notFound();

  const exp = experience as Experience;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div>
          <Link
            href={`/company/${exp.company_id}`}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
          >
            <BuildingIcon width={14} height={14} />
            {exp.companies?.name ?? "Unknown company"}
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50">{exp.role}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <LevelBadge value={exp.experience_level} />
            <DifficultyBadge value={exp.difficulty} />
            <OutcomeBadge value={exp.outcome} />
            {exp.status === "archived" && <StatusBadge value={exp.status} />}
            <span className="ml-1 flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
              <ClockIcon width={12} height={12} />
              {readingTime(exp.content)}
            </span>
          </div>
        </div>

        <AiSummaryPanel experienceId={exp.id} initial={parseAiSummary(exp.ai_summary)} />

        <section className={`p-5 ${card}`}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Rounds</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{exp.rounds}</p>
        </section>

        <section className={`p-5 ${card}`}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Full write-up</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{exp.content}</p>
        </section>

        {exp.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {exp.tags.map((tag) => (
              <TagChip key={tag} tag={tag} href={`/experiences?tag=${encodeURIComponent(tag)}`} />
            ))}
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:w-64 lg:shrink-0">
        <div className={`flex flex-col gap-3 p-4 ${card}`}>
          <HelpfulButton experienceId={exp.id} initialCount={exp.helpful_count} />
          <ShareButton />
          <Link href={`/experience/${exp.id}/edit`} className={button.secondary}>
            <PencilIcon width={15} height={15} />
            Edit
          </Link>
          <ArchiveToggleButton
            endpoint={`/api/experiences/${exp.id}/archive`}
            currentStatus={exp.status}
            mode="server-toggle"
            className="w-full"
          />
          <ConfirmDeleteButton
            endpoint={`/api/experiences/${exp.id}`}
            itemLabel="this experience"
            redirectTo="/experiences"
            className="w-full"
          />
        </div>

        <p className="px-1 text-xs text-zinc-400 dark:text-zinc-500">
          Shared by {exp.author_name || "Anonymous"} on {formatDate(exp.created_at)}
          {exp.updated_at !== exp.created_at && <> · edited {formatDate(exp.updated_at)}</>}
        </p>
      </aside>
    </div>
  );
}
