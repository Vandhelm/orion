"use client";

import { AuthForm } from "@/features/auth/components/AuthForm";
import styles from "../page.module.css";
import { useReplay } from "./replay-context";

/**
 * Remonte le formulaire à chaque "Rejouer" : relance l'animation CSS d'apparition
 * (classe `.login`) et réinitialise au passage son état interne.
 */
export function LoginCard() {
  const { replayKey } = useReplay();
  return <AuthForm key={replayKey} mode="sign-in" className={styles.login} />;
}
