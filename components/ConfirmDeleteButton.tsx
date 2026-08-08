"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrashIcon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { button } from "@/lib/ui";

interface ConfirmDeleteButtonProps {
  endpoint: string;
  label?: string;
  itemLabel?: string;
  /** Where to navigate after a successful delete. Omit to just refresh the current list. */
  redirectTo?: string;
  className?: string;
}

export function ConfirmDeleteButton({
  endpoint,
  label = "Delete",
  itemLabel = "this entry",
  redirectTo,
  className = "",
}: ConfirmDeleteButtonProps) {
  const router = useRouter();
  const { show } = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = await confirm({
      title: `Delete ${itemLabel}?`,
      description: "This can't be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete");
      }
      show("Deleted", "success");
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Something went wrong", "error");
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={onDelete} disabled={loading} className={`${button.danger} ${className}`}>
      <TrashIcon width={14} height={14} />
      {loading ? "Deleting…" : label}
    </button>
  );
}
