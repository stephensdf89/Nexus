"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY = "creator-nexus-history-state";

type HistoryState = {
  stack: string[];
  index: number;
};

function getCurrentUrl() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function readStoredState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as HistoryState;
    if (!Array.isArray(parsed?.stack) || typeof parsed?.index !== "number") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeStoredState(state: HistoryState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function HistoryNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [hash, setHash] = useState("");
  const [historyState, setHistoryState] = useState<HistoryState>({ stack: [], index: -1 });
  const [ready, setReady] = useState(false);
  const navigationModeRef = useRef<"init" | "push" | "pop">("init");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncHash = () => setHash(window.location.hash || "");
    const handlePopState = () => {
      navigationModeRef.current = "pop";
      syncHash();
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const routeKey = useMemo(() => {
    const query = search ? `?${search}` : "";
    return `${pathname}${query}${hash}`;
  }, [hash, pathname, search]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = readStoredState();
    const currentUrl = getCurrentUrl();

    if (!stored || stored.stack.length === 0) {
      const initialState = { stack: [currentUrl], index: 0 };
      setHistoryState(initialState);
      writeStoredState(initialState);
      setReady(true);
      navigationModeRef.current = "push";
      return;
    }

    const existingIndex = stored.stack.lastIndexOf(currentUrl);
    const nextState =
      existingIndex >= 0
        ? { stack: stored.stack, index: existingIndex }
        : {
            stack: [...stored.stack, currentUrl],
            index: stored.stack.length,
          };

    setHistoryState(nextState);
    writeStoredState(nextState);
    setReady(true);
    navigationModeRef.current = "push";
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    setHistoryState((previous) => {
      if (previous.index >= 0 && previous.stack[previous.index] === routeKey) {
        return previous;
      }

      if (navigationModeRef.current === "pop") {
        navigationModeRef.current = "push";
        const popIndex = previous.stack.lastIndexOf(routeKey);

        if (popIndex >= 0) {
          const nextState = {
            stack: previous.stack,
            index: popIndex,
          };
          writeStoredState(nextState);
          return nextState;
        }
      }

      const nextStack = [...previous.stack.slice(0, previous.index + 1), routeKey];
      const nextState = {
        stack: nextStack,
        index: nextStack.length - 1,
      };
      writeStoredState(nextState);
      return nextState;
    });
  }, [ready, routeKey]);

  const canGoBack = historyState.index > 0;
  const canGoForward =
    historyState.index >= 0 && historyState.index < historyState.stack.length - 1;

  const handleBack = () => {
    if (!canGoBack || typeof window === "undefined") {
      return;
    }

    const target = historyState.stack[historyState.index - 1];
    if (!target) {
      return;
    }

    navigationModeRef.current = "pop";
    const nextState = {
      stack: historyState.stack,
      index: historyState.index - 1,
    };
    setHistoryState(nextState);
    writeStoredState(nextState);
    router.push(target);
  };

  const handleForward = () => {
    if (!canGoForward || typeof window === "undefined") {
      return;
    }

    const target = historyState.stack[historyState.index + 1];
    if (!target) {
      return;
    }

    navigationModeRef.current = "pop";
    const nextState = {
      stack: historyState.stack,
      index: historyState.index + 1,
    };
    setHistoryState(nextState);
    writeStoredState(nextState);
    router.push(target);
  };

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-cyan-400/35 bg-[rgba(10,20,58,0.88)] px-3 py-2 text-cyan-100 shadow-[0_12px_28px_rgba(0,194,255,0.18)] backdrop-blur-md">
        <button
          type="button"
          onClick={handleBack}
          disabled={!canGoBack}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={handleForward}
          disabled={!canGoForward}
          aria-label="Go forward"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>

        <div className="hidden pr-1 text-xs text-cyan-100/70 md:block">
          Back and forward keep this tab in its exact navigation order.
        </div>
      </div>
    </div>
  );
}