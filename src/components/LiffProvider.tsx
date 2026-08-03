"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialiseLiff, LiffInitialisationError } from "@/src/lib/liff";
import type { LiffState } from "@/src/types/liff";

const initialState: LiffState = {
  loading: true,
  ready: false,
  insideLine: false,
  loggedIn: false,
  browserFallback: false,
  profile: null,
  error: null,
};

const LiffContext = createContext<LiffState | null>(null);

export function LiffProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiffState>(initialState);

  useEffect(() => {
    let active = true;

    initialiseLiff()
      .then((result) => {
        if (!active) return;
        setState({
          loading: false,
          ready: true,
          insideLine: result.insideLine,
          loggedIn: result.loggedIn,
          browserFallback: result.browserFallback,
          profile: result.profile,
          error: result.profileError,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const insideLine =
          error instanceof LiffInitialisationError ? error.insideLine : false;
        setState({
          loading: false,
          ready: false,
          insideLine,
          loggedIn: false,
          browserFallback: !insideLine,
          profile: null,
          error: error instanceof Error ? error.message : "LIFF could not be initialised.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);

  return <LiffContext.Provider value={value}>{children}</LiffContext.Provider>;
}

export function useLiff(): LiffState {
  const context = useContext(LiffContext);

  if (!context) {
    throw new Error("useLiff must be used within a LiffProvider.");
  }

  return context;
}
