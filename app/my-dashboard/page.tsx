import { supabaseAdmin } from "@/lib/supabase";
import { card } from "@/lib/ui";
import { SparklesIcon, FileTextIcon } from "@/components/icons";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function MyDashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  const { data: scores } = await supabaseAdmin
    .from("quiz_scores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Welcome, {user?.firstName || "Student"}!</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Your personalized interview prep dashboard.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className={`p-6 ${card}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <SparklesIcon width={18} height={18} className="text-indigo-500" />
              My Quiz Scores
            </h2>
            <Link href="/quiz" className="text-sm text-indigo-600 hover:underline">Take a Quiz</Link>
          </div>
          
          <div className="space-y-3">
            {scores && scores.length > 0 ? (
              scores.map((score) => (
                <div key={score.id} className="flex items-center justify-between rounded-lg border border-[var(--border-default)] p-3">
                  <span className="font-medium text-[var(--text-primary)]">{score.topic}</span>
                  <span className="font-bold text-[var(--text-primary)]">{score.score} / {score.total}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">You haven&apos;t taken any quizzes yet.</p>
            )}
          </div>
        </section>

        <section className={`p-6 ${card}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <FileTextIcon width={18} height={18} className="text-purple-500" />
              Saved Experiences
            </h2>
            <Link href="/experiences" className="text-sm text-indigo-600 hover:underline">Browse</Link>
          </div>
          <EmptyState title="No saved experiences" description="Bookmark experiences to read them later." />
        </section>
      </div>
    </div>
  );
}
