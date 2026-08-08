import { ExperienceForm } from "@/components/ExperienceForm";
import { FileTextIcon } from "@/components/icons";
import { surface } from "@/lib/ui";

interface PageProps {
  searchParams: Promise<{ company?: string }>;
}

export default async function SubmitExperiencePage({ searchParams }: PageProps) {
  const { company } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <span className={`flex size-10 items-center justify-center rounded-xl ${surface} text-indigo-600 dark:text-indigo-400`}>
          <FileTextIcon width={20} height={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Share an interview experience</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Help the next batch of juniors — the more specific, the more useful.
          </p>
        </div>
      </div>
      <ExperienceForm mode="create" defaultCompanyName={company} />
    </div>
  );
}
