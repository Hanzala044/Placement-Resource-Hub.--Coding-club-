"use client";

import Link from "next/link";
import type { Resource } from "@/lib/types";
import { TypeBadge, StatusBadge, TagChip } from "@/components/Badge";
import { ArchiveToggleButton } from "@/components/ArchiveToggleButton";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { PencilIcon, LinkIcon } from "@/components/icons";
import { button, cardHover } from "@/lib/ui";

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div className={`flex flex-col gap-3 p-4 ${cardHover}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
          >
            {resource.title}
            <LinkIcon width={13} height={13} className="opacity-50" />
          </a>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {resource.companies?.name ?? "General"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <TypeBadge value={resource.resource_type} />
          {resource.status === "archived" && <StatusBadge value={resource.status} />}
        </div>
      </div>

      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {resource.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <Link href={`/resource/${resource.id}/edit`} className={button.ghost}>
          <PencilIcon width={14} height={14} />
          Edit
        </Link>
        <ArchiveToggleButton endpoint={`/api/resources/${resource.id}`} currentStatus={resource.status} />
        <ConfirmDeleteButton endpoint={`/api/resources/${resource.id}`} itemLabel="this resource" />
      </div>
    </div>
  );
}
