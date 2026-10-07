import type { ReactNode } from "react";
import type { Room } from "./rooms";

/** Pictogrammes des salons (style affiche, noir et blanc + rouge et bleu foncé), viewBox 0 0 100 100. */
export type PictogramKey = "kakigori" | "soft" | "pop" | "dango" | "taiyaki" | "ramune" | "kori" | "cone";

const PICTOGRAMS: Record<PictogramKey, ReactNode> = {
  kakigori: (
    <>
      <path d="M18 56 L 82 56 L 72 92 L 28 92 Z" fill="var(--color-neutral-950)"/>
      <path d="M30 64 h40 M33 74 h34 M36 84 h28" stroke="var(--color-white)" strokeWidth="2.5"/>
      <path d="M14 56 C 14 34, 30 16, 50 14 C 70 16, 86 34, 86 56 Z" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <path d="M22 40 C 30 26, 44 20, 58 22 C 70 24, 78 32, 80 42 C 72 38, 66 46, 60 40 C 54 48, 46 40, 40 48 C 34 42, 28 46, 22 40 Z" fill="var(--color-red-600)" stroke="var(--color-neutral-950)" strokeWidth="3"/>
      <path d="M60 40 v10 M40 48 v8" stroke="var(--color-red-600)" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="62" cy="28" r="3" fill="var(--color-white)"/>
    </>
  ),
  soft: (
    <>
      <path d="M34 50 L 66 50 L 50 96 Z" fill="var(--color-neutral-950)"/>
      <path d="M38 60 L 62 60 M42 70 L 58 70 M46 80 L 54 80 M40 52 L 56 84 M60 52 L 44 84" stroke="var(--color-white)" strokeWidth="2.5"/>
      <path d="M28 50 C 22 42, 30 34, 38 36 C 34 26, 44 20, 52 24 C 52 14, 62 12, 62 4 C 70 12, 66 22, 62 26 C 72 26, 76 36, 70 42 C 78 44, 76 52, 70 52 Z" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M36 44 q14 6 30 -2 M42 32 q10 4 20 -2" fill="none" stroke="var(--color-neutral-950)" strokeWidth="3"/>
    </>
  ),
  pop: (
    <>
      <rect x="44" y="64" width="12" height="32" rx="3" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <path d="M28 18 C 28 8, 72 8, 72 18 L 72 64 C 72 70, 28 70, 28 64 Z" fill="var(--color-blue-900)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <path d="M28 40 L 72 40 L 72 64 C 72 70, 28 70, 28 64 Z" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <path d="M72 14 a10 10 0 0 0 -12 -2 a8 8 0 0 0 4 12 a8 8 0 0 0 8 -2 Z" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <path d="M38 20 v12" stroke="var(--color-white)" strokeWidth="5" strokeLinecap="round"/>
    </>
  ),
  dango: (
    <>
      <path d="M50 4 L 50 98" stroke="var(--color-neutral-950)" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="50" cy="24" r="16" fill="var(--color-red-600)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <circle cx="50" cy="54" r="16" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <circle cx="50" cy="84" r="16" fill="var(--color-blue-900)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <path d="M40 18 q4 -4 8 -2 M40 48 q4 -4 8 -2 M40 78 q4 -4 8 -2" stroke="var(--color-white)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="44" cy="58" r="2" fill="var(--color-neutral-950)"/>
      <circle cx="56" cy="58" r="2" fill="var(--color-neutral-950)"/>
      <path d="M46 63 q4 3 8 0" stroke="var(--color-neutral-950)" strokeWidth="2" fill="none"/>
    </>
  ),
  taiyaki: (
    <>
      <path d="M6 50 C 18 24, 58 20, 74 40 L 94 22 L 88 50 L 94 78 L 74 60 C 58 80, 18 76, 6 50 Z" fill="var(--color-neutral-950)"/>
      <path d="M30 38 a8 8 0 0 1 16 0 M44 38 a8 8 0 0 1 16 0 M26 52 a8 8 0 0 1 16 0 M40 52 a8 8 0 0 1 16 0 M54 52 a8 8 0 0 1 16 0 M34 64 a8 8 0 0 1 16 0 M48 64 a8 8 0 0 1 16 0" fill="none" stroke="var(--color-white)" strokeWidth="2.5"/>
      <circle cx="18" cy="46" r="5" fill="var(--color-white)"/>
      <circle cx="18" cy="46" r="2.2" fill="var(--color-neutral-950)"/>
      <path d="M60 18 C 56 6, 74 2, 78 12 C 86 10, 92 22, 82 26 Z" fill="var(--color-red-600)" stroke="var(--color-neutral-950)" strokeWidth="3"/>
    </>
  ),
  ramune: (
    <>
      <path d="M40 4 h20 v10 h-20 Z" fill="var(--color-neutral-950)"/>
      <path d="M42 14 C 42 24, 34 26, 34 36 L 34 92 C 34 96, 66 96, 66 92 L 66 36 C 66 26, 58 24, 58 14 Z" fill="var(--color-blue-900)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <path d="M42 30 C 40 34, 60 34, 58 30" stroke="var(--color-neutral-950)" strokeWidth="3" fill="none"/>
      <circle cx="50" cy="26" r="6" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="3"/>
      <rect x="34" y="52" width="32" height="22" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="3"/>
      <path d="M38 58 q6 -6 12 0 t12 0 M38 66 q6 -6 12 0 t12 0" stroke="var(--color-neutral-950)" strokeWidth="2.5" fill="none"/>
      <path d="M40 40 v8 M40 80 v6" stroke="var(--color-white)" strokeWidth="3" strokeLinecap="round"/>
    </>
  ),
  kori: (
    <>
      <path d="M14 6 L 14 98" stroke="var(--color-neutral-950)" strokeWidth="5"/>
      <path d="M14 10 L 88 10 L 88 74 L 14 74 Z" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <path d="M14 60 q9 -10 18 0 t18 0 t18 0 t20 0 L 88 74 L 14 74 Z" fill="var(--color-blue-900)" stroke="var(--color-neutral-950)" strokeWidth="3"/>
      <path d="M14 66 q9 -8 18 0 t18 0 t18 0 t20 0" stroke="var(--color-white)" strokeWidth="2" fill="none"/>
      <text x="51" y="50" textAnchor="middle" fontSize="40" fontFamily="var(--font-noto-jp), Hiragino Sans, sans-serif" fontWeight="700" fill="var(--color-red-600)" stroke="var(--color-neutral-950)" strokeWidth="1.5">氷</text>
      <path d="M88 10 l6 -4" stroke="var(--color-neutral-950)" strokeWidth="3"/>
    </>
  ),
  cone: (
    <>
      <path d="M32 54 L 68 54 L 50 98 Z" fill="var(--color-neutral-950)"/>
      <path d="M36 62 L 64 62 M40 72 L 60 72 M44 82 L 56 82" stroke="var(--color-white)" strokeWidth="2.5"/>
      <circle cx="50" cy="44" r="18" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <circle cx="50" cy="22" r="16" fill="var(--color-red-600)" stroke="var(--color-neutral-950)" strokeWidth="4"/>
      <path d="M34 50 q4 8 8 0 q4 8 8 0 q4 8 8 0 q4 8 8 0" fill="var(--color-white)" stroke="var(--color-neutral-950)" strokeWidth="3"/>
      <circle cx="50" cy="6" r="5" fill="var(--color-red-600)" stroke="var(--color-neutral-950)" strokeWidth="3"/>
      <path d="M42 16 q4 -4 8 -2" stroke="var(--color-white)" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </>
  ),
};

