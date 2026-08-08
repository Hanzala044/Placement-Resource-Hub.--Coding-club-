"use client";

import { useState, useSyncExternalStore } from "react";
import { ThumbsUpIcon } from "@/components/icons";
import { useToast } from "@/components/Toast";

const STORAGE_KEY = "prh:helpful-votes";

function getVotedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function markVoted(id: string) {
  const ids = getVotedIds();
  ids.add(id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

// localStorage never changes from outside this tab in a way we need to
// react to, so the "subscribe" half of useSyncExternalStore is a no-op —
// we only need its snapshot half to read the value safely on the client
// while matching the server's (storage-less) render during hydration.
function subscribeNoop() {
  return () => {};
}

export function HelpfulButton({ experienceId, initialCount }: { experienceId: string; initialCount: number }) {
  const { show } = useToast();
  const [count, setCount] = useState(initialCount);
  const [justVoted, setJustVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const previouslyVoted = useSyncExternalStore(
    subscribeNoop,
    () => getVotedIds().has(experienceId),
    () => false // server snapshot: no localStorage during SSR
  );
  const voted = previouslyVoted || justVoted;

  async function vote() {
    if (voted || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/experiences/${experienceId}/helpful`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to record vote");
      setCount(data.helpful_count);
      setJustVoted(true);
      markVoted(experienceId);
      show("Thanks for the feedback!", "success");
    } catch (e) {
      show(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={vote}
      disabled={voted || loading}
      title={voted ? "You already marked this helpful" : "Mark this helpful"}
      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all active:scale-[0.97] disabled:pointer-events-none ${
        voted
          ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
          : "border-zinc-300 bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-800 dark:hover:text-indigo-400"
      }`}
    >
      <ThumbsUpIcon width={15} height={15} className={voted ? "fill-indigo-100 dark:fill-indigo-900" : ""} />
      Helpful
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
