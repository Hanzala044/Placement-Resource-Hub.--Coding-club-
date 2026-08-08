"use client";

import { useState } from "react";
import { CheckCircleIcon, ClockIcon, XIcon } from "@/components/icons";

interface Segment {
  key: "selected" | "pending" | "rejected";
  label: string;
  value: number;
  color: string;
  icon: typeof CheckCircleIcon;
}

/**
 * Part-to-whole outcome breakdown as a horizontal stacked bar (the dataviz
 * skill's documented form for part-to-whole, preferred over a pie/donut).
 * Outcome is a genuine status, so it draws from the fixed status palette
 * (good/warning/critical) rather than an arbitrary categorical hue — and
 * per that palette's rule, each segment ships an icon + label, never color
 * alone.
 */
export function OutcomeStackedBar({ selected, pending, rejected }: { selected: number; pending: number; rejected: number }) {
  const [hovered, setHovered] = useState<Segment["key"] | null>(null);
  const total = selected + pending + rejected;

  const segments: Segment[] = [
    { key: "selected", label: "Selected", value: selected, color: "var(--viz-status-good)", icon: CheckCircleIcon },
    { key: "pending", label: "Pending", value: pending, color: "var(--viz-status-warning)", icon: ClockIcon },
    { key: "rejected", label: "Rejected", value: rejected, color: "var(--viz-status-critical)", icon: XIcon },
  ];

  if (total === 0) {
    return <p className="text-sm text-zinc-400 dark:text-zinc-500">No outcomes recorded yet.</p>;
  }

  return (
    <div className="viz-root flex flex-col gap-3">
      <div className="flex h-6 w-full overflow-hidden rounded-full bg-[var(--viz-grid)]">
        {segments.map((s, i) => {
          const pct = (s.value / total) * 100;
          if (pct === 0) return null;
          return (
            <button
              key={s.key}
              type="button"
              onMouseEnter={() => setHovered(s.key)}
              onFocus={() => setHovered(s.key)}
              onMouseLeave={() => setHovered(null)}
              onBlur={() => setHovered(null)}
              style={{
                width: `${pct}%`,
                backgroundColor: s.color,
                marginLeft: i === 0 ? 0 : 2,
                opacity: hovered && hovered !== s.key ? 0.55 : 1,
              }}
              className="relative h-full shrink-0 cursor-default transition-opacity"
              aria-label={`${s.label}: ${s.value} (${pct.toFixed(0)}%)`}
            >
              {hovered === s.key && (
                <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{s.value}</span>{" "}
                  <span className="text-zinc-500 dark:text-zinc-400">{s.label} · {pct.toFixed(0)}%</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        {segments.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <s.icon width={13} height={13} style={{ color: s.color }} />
            {s.label} <span className="font-medium text-zinc-900 dark:text-zinc-100">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
