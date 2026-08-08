import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { Resource } from "@/lib/types";
import { ResourceForm } from "@/components/ResourceForm";
import { PencilIcon } from "@/components/icons";
import { surface } from "@/lib/ui";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditResourcePage({ params }: PageProps) {
  const { id } = await params;

  const { data: resource } = await supabaseAdmin
    .from("resources")
    .select("*, companies(id, name, industry)")
    .eq("id", id)
    .maybeSingle();

  if (!resource) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <span className={`flex size-10 items-center justify-center rounded-xl ${surface} text-indigo-600 dark:text-indigo-400`}>
          <PencilIcon width={18} height={18} />
        </span>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Edit resource</h1>
      </div>
      <ResourceForm mode="edit" resource={resource as Resource} />
    </div>
  );
}
