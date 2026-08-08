import { FileTextIcon } from "@/components/icons";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
      <span className="flex size-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
        <FileTextIcon width={20} height={20} />
      </span>
      <div>
        <p className="font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
        {description && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
      </div>
    </div>
  );
}
