"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "../page.module.css";

const MIN_LOGIN_SCALE = 1;
const MAX_LOGIN_SCALE = 1.5;
// Dimensions de référence de la carte de connexion, pour calculer de combien
// l'agrandir sur les grands écrans sans dépasser la scène.
const LOGIN_REFERENCE_HEIGHT = 640;
const LOGIN_REFERENCE_WIDTH = 470;

type LoginScaleStyle = CSSProperties & { "--k": string };

function computeLoginScale(stage: HTMLElement) {
  const rect = stage.getBoundingClientRect();
  const fit = Math.min(MAX_LOGIN_SCALE, rect.height / LOGIN_REFERENCE_HEIGHT, rect.width / LOGIN_REFERENCE_WIDTH);
  return Math.max(MIN_LOGIN_SCALE, fit);
}

type StageSectionProps = {
  /** Illustration SVG statique (contenu serveur), passée telle quelle. */
  illustration: ReactNode;
  /** Carte de connexion, mise à l'échelle dans `.login-scale`. */
  children: ReactNode;
};

/** Agrandit la carte de connexion selon la taille de la scène (grands écrans). */
export function StageSection({ illustration, children }: StageSectionProps) {
  const stageRef = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(MIN_LOGIN_SCALE);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const fit = () => setScale(computeLoginScale(stage));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const loginScaleStyle: LoginScaleStyle = { "--k": scale.toFixed(3) };

  return (
    <section ref={stageRef} className={styles.stage}>
      {illustration}
      <div className={styles.loginScale} style={loginScaleStyle}>
        {children}
      </div>
    </section>
  );
}
