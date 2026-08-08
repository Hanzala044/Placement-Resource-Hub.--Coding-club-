"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  difficulties,
  experienceLevels,
  outcomes,
  resourceTypes,
} from "@/lib/validators";
import { SearchIcon, XIcon } from "@/components/icons";
import { input, button } from "@/lib/ui";

type Company = { id: string; name: string };

interface FilterBarProps {
  kind: "experience" | "resource";
  companies?: Company[];
  hideCompanyFilter?: boolean;
}

const selectClass = `${input} w-auto min-w-[9.5rem] cursor-pointer py-2`;

export function FilterBar({ kind, companies = [], hideCompanyFilter }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function applyParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    applyParams({ search });
  }

  function onSelectChange(key: string) {
    return (e: React.ChangeEvent<HTMLSelectElement>) => applyParams({ [key]: e.target.value });
  }

  function reset() {
    setSearch("");
    router.push(pathname, { scroll: false });
  }

  const hasFilters = [...searchParams.keys()].length > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60"
    >
      <div className="relative min-w-[200px] flex-1">
        <SearchIcon
          width={16}
          height={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={kind === "experience" ? "Search role, rounds, content…" : "Search title or link…"}
          className={`${input} pl-9`}
          aria-label="Search"
        />
      </div>

      {!hideCompanyFilter && companies.length > 0 && (
        <select
          className={selectClass}
          value={searchParams.get("company") ?? ""}
          onChange={onSelectChange("company")}
          aria-label="Company"
        >
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {kind === "experience" && (
        <>
          <select
            className={selectClass}
            value={searchParams.get("difficulty") ?? ""}
            onChange={onSelectChange("difficulty")}
            aria-label="Difficulty"
          >
            <option value="">Any difficulty</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={searchParams.get("outcome") ?? ""}
            onChange={onSelectChange("outcome")}
            aria-label="Outcome"
          >
            <option value="">Any outcome</option>
            {outcomes.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={searchParams.get("level") ?? ""}
            onChange={onSelectChange("level")}
            aria-label="Level"
          >
            <option value="">Any level</option>
            {experienceLevels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </>
      )}

      {kind === "resource" && (
        <select
          className={selectClass}
          value={searchParams.get("type") ?? ""}
          onChange={onSelectChange("type")}
          aria-label="Resource type"
        >
          <option value="">Any type</option>
          {resourceTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}

      <select
        className={selectClass}
        value={searchParams.get("status") ?? "open"}
        onChange={onSelectChange("status")}
        aria-label="Status"
      >
        <option value="open">Open</option>
        <option value="archived">Archived</option>
        <option value="all">All statuses</option>
      </select>

      <select
        className={selectClass}
        value={searchParams.get("sort") ?? "newest"}
        onChange={onSelectChange("sort")}
        aria-label="Sort by"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        {kind === "experience" && <option value="helpful">Most helpful</option>}
      </select>

      <button type="submit" className={button.primary}>
        Search
      </button>

      {hasFilters && (
        <button type="button" onClick={reset} className={button.ghost}>
          <XIcon width={14} height={14} />
          Clear
        </button>
      )}
    </form>
  );
}
