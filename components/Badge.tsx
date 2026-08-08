const TONES = {
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  red: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
} as const;

type Tone = keyof typeof TONES;

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ring-black/5 dark:ring-white/10 ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

const DIFFICULTY_TONE: Record<string, Tone> = {
  easy: "green",
  medium: "amber",
  hard: "red",
};

const OUTCOME_TONE: Record<string, Tone> = {
  selected: "green",
  rejected: "red",
  pending: "amber",
};

const STATUS_TONE: Record<string, Tone> = {
  open: "blue",
  archived: "neutral",
};

const LEVEL_TONE: Record<string, Tone> = {
  intern: "purple",
  fresher: "blue",
  experienced: "green",
};

const TYPE_TONE: Record<string, Tone> = {
  article: "blue",
  video: "red",
  pdf: "amber",
  sheet: "green",
  note: "purple",
};

export function DifficultyBadge({ value }: { value: string }) {
  return <Badge tone={DIFFICULTY_TONE[value] ?? "neutral"}>{value}</Badge>;
}
export function OutcomeBadge({ value }: { value: string }) {
  return <Badge tone={OUTCOME_TONE[value] ?? "neutral"}>{value}</Badge>;
}
export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={STATUS_TONE[value] ?? "neutral"}>{value}</Badge>;
}
export function LevelBadge({ value }: { value: string }) {
  return <Badge tone={LEVEL_TONE[value] ?? "neutral"}>{value}</Badge>;
}
export function TypeBadge({ value }: { value: string }) {
  return <Badge tone={TYPE_TONE[value] ?? "neutral"}>{value}</Badge>;
}

export function TagChip({ tag, href }: { tag: string; href?: string }) {
  const className =
    "inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-600 dark:text-zinc-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-800 dark:hover:text-indigo-400 transition-colors";
  if (href) {
    return (
      <a href={href} className={className}>
        #{tag}
      </a>
    );
  }
  return <span className={className}>#{tag}</span>;
}
