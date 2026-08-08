import { ResourceForm } from "@/components/ResourceForm";
import { LinkIcon } from "@/components/icons";
import { surface } from "@/lib/ui";

interface PageProps {
  searchParams: Promise<{ company?: string }>;
}

export default async function SubmitResourcePage({ searchParams }: PageProps) {
  const { company } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <span className={`flex size-10 items-center justify-center rounded-xl ${surface} text-indigo-600 dark:text-indigo-400`}>
          <LinkIcon width={20} height={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Add a prep resource</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Prep sheets, articles, videos — anything that would&rsquo;ve helped you.
          </p>
        </div>
      </div>
      <ResourceForm mode="create" defaultCompanyName={company} />
    </div>
  );
}
