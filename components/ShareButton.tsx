"use client";

import { useState } from "react";
import { LinkIcon, CheckCircleIcon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { button } from "@/lib/ui";

export function ShareButton() {
  const { show } = useToast();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      show("Link copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      show("Couldn't copy the link — copy it from the address bar instead", "error");
    }
  }

  return (
    <button type="button" onClick={copyLink} className={`${button.secondary} w-full`}>
      {copied ? <CheckCircleIcon width={15} height={15} /> : <LinkIcon width={15} height={15} />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
