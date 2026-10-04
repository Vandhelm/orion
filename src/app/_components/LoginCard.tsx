"use client";

import { useReplay } from "./replay-context";
import { LoginForm } from "./LoginForm";

/**
 * Remonte `LoginForm` à chaque "Rejouer" : relance l'animation CSS d'apparition
 * (classe `.login`) et réinitialise au passage son état interne (message envoyé).
 */
export function LoginCard() {
  const { replayKey } = useReplay();
  return <LoginForm key={replayKey} />;
}
