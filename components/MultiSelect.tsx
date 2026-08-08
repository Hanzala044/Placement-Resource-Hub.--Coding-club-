"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon, ChevronDownIcon, XIcon, CheckIcon } from "@/components/icons";

export interface SelectOption {
  value: string;
  label: string;
}

const TONES = {
  indigo: {
    pill: "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.45)]",
    check: "border-indigo-400 bg-indigo-500",
    ring: "focus-within:border-indigo-500 focus-within:ring-indigo-500/20",
  },
  violet: {
    pill: "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.45)]",
    check: "border-violet-400 bg-violet-500",
    ring: "focus-within:border-violet-500 focus-within:ring-violet-500/20",
  },
  emerald: {
    pill: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.45)]",
    check: "border-emerald-400 bg-emerald-500",
    ring: "focus-within:border-emerald-500 focus-within:ring-emerald-500/20",
  },
  amber: {
    pill: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.45)]",
    check: "border-amber-400 bg-amber-500",
    ring: "focus-within:border-amber-500 focus-within:ring-amber-500/20",
  },
  rose: {
    pill: "bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.45)]",
    check: "border-rose-400 bg-rose-500",
    ring: "focus-within:border-rose-500 focus-within:ring-rose-500/20",
  },
} as const;

interface MultiSelectProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** false = single-pick: choosing an option replaces the selection and closes the menu. */
  multiple?: boolean;
  searchable?: boolean;
  tone?: keyof typeof TONES;
  /** Max pills shown in the closed control before collapsing into a "+N" badge. */
  maxPills?: number;
  className?: string;
}

/**
 * Custom dropdown replacing native <select> for the filter bars — pill tags
 * for the closed state, an inner search box + checkbox list for the open
 * state. Colors follow the app's own indigo/violet brand rather than the
 * reference's pink/gold, so it reads as one system with the rest of the UI.
 */
export function MultiSelect({
  label,
  placeholder = "Any",
  options,
  selected,
  onChange,
  multiple = true,
  searchable = true,
  tone = "indigo",
  maxPills = 2,
  className = "",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const toneClasses = TONES[tone];

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setQuery("");
  }, [open, searchable]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const selectedLabels = useMemo(
    () => selected.map((v) => options.find((o) => o.value === v)?.label ?? v),
    [selected, options]
  );

  function toggle(value: string) {
    if (!multiple) {
      onChange([value]);
      setOpen(false);
      return;
    }
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange([]);
  }

  const visiblePills = selectedLabels.slice(0, maxPills);
  const overflowCount = selectedLabels.length - visiblePills.length;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={`flex w-full items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-3 py-2.5 text-left text-sm shadow-sm transition-colors ${toneClasses.ring} focus-within:ring-2 ${
          open ? "border-indigo-500" : ""
        }`}
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selectedLabels.length === 0 ? (
            <span className="text-[var(--text-secondary)]">{placeholder}</span>
          ) : (
            <>
              {visiblePills.map((l) => (
                <span key={l} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses.pill}`}>
                  {l}
                </span>
              ))}
              {overflowCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[10px] font-semibold text-[var(--text-primary)]">
                  +{overflowCount}
                </span>
              )}
            </>
          )}
        </span>
        {selectedLabels.length > 0 && multiple && (
          <span
            role="button"
            tabIndex={0}
            onClick={clear}
            className="shrink-0 rounded-full p-0.5 text-[var(--text-secondary)] hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={`Clear ${label}`}
          >
            <XIcon width={14} height={14} />
          </span>
        )}
        <ChevronDownIcon
          width={16}
          height={16}
          className={`shrink-0 text-[var(--text-secondary)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-72 max-w-[90vw] overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] shadow-xl">
          {searchable && (
            <div className="relative border-b border-[var(--border-default)] p-2">
              <SearchIcon width={14} height={14} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                className="w-full rounded-lg border border-transparent bg-[var(--surface-muted)] py-1.5 pl-7 pr-2 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-300"
              />
            </div>
          )}

          <div className="grid max-h-64 grid-cols-1 gap-0.5 overflow-y-auto p-2 sm:grid-cols-2">
            {filteredOptions.length === 0 && (
              <p className="col-span-full px-2 py-3 text-center text-sm text-[var(--text-secondary)]">No matches</p>
            )}
            {filteredOptions.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  role={multiple ? "option" : undefined}
                  aria-selected={checked}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                >
                  {multiple ? (
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        checked ? toneClasses.check : "border-[var(--border-default)]"
                      }`}
                    >
                      {checked && <CheckIcon width={11} height={11} className="text-white" strokeWidth={3} />}
                    </span>
                  ) : (
                    <span className={`size-1.5 shrink-0 rounded-full ${checked ? "bg-indigo-500" : "bg-transparent"}`} />
                  )}
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
