/**
 * Shared style tokens so every button/input/card in the app comes from one
 * place instead of re-typing the same Tailwind soup in every component.
 *
 * Surfaces/borders/text below read the semantic CSS variables defined in
 * app/globals.css (`--surface-card`, `--border-default`, etc.) via
 * Tailwind arbitrary values, rather than hardcoded zinc-* shades — that's
 * what lets ThemeToggle's "cream" mode reskin every card/input/button in
 * one place instead of needing a dark:-style variant threaded through
 * every component. Brand/status colors (indigo, rose, emerald…) are left
 * as literal Tailwind classes on purpose — accent and status colors are
 * meant to stay constant across themes, only neutrals shift.
 */

export const button = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none dark:bg-indigo-500 dark:hover:bg-indigo-400",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-zinc-400 hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:hover:bg-zinc-800",
  ghost:
    "inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-zinc-100 hover:text-[var(--text-primary)] disabled:opacity-50 dark:hover:bg-zinc-800",
  danger:
    "inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/40",
  dangerSolid:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-400",
} as const;

export const input =
  "w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm transition-colors placeholder:text-[var(--text-secondary)] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

export const label = "text-sm font-medium text-[var(--text-primary)]";

export const card =
  "rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] shadow-sm transition-all";

export const cardHover = `${card} hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg dark:hover:border-zinc-700`;

export const surface = "rounded-2xl border border-[var(--border-default)] bg-[var(--surface-muted)]";
