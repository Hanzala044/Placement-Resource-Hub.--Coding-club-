"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  difficulties,
  experienceLevels,
  outcomes,
  resourceTypes,
} from "@/lib/validators";
import { MultiSelect, type SelectOption } from "@/components/MultiSelect";
import { SearchIcon, XIcon } from "@/components/icons";
import { input, button } from "@/lib/ui";

type Company = { id: string; name: string };

interface FilterBarProps {
  kind: "experience" | "resource";
  companies?: Company[];
  hideCompanyFilter?: boolean;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: "open", label: "Open" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All statuses" },
];

const EXPERIENCE_SORT_OPTIONS: SelectOption[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "helpful", label: "Most helpful" },
];

const RESOURCE_SORT_OPTIONS: SelectOption[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

function parseList(v: string | null): string[] {
  return v ? v.split(",").filter(Boolean) : [];
}

/**
 * Custom multi-select filter bar (see components/MultiSelect.tsx) —
 * replaces the old stacked native <select> dropdowns. Multi-select
 * filters (company/difficulty/outcome/level/type) apply as soon as you
 * toggle a checkbox; the free-text search box still waits for Enter/the
 * Search button so it doesn't navigate on every keystroke.
 */
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

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    applyParams({ search });
  }

  const setMulti = (key: string) => (values: string[]) => applyParams({ [key]: values.join(",") });
  const setSingle = (key: string) => (values: string[]) => applyParams({ [key]: values[0] ?? "" });

  function reset() {
    setSearch("");
    router.push(pathname, { scroll: false });
  }

  const hasFilters = [...searchParams.keys()].length > 0;

  const companyOptions: SelectOption[] = companies.map((c) => ({ value: c.id, label: c.name }));
  const difficultyOptions: SelectOption[] = difficulties.map((d) => ({ value: d, label: d }));
  const outcomeOptions: SelectOption[] = outcomes.map((o) => ({ value: o, label: o }));
  const levelOptions: SelectOption[] = experienceLevels.map((l) => ({ value: l, label: l }));
  const typeOptions: SelectOption[] = resourceTypes.map((t) => ({ value: t, label: t }));
  const sortOptions = kind === "experience" ? EXPERIENCE_SORT_OPTIONS : RESOURCE_SORT_OPTIONS;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)]/70 p-3 shadow-sm backdrop-blur sm:p-4">
      <form onSubmit={onSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={kind === "experience" ? "Search role, rounds, content…" : "Search title or link…"}
            className={`${input} pl-9`}
            aria-label="Search"
          />
        </div>
        <button type="submit" className={button.primary}>
          Search
        </button>
        {hasFilters && (
          <button type="button" onClick={reset} className={button.secondary}>
            <XIcon width={14} height={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </form>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {!hideCompanyFilter && companyOptions.length > 0 && (
          <MultiSelect
            label="Company"
            placeholder="All companies"
            options={companyOptions}
            selected={parseList(searchParams.get("company"))}
            onChange={setMulti("company")}
            tone="indigo"
          />
        )}

        {kind === "experience" && (
          <>
            <MultiSelect
              label="Difficulty"
              placeholder="Any difficulty"
              options={difficultyOptions}
              selected={parseList(searchParams.get("difficulty"))}
              onChange={setMulti("difficulty")}
              searchable={false}
              tone="amber"
            />
            <MultiSelect
              label="Outcome"
              placeholder="Any outcome"
              options={outcomeOptions}
              selected={parseList(searchParams.get("outcome"))}
              onChange={setMulti("outcome")}
              searchable={false}
              tone="emerald"
            />
            <MultiSelect
              label="Level"
              placeholder="Any level"
              options={levelOptions}
              selected={parseList(searchParams.get("level"))}
              onChange={setMulti("level")}
              searchable={false}
              tone="violet"
            />
          </>
        )}

        {kind === "resource" && (
          <MultiSelect
            label="Type"
            placeholder="Any type"
            options={typeOptions}
            selected={parseList(searchParams.get("type"))}
            onChange={setMulti("type")}
            searchable={false}
            tone="violet"
          />
        )}

        <MultiSelect
          label="Status"
          placeholder="Open"
          options={STATUS_OPTIONS}
          selected={[searchParams.get("status") ?? "open"]}
          onChange={setSingle("status")}
          multiple={false}
          searchable={false}
          tone="rose"
        />

        <MultiSelect
          label="Sort"
          placeholder="Newest first"
          options={sortOptions}
          selected={[searchParams.get("sort") ?? "newest"]}
          onChange={setSingle("sort")}
          multiple={false}
          searchable={false}
          tone="indigo"
        />
      </div>
    </div>
  );
}
