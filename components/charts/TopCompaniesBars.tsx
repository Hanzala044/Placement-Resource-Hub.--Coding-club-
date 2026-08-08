"use client";

import { useState } from "react";
import Link from "next/link";

export interface CompanyBar {
  id: string;
  name: string;
  count: number;
}

/**
 * Magnitude comparison ("compare low -> high") as a horizontal bar list —
 * sequential one-hue blue per the dataviz skill. Values are direct-labeled
 * at the bar tip, and each row still carries a hover/focus response (a
 * background lift) since the hover layer is the default, not an upgrade.
 */
export function TopCompaniesBars({ companies }: { companies: CompanyBar[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(1, ...companies.map((c) => c.count));

  if (companies.length === 0) {
    return <p className="text-sm text-[var(--text-secondary)]">No experiences yet.</p>;
  }

  return (
    <div className="viz-root flex flex-col gap-2.5">
      {companies.map((c) => {
        const pct = Math.max(6, (c.count / max) * 100);
        return (
          <Link
            key={c.id}
            href={`/company/${c.id}`}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(c.id)}
            onBlur={() => setHovered(null)}
            className={`flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors ${
              hovered === c.id ? "bg-[var(--surface-muted)]" : ""
            }`}
          >
            <span className="w-24 shrink-0 truncate text-sm text-[var(--text-secondary)]">{c.name}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--viz-grid)]">
              <span
                className="block h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: "var(--viz-series-blue)" }}
              />
            </span>
            <span className="w-6 shrink-0 text-right text-sm font-semibold text-[var(--text-primary)]">{c.count}</span>
          </Link>
        );
      })}
    </div>
  );
}
