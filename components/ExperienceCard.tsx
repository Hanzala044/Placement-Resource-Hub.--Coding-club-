import Link from "next/link";
import type { Experience } from "@/lib/types";
import { formatDate, readingTime, truncate } from "@/lib/format";
import { DifficultyBadge, OutcomeBadge, StatusBadge, LevelBadge, TagChip } from "@/components/Badge";
import { ClockIcon, ThumbsUpIcon } from "@/components/icons";
import { cardHover } from "@/lib/ui";

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link href={`/experience/${experience.id}`} className={`flex flex-col gap-3 p-4 ${cardHover}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">{experience.role}</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {experience.companies?.name ?? "Unknown company"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <LevelBadge value={experience.experience_level} />
          <DifficultyBadge value={experience.difficulty} />
          <OutcomeBadge value={experience.outcome} />
          {experience.status === "archived" && <StatusBadge value={experience.status} />}
        </div>
      </div>

      <p className="text-sm text-[var(--text-secondary)]">{truncate(experience.content, 200)}</p>

      {experience.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {experience.tags.slice(0, 6).map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-[var(--border-default)] pt-3 text-xs text-[var(--text-secondary)]">
        <span>{experience.author_name || "Anonymous"} · {formatDate(experience.created_at)}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Estimated reading time">
            <ClockIcon width={13} height={13} />
            {readingTime(experience.content)}
          </span>
          {experience.helpful_count > 0 && (
            <span className="flex items-center gap-1" title="People who found this helpful">
              <ThumbsUpIcon width={13} height={13} />
              {experience.helpful_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
