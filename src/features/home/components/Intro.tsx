"use client";

import { useMemo, type CSSProperties } from "react";
import { useReplay } from "../replay-context";
import { IntroArt } from "./IntroArt";
import { IntroEffects } from "./IntroEffects";
import { TitleSvg } from "./TitleSvg";

const BURST_RAYS = 110;
const STREAKS = 26;

/** Générateur pseudo-aléatoire à graine : même rendu côté serveur et côté client (pas d'écart d'hydratation). */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rayons fins du fond de l'intro (polygones très étroits partant du centre). */
function burstRays(random: () => number): string[] {
  const point = (radius: number, angle: number) =>
    `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`;
  return Array.from({ length: BURST_RAYS }, (_, i) => {
    const angle = ((i + random() * 0.7) / BURST_RAYS) * Math.PI * 2;
    const width = 0.002 + random() * 0.006;
    const start = 40 + random() * 30;
    return `${point(start, angle)} ${point(150, angle - width)} ${point(150, angle + width)}`;
  });
}

type StreakStyle = CSSProperties & { "--dx": string };

/** Traînées de vitesse, alternativement vers la gauche et vers la droite. */
function speedStreaks(random: () => number): StreakStyle[] {
  return Array.from({ length: STREAKS }, (_, i) => {
    const towardLeft = i % 2 === 0;
    return {
      top: `${(8 + random() * 84).toFixed(1)}%`,
      [towardLeft ? "right" : "left"]: "50%",
      width: `${(8 + random() * 22).toFixed(1)}vw`,
      "--dx": towardLeft ? "-40vw" : "40vw",
      transformOrigin: towardLeft ? "right" : "left",
      animationDelay: `${(0.95 + random() * 0.35).toFixed(2)}s`,
      height: random() < 0.3 ? "3px" : "1.5px",
    };
  });
}

/** Intro plein écran : rayons, poisson découpé en bandes, titre balayé de lumière. Rejouée par « Rejouer l'intro ». */
export function Intro() {
  const { replayKey } = useReplay();
  const { rays, streaks } = useMemo(() => {
    const random = seededRandom(replayKey + 1);
    return { rays: burstRays(random), streaks: speedStreaks(random) };
  }, [replayKey]);

  return (
    <div key={replayKey} className="intro go" aria-hidden="true">
      <svg className="burst" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice">
        <g fill="var(--color-neutral-950)" opacity=".55">
          {rays.map((points) => (
            <polygon key={points} points={points} />
          ))}
        </g>
      </svg>
      <div className="streaks">
        {streaks.map((style, index) => (
          <i key={index} style={style} />
        ))}
      </div>
      <div className="stage-i">
        <IntroArt />
        <IntroEffects />
      </div>
      <h1 className="title-i">
        <TitleSvg className="title-svg" />
      </h1>
    </div>
  );
}
