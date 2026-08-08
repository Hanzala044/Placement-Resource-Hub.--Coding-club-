export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function truncate(text: string, max = 220): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

/** ISO date key (yyyy-mm-dd, UTC) used to bucket rows by calendar day. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * `Date.now()`-based helpers, kept out of component bodies — the React
 * Compiler's purity lint (react-hooks/purity) flags a bare `Date.now()`
 * call inside a component/page function as an impure read, even in a
 * Server Component where it's actually the intended per-request behavior.
 * Wrapping it in an ordinary (non-component) function satisfies the rule.
 */
export function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function startOfDaysAgo(days: number): Date {
  const d = new Date(Date.now() - days * 86_400_000);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

const WORDS_PER_MINUTE = 200;

/** Rough reading-time estimate shown as a small badge on experience cards. */
export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}
