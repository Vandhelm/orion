"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ReplayContextValue = {
  /** Change à chaque "Rejouer" : les éléments animés s'y réfèrent via `key` pour remonter et rejouer leur animation CSS. */
  replayKey: number;
  replay: () => void;
};

const ReplayContext = createContext<ReplayContextValue | null>(null);

export function ReplayProvider({ children }: { children: ReactNode }) {
  const [replayKey, setReplayKey] = useState(0);
  const value = useMemo<ReplayContextValue>(
    () => ({ replayKey, replay: () => setReplayKey((key) => key + 1) }),
    [replayKey],
  );

  return <ReplayContext.Provider value={value}>{children}</ReplayContext.Provider>;
}

export function useReplay() {
  const context = useContext(ReplayContext);
  if (!context) {
    throw new Error("useReplay doit être utilisé à l'intérieur d'un ReplayProvider");
  }
  return context;
}
