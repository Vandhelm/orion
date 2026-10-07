import type { ReactNode } from "react";
import { FishScene, FishSceneSilhouette } from "./FishScene";

const BODY_PATH =
  "M170 520 C 230 410, 380 372, 520 420 C 580 440, 618 480, 640 520 C 618 560, 580 600, 520 620 C 380 668, 230 630, 170 520 Z";

type Band = {
  side: "l" | "r";
  /** Les bandes partent l'une après l'autre : effet de balayage du poisson. */
  delay: string;
  points: string;
  content: ReactNode;
};

const BANDS: Band[] = [
  { side: "l", delay: ".85s", points: "60,332 740,12 740,100 60,420", content: <use href="#sceneD" transform="translate(-12 0)" /> },
  {
    side: "r",
    delay: ".9s",
    points: "60,432 740,112 740,200 60,520",
    content: <use href="#sceneS" transform="translate(10 0)" className="text-illustration-1" />,
  },
  { side: "l", delay: ".95s", points: "60,532 740,212 740,300 60,620", content: <use href="#sceneD" transform="translate(-4 0)" /> },
  {
    side: "r",
    delay: "1s",
    points: "60,632 740,312 740,400 60,720",
    content: (
      <>
        <polygon points="0,660 800,284 800,372 0,748" className="fill-foreground" />
        <use href="#sceneL" transform="translate(18 0)" />
      </>
    ),
  },
  { side: "l", delay: "1.05s", points: "60,732 740,412 740,500 60,820", content: <use href="#sceneD" transform="translate(-8 0)" /> },
  {
    side: "r",
    delay: "1.1s",
    points: "60,832 740,512 740,600 60,920",
    content: <use href="#sceneS" transform="translate(12 0)" className="text-illustration-2" />,
  },
  {
    side: "l",
    delay: "1.15s",
    points: "60,932 740,612 740,700 60,1020",
    content: <use href="#sceneS" transform="translate(-14 0)" className="text-illustration-3" />,
  },
];

/**
 * Poisson en demi-teinte découpé en 7 bandes diagonales qui s'écartent pendant l'intro.
 * Ses définitions (#sceneD…) servent aussi à la bande tramée de la page.
 */
export function IntroArt() {
  return (
    <svg className="art-i" viewBox="0 160 800 760">
      <defs>
        <clipPath id="bodyClip">
          <path d={BODY_PATH} />
        </clipPath>
        <pattern id="scD" width="28" height="18" patternUnits="userSpaceOnUse">
          <path
            d="M0 18 A14 14 0 0 1 28 18 M-14 9 A14 14 0 0 1 14 9 M14 9 A14 14 0 0 1 42 9"
            fill="none"
            className="stroke-background"
            strokeWidth={2}
          />
        </pattern>
        <pattern id="scL" width="28" height="18" patternUnits="userSpaceOnUse">
          <path
            d="M0 18 A14 14 0 0 1 28 18 M-14 9 A14 14 0 0 1 14 9 M14 9 A14 14 0 0 1 42 9"
            fill="none"
            className="stroke-foreground"
            strokeWidth={2}
          />
        </pattern>
        <pattern id="dotsDark" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.6" className="fill-foreground" />
        </pattern>
        <pattern id="dotsLight" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.3" className="fill-background" />
        </pattern>

        <FishScene id="sceneD" variant="ink" />
        <FishScene id="sceneL" variant="paper" />
        <FishSceneSilhouette id="sceneS" />

        {BANDS.map((band, index) => (
          <clipPath id={`band${index}`} key={band.points}>
            <polygon points={band.points} />
          </clipPath>
        ))}
      </defs>

      {BANDS.map((band, index) => (
        <g key={band.points} className={`band ${band.side} go`} style={{ animationDelay: band.delay }}>
          <g clipPath={`url(#band${index})`}>{band.content}</g>
        </g>
      ))}
    </svg>
  );
}
