import { supabaseAdmin } from "@/lib/supabase";
import { card } from "@/lib/ui";
import { SparklesIcon } from "@/components/icons";
import Link from "next/link";
import { button } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function ScoreboardPage() {
  const { data: scores } = await supabaseAdmin
    .from("quiz_scores")
    .select("*")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Quiz Scoreboard</h1>
          <p className="mt-1 text-[var(--text-secondary)]">The top performers across all AI quizzes</p>
        </div>
        <Link href="/quiz" className={button.primary}>Take a Quiz</Link>
      </div>

      <div className={`overflow-hidden ${card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-primary)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Rank</th>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Topic</th>
                <th className="px-6 py-4 text-right font-semibold">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {scores && scores.length > 0 ? (
                scores.map((score, idx) => (
                  <tr key={score.id} className="transition-colors hover:bg-[var(--surface-muted)]/50">
                    <td className="px-6 py-4">
                      {idx === 0 ? <SparklesIcon width={20} height={20} className="text-amber-500" /> : `#${idx + 1}`}
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{score.user_name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                        {score.topic}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[var(--text-primary)]">
                      {score.score} / {score.total}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    No scores yet. Be the first to take a quiz!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
