import Link from "next/link";
import type { Experience } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { DifficultyBadge, OutcomeBadge } from "@/components/Badge";
import { ArrowRightIcon } from "@/components/icons";
import { card } from "@/lib/ui";

export function RecentExperiencesTable({ experiences, totalCount }: { experiences: Experience[]; totalCount: number }) {
  if (experiences.length === 0) return null;

  return (
    <div className={`overflow-hidden ${card}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] text-xs uppercase tracking-wide text-[var(--text-secondary)]">
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Difficulty</th>
              <th className="px-4 py-3 font-medium">Outcome</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {experiences.map((exp) => (
              <tr
                key={exp.id}
                className="border-b border-[var(--border-default)] transition-colors last:border-0 hover:bg-[var(--surface-muted)]"
              >
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{exp.role}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{exp.companies?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <DifficultyBadge value={exp.difficulty} />
                </td>
                <td className="px-4 py-3">
                  <OutcomeBadge value={exp.outcome} />
                </td>
                <td className="px-4 py-3 tabular-nums text-[var(--text-secondary)]">{formatDate(exp.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/experience/${exp.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View <ArrowRightIcon width={12} height={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--border-default)] px-4 py-2.5 text-xs text-[var(--text-secondary)]">
        <span>
          Showing {experiences.length} of {totalCount}
        </span>
        <Link href="/experiences" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          Browse all →
        </Link>
      </div>
    </div>
  );
}
