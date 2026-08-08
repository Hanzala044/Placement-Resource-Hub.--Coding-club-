"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArchiveIcon, ArchiveRestoreIcon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { button } from "@/lib/ui";

interface ArchiveToggleButtonProps {
  endpoint: string;
  currentStatus: "open" | "archived";
  /** "server-toggle" sends an empty PATCH body and lets the route flip the
   *  status itself (used by /api/experiences/[id]/archive). "explicit"
   *  computes the opposite status client-side and sends it (used by the
   *  generic /api/resources/[id] PATCH route). */
  mode?: "server-toggle" | "explicit";
  className?: string;
}

export function ArchiveToggleButton({ endpoint, currentStatus, mode = "explicit", className = "" }: ArchiveToggleButtonProps) {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const isArchived = currentStatus === "archived";

  async function toggle() {
    setLoading(true);
    try {
      const body = mode === "explicit" ? JSON.stringify({ status: isArchived ? "open" : "archived" }) : undefined;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update status");
      }
      show(isArchived ? "Reopened" : "Archived", "success");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={loading} className={`${button.ghost} ${className}`}>
      {isArchived ? <ArchiveRestoreIcon width={14} height={14} /> : <ArchiveIcon width={14} height={14} />}
      {loading ? "…" : isArchived ? "Reopen" : "Archive"}
    </button>
  );
}
