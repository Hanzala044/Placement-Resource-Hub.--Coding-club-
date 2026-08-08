"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { button } from "@/lib/ui";
import { AlertCircleIcon } from "@/components/icons";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "default" | "danger";
}

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    setState(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  function close(result: boolean) {
    resolver.current?.(result);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              {state.tone === "danger" && (
                <span className="mt-0.5 rounded-full bg-rose-100 p-1.5 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <AlertCircleIcon width={16} height={16} />
                </span>
              )}
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{state.title}</h2>
                {state.description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{state.description}</p>
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className={button.secondary} onClick={() => close(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={state.tone === "danger" ? button.dangerSolid : button.primary}
                onClick={() => close(true)}
                autoFocus
              >
                {state.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
