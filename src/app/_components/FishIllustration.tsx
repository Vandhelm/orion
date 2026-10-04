import styles from "../page.module.css";
import { FishScene, FishSceneSilhouette } from "./FishScene";
import { FishBands } from "./FishBands";

const BAND_CLIP_PATHS: Record<string, string> = {
  b0: "60,332 740,12 740,100 60,420",
  b1: "60,432 740,112 740,200 60,520",
  b2: "60,532 740,212 740,300 60,620",
  b3: "60,632 740,312 740,400 60,720",
  b4: "60,732 740,412 740,500 60,820",
  b5: "60,832 740,512 740,600 60,920",
  b6: "60,932 740,612 740,700 60,1020",
};

/** Illustration SVG statique du poisson, animée par `FishBands` (seule partie interactive). */
export function FishIllustration() {
  return (
    <svg
      className={styles.art}
      viewBox="0 160 800 760"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      data-role="img"
      aria-label="Poisson rétro en demi-teinte, découpé en bandes diagonales"
    >
      <defs>
        <clipPath id="bodyClip">
          <path d="M170 520 C 230 410, 380 372, 520 420 C 580 440, 618 480, 640 520 C 618 560, 580 600, 520 620 C 380 668, 230 630, 170 520 Z" />
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

        {Object.entries(BAND_CLIP_PATHS).map(([id, points]) => (
          <clipPath id={id} key={id}>
            <polygon points={points} />
          </clipPath>
        ))}
      </defs>

      <FishBands />
    </svg>
  );
}
