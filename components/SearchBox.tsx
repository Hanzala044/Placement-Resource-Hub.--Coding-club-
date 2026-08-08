"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SearchIcon } from "@/components/icons";
import { input, button } from "@/lib/ui";

export function SearchBox() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = value.trim() ? `?search=${encodeURIComponent(value.trim())}` : "";
    router.push(`/experiences${params}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-xl gap-2">
      <div className="relative flex-1">
        <SearchIcon width={17} height={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search interview experiences — company, role, topic…"
          className={`${input} py-3 pl-10 text-sm`}
        />
      </div>
      <button type="submit" className={`${button.primary} py-3`}>
        Search
      </button>
    </form>
  );
}
