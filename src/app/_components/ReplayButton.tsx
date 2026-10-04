"use client";

import { useReplay } from "./replay-context";

export function ReplayButton() {
  const { replay } = useReplay();

  return (
    <button
      type="button"
      onClick={replay}
      className="font-mono text-[18px] whitespace-nowrap bg-background text-foreground border-2 border-border rounded-[6px] min-h-[34px] px-[12px] cursor-pointer shadow-hard-sm hover:bg-foreground hover:text-background"
    >
      REJOUER ↺
    </button>
  );
}
