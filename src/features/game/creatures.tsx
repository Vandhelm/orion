/**
 * Pilotes (avatars) de la maquette : trois silhouettes, chacune remplie d'une couleur vive.
 */

export type CreatureShape = "fish" | "jelly" | "squid";

export type Avatar = { shape: CreatureShape; color: string };

/** Ordre de la maquette : « Changer de pilote » fait défiler cette liste. */
export const AVATARS: readonly Avatar[] = [
  { shape: "fish", color: "var(--color-red-600)" },
  { shape: "fish", color: "var(--color-cyan-400)" },
  { shape: "fish", color: "var(--color-blue-900)" },
  { shape: "jelly", color: "var(--color-cyan-400)" },
  { shape: "squid", color: "var(--color-orange-500)" },
  { shape: "jelly", color: "var(--color-red-600)" },
  { shape: "squid", color: "var(--color-cyan-400)" },
  { shape: "fish", color: "var(--color-orange-500)" },
  { shape: "fish", color: "var(--color-white)" },
];

type CreatureSvgProps = { avatar: Avatar; className?: string };

/** Contenu SVG (viewBox 0 0 150 150) de chaque silhouette ; `color` remplit le corps. */
function CreatureShapes({ shape, color }: Avatar) {
  switch (shape) {
    case "fish":
      return (
        <>
          <path d="M10 80 C 30 40, 90 34, 112 66 L 142 40 L 136 80 L 142 118 L 112 94 C 90 124, 30 120, 10 80 Z" fill={color} stroke="var(--color-neutral-950)" strokeWidth="6"/>
          <rect x="34" y="66" width="14" height="14" fill="var(--color-neutral-950)"/>
          <rect x="39" y="71" width="5" height="5" fill="var(--color-white)"/>
        </>
      );
    case "jelly":
      return (
        <>
          <path d="M25 78 C 25 30, 125 30, 125 78 Z" fill={color} stroke="var(--color-neutral-950)" strokeWidth="6"/>
          <path d="M40 82 v38 M60 82 v52 M80 82 v44 M100 82 v54 M115 82 v34" stroke="var(--color-neutral-950)" strokeWidth="7" strokeLinecap="square"/>
          <rect x="56" y="54" width="10" height="10" fill="var(--color-neutral-950)"/>
          <rect x="86" y="54" width="10" height="10" fill="var(--color-neutral-950)"/>
        </>
      );
    case "squid":
      return (
        <>
          <path d="M75 10 L 112 52 L 104 96 L 46 96 L 38 52 Z" fill={color} stroke="var(--color-neutral-950)" strokeWidth="6"/>
          <path d="M50 100 l-10 40 M66 100 l-4 44 M84 100 l4 44 M100 100 l10 40" stroke="var(--color-neutral-950)" strokeWidth="7" strokeLinecap="square"/>
          <rect x="56" y="66" width="10" height="10" fill="var(--color-neutral-950)"/>
          <rect x="84" y="66" width="10" height="10" fill="var(--color-neutral-950)"/>
        </>
      );
  }
}

export function CreatureSvg({ avatar, className }: CreatureSvgProps) {
  return (
    <svg viewBox="0 0 150 150" aria-hidden="true" className={className}>
      <CreatureShapes {...avatar} />
    </svg>
  );
}