/** Onomatopée affichée sur la case et dans la bulle du détail. */
export const SOUND_EFFECTS: Record<PictogramKey, string> = {
  kakigori: "シャリ",
  soft: "ペロッ",
  pop: "ひんやり",
  dango: "モチッ",
  taiyaki: "ホカホカ",
  ramune: "シュワッ",
  kori: "こおり",
  cone: "とろ〜",
};

const PICTOGRAM_BY_NAME: Record<string, PictogramKey> = {
  "Kakigōri fraise": "kakigori",
  "Stand Ramune": "ramune",
  "Mochi secret": "dango",
  "Dango Club": "dango",
  "Cornet géant": "cone",
  "Glaçons & Cie": "kori",
  "Taiyaki chaud": "taiyaki",
  "Yuzu privé": "pop",
  "Soft cream": "soft",
  "Comptoir 42": "kori",
  "Bâtonnets glacés": "pop",
  "Sirop melon": "kakigori",
};

const PICTOGRAM_KEYS = Object.keys(PICTOGRAMS) as PictogramKey[];

/** Pictogramme du salon : choisi d'après le nom connu, sinon dérivé du code (stable d'un rendu à l'autre). */
export function pictogramFor(room: Room): PictogramKey {
  const known = PICTOGRAM_BY_NAME[room.name];
  if (known) return known;
  const hash = [...room.code].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PICTOGRAM_KEYS[hash % PICTOGRAM_KEYS.length];
}

export function RoomPictogram({ pictogram }: { pictogram: PictogramKey }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      {PICTOGRAMS[pictogram]}
    </svg>
  );
}
