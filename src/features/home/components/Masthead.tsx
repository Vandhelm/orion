"use client";

import { useReplay } from "../replay-context";
import { Clock } from "./Clock";

const RACE_WORDS = ["Accélérer", "Doubler", "Déraper", "Foncer", "Gagner"];

/** Bandeau titre (logo, marque, infos en ligne) et filet de mots avec « Rejouer l'intro ». */
export function Masthead() {
  const { replay } = useReplay();

  return (
    <>
      <header className="mast">
        <div className="mlogo" aria-hidden="true">
          <svg viewBox="0 0 22 14">
            <path d="M1 7 C 4 1, 11 0, 15 4 L 21 1 L 21 13 L 15 10 C 11 14, 4 13, 1 7 Z" fill="var(--blue)" />
            <rect x="5" y="5" width="2" height="2" fill="var(--blush)" />
          </svg>
        </div>
        <h1 className="brand">O.R.I.O.N</h1>
        <p className="minfo">
          1 284 PILOTES
          <br />
          EN LIGNE
          <br />
          <b>COURSES OUVERTES</b>
          <br />
          JOUR ET NUIT · <Clock />
        </p>
      </header>
      <div className="rule">
        {RACE_WORDS.map((word) => (
          <span key={word}>{word}</span>
        ))}
        <button className="replay" type="button" onClick={replay}>
          Rejouer l&apos;intro ↺
        </button>
      </div>
    </>
  );
}
