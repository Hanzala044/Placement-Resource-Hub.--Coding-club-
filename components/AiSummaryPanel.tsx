"use client";

import { useState } from "react";
import type { AiSummary } from "@/lib/types";
import { SparklesIcon } from "@/components/icons";
import { useToast } from "@/components/Toast";

export function AiSummaryPanel({
  experienceId,
  initial,
}: {
  experienceId: string;
  initial: AiSummary | null;
}) {
  const { show } = useToast();
  const [summary, setSummary] = useState<AiSummary | null>(initial);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/experiences/${experienceId}/ai-summary`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to generate summary");
      setSummary({ summary: data.summary, tags: data.tags ?? [] });
      show("Summary generated", "success");
    } catch (e) {
      show(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-purple-950/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-indigo-900 dark:text-indigo-200">
          <SparklesIcon width={18} height={18} className={loading ? "animate-spin" : ""} />
          AI Summary
        </h2>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Generating…" : summary ? "Regenerate" : "Generate summary"}
        </button>
      </div>

      {summary ? (
        <div className="mt-3 space-y-2.5">
          <p className="text-sm leading-relaxed text-indigo-950 dark:text-indigo-100">{summary.summary}</p>
          {summary.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {summary.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        !loading && (
          <p className="mt-2 text-sm text-indigo-700/80 dark:text-indigo-300/80">
            Generate a quick TL;DR and topic tags with Gemini.
          </p>
        )
      )}
    </div>
  );
}
