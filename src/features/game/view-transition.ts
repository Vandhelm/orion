import { flushSync } from "react-dom";

/**
 * Applique `update` dans une View Transition quand le navigateur la connaît
 * (les éléments nommés se transforment d'un état à l'autre), sinon directement.
 * Renvoie la transition, ou null si on a fait sans : l'appelant joue alors son repli CSS.
 */
export function withViewTransition(update: () => void): ViewTransition | null {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof document.startViewTransition === "function" && !reducedMotion) {
    try {
      return document.startViewTransition(() => flushSync(update));
    } catch {
      // Une transition déjà en cours peut refuser la nouvelle : on applique sans animation.
    }
  }
  update();
  return null;
}

/** Nomme (ou dénomme avec "") un élément pour une View Transition. */
export function setTransitionName(element: Element | null | undefined, name = "") {
  if (element instanceof HTMLElement) element.style.viewTransitionName = name;
}

/** Repli sans View Transitions : rejoue une animation CSS d'entrée, puis retire sa classe. */
export function playEnterAnimation(element: Element | null | undefined, className = "enter") {
  if (!(element instanceof HTMLElement)) return;
  element.classList.remove(className);
  void element.offsetWidth; // force le recalcul pour que l'animation reparte de zéro
  element.classList.add(className);
  element.addEventListener("animationend", () => element.classList.remove(className), { once: true });
}
