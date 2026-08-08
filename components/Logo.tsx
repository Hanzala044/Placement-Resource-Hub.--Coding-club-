import { SparklesIcon } from "@/components/icons";

/**
 * Single source of truth for the brand mark, used in the sidebar and
 * anywhere else the logo appears — swap the markup here once a final
 * logo asset (e.g. /public/logo.png) is added, instead of hunting
 * through every usage.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 ${className}`}>
      <SparklesIcon width={16} height={16} />
    </span>
  );
}
