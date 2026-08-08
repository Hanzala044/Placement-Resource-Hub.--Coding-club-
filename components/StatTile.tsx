import type { ComponentType } from "react";
import { card } from "@/lib/ui";

const TONE_BG: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
};

interface StatTileProps {
  label: string;
  value: number | string;
  icon: ComponentType<{ width?: number; height?: number }>;
  tone?: keyof typeof TONE_BG;
  /** Real, computed delta — e.g. "+3 this week" — never a placeholder number. */
  delta?: string;
}

export function StatTile({ label, value, icon: Icon, tone = "indigo", delta }: StatTileProps) {
  return (
    <div className={`flex items-start gap-3 p-4 ${card}`}>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${TONE_BG[tone]}`}>
        <Icon width={18} height={18} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-2xl font-bold leading-tight text-zinc-900 dark:text-zinc-50">{value}</p>
        {delta && <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">{delta}</p>}
      </div>
    </div>
  );
}
