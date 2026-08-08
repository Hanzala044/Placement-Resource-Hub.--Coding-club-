import { FileTextIcon } from "@/components/icons";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border-default)] p-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)]">
        <FileTextIcon width={20} height={20} />
      </span>
      <div>
        <p className="font-medium text-[var(--text-primary)]">{title}</p>
        {description && <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>}
      </div>
    </div>
  );
}
