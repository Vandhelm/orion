import styles from "./Stripes.module.css";

/** Séparateur décoratif à hachures, utilisé de chaque côté des titres de fenêtre. */
export function Stripes() {
  return <div className={`${styles.stripes} grow h-full box-border`} aria-hidden="true" />;
}
