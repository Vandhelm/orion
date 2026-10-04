"use client";

import type { ReactNode } from "react";
import styles from "../page.module.css";
import { useReplay } from "./replay-context";

type BandSide = "l" | "r";

type Band = {
  side: BandSide;
  /** Délai avant le déclenchement de la bande, pour l'effet de balayage progressif du poisson. */
  animationDelay: string;
  clipPathId: string;
  content: ReactNode;
};

const BANDS: Band[] = [
  {
    side: "l",
    animationDelay: ".6s",
    clipPathId: "b0",
    content: <use href="#sceneD" transform="translate(-12 0)" />,
  },
  {
    side: "r",
    animationDelay: ".68s",
    clipPathId: "b1",
    content: <use href="#sceneS" transform="translate(10 0)" className="text-illustration-1" />,
  },
  {
    side: "l",
    animationDelay: ".76s",
    clipPathId: "b2",
    content: <use href="#sceneD" transform="translate(-4 0)" />,
  },
  {
    side: "r",
    animationDelay: ".84s",
    clipPathId: "b3",
    content: (
      <>
        <polygon points="0,660 800,284 800,372 0,748" className="fill-foreground" />
        <use href="#sceneL" transform="translate(18 0)" />
      </>
    ),
  },
  {
    side: "l",
    animationDelay: ".92s",
    clipPathId: "b4",
    content: <use href="#sceneD" transform="translate(-8 0)" />,
  },
  {
    side: "r",
    animationDelay: "1s",
    clipPathId: "b5",
    content: <use href="#sceneS" transform="translate(12 0)" className="text-illustration-2" />,
  },
  {
    side: "l",
    animationDelay: "1.08s",
    clipPathId: "b6",
    content: <use href="#sceneS" transform="translate(-14 0)" className="text-illustration-3" />,
  },
];

/**
 * Les 7 bandes diagonales qui balaient l'illustration à l'affichage : un tableau
 * de données mappé plutôt que 7 blocs JSX quasi identiques. `replayKey` force
 * leur remontage (et donc le redémarrage des animations CSS) au clic sur "Rejouer".
 */
export function FishBands() {
  const { replayKey } = useReplay();

  return BANDS.map((band, index) => (
    <g
      key={`${replayKey}-${index}`}
      className={band.side === "l" ? styles.bandL : styles.bandR}
      style={{ animationDelay: band.animationDelay }}
    >
      <g clipPath={`url(#${band.clipPathId})`}>{band.content}</g>
    </g>
  ));
}
