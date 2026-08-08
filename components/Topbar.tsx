"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MenuIcon, SearchIcon, PlusIcon, ChevronDownIcon, FileTextIcon, LinkIcon } from "@/components/icons";
import { input } from "@/lib/ui";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setQuickAddOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    router.push(`/experiences${params}`);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border-default)] bg-[var(--surface-card)]/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-md p-2 text-[var(--text-secondary)] hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800" aria-label="Open menu">
        <MenuIcon width={20} height={20} />
      </button>

      <form onSubmit={onSearchSubmit} className="relative min-w-0 max-w-md flex-1">
        <SearchIcon width={15} height={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search experiences…"
          className={`${input} py-2 pl-9 text-sm`}
        />
      </form>

      <ThemeToggle />

      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setQuickAddOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          <PlusIcon width={15} height={15} />
          <span className="hidden sm:inline">New</span>
          <ChevronDownIcon width={14} height={14} />
        </button>

        {quickAddOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] py-1 shadow-lg">
            <Link
              href="/submit-experience"
              onClick={() => setQuickAddOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[var(--text-primary)] hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <FileTextIcon width={16} height={16} className="text-indigo-500" />
              Share experience
            </Link>
            <Link
              href="/submit-resource"
              onClick={() => setQuickAddOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[var(--text-primary)] hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <LinkIcon width={16} height={16} className="text-indigo-500" />
              Add resource
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center">
        {isLoaded && !isSignedIn && (
          <SignInButton mode="modal">
            <button className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-zinc-50 dark:hover:bg-zinc-800">
              Sign In
            </button>
          </SignInButton>
        )}
        {isLoaded && isSignedIn && (
          <UserButton afterSignOutUrl="/" />
        )}
      </div>
    </header>
  );
}
