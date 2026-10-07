"use client";

import type { KeyboardEvent } from "react";
import { useGame, type Mode } from "../GameProvider";

const ARROW_KEYS = new Set(["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"]);

/** Flèches du clavier : passe à l'autre onglet (il n'y en a que deux). */
function useTabKeyboard() {
  const { mode, chooseMode } = useGame();
  return (event: KeyboardEvent<HTMLDivElement>) => {
    if (!ARROW_KEYS.has(event.key)) return;
    event.preventDefault();
    const next: Mode = mode === "anon" ? "auth" : "anon";
    chooseMode(next);
    event.currentTarget.querySelector<HTMLElement>(`[data-mode="${next}"]`)?.focus();
  };
}

/** Onglets latéraux (grand écran) : bannières verticales en kanji. */
export function SideTabs() {
  const { mode, chooseMode } = useGame();
  const onKeyDown = useTabKeyboard();
  const tabs = [
    { id: "tabAnon", value: "anon", kanji: "匿名", label: "Anonyme", hint: "Juste un surnom", panel: "panelAnon" },
    { id: "tabAuth", value: "auth", kanji: "会員", label: "Authentification", hint: "Mon compte", panel: "panelAuth" },
  ] as const;

  return (
    <aside className="notes">
      <div className="sidetabs" role="tablist" aria-label="Mode de connexion" onKeyDown={onKeyDown}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className="stab"
            role="tab"
            id={tab.id}
            data-mode={tab.value}
            aria-selected={mode === tab.value}
            aria-controls={tab.panel}
            type="button"
            onClick={() => chooseMode(tab.value)}
          >
            <span className="k">{tab.kanji}</span>
            <span className="tx">
              <b>{tab.label}</b>
              <small>{tab.hint}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="vlabel">
        <span>オリオン</span>
        <small>O.R.I.O.N</small>
      </div>
    </aside>
  );
}

/** Onglets horizontaux (petit écran), au-dessus de la fenêtre de jeu. */
export function MobileTabs() {
  const { mode, chooseMode } = useGame();
  const onKeyDown = useTabKeyboard();
  const tabs = [
    { value: "anon", label: "Anonyme" },
    { value: "auth", label: "Authentification" },
  ] as const;

  return (
    <div className="mtabs" role="tablist" aria-label="Mode de connexion" onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className="mtab"
          role="tab"
          data-mode={tab.value}
          aria-selected={mode === tab.value}
          type="button"
          onClick={() => chooseMode(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
