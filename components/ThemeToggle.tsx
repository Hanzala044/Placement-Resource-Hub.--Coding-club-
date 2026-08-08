"use client";

import { useSyncExternalStore } from "react";
import { Coffee, Sparkles } from "lucide-react";

const STORAGE_KEY = "prh:theme";
const CHANGE_EVENT = "prh-theme-change";

type Theme = "default" | "cream";

function readTheme(): Theme {
  if (typeof window === "undefined") return "default";
  return window.localStorage.getItem(STORAGE_KEY) === "cream" ? "cream" : "default";
}

// No real external mutation to watch — the store only "changes" when our
// own toggle() below fires a same-tab CHANGE_EVENT, so subscribe just
// listens for that. (localStorage's own `storage` event never fires in
// the tab that wrote the value, only in *other* tabs.)
function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme === "cream" ? "cream" : "");
  window.localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Toggles a "cream" theme override — see the data-theme tokens in
 * app/globals.css and the FOUC-prevention inline script in app/layout.tsx.
 * Reads/writes via useSyncExternalStore rather than useState+useEffect so
 * the initial render matches the server (no localStorage there) without
 * tripping the set-state-in-effect lint rule.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "default" as Theme);
  const cream = theme === "cream";

  return (
    <button
      type="button"
      onClick={() => applyTheme(cream ? "default" : "cream")}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      title={cream ? "Switch back to the default theme" : "Switch to cream theme"}
    >
      {cream ? <Sparkles width={15} height={15} /> : <Coffee width={15} height={15} />}
      <span className="hidden sm:inline">{cream ? "Default" : "Cream"}</span>
    </button>
  );
}
