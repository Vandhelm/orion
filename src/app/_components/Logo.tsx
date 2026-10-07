type LogoProps = {
  width: number;
  height: number;
};

/** Petit logo "poisson" de la menubar, réutilisé en plus grand dans l'en-tête du formulaire de connexion. */
export function Logo({ width, height }: LogoProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 22 14" aria-hidden="true">
      <path
        d="M1 7 C 4 1, 11 0, 15 4 L 21 1 L 21 13 L 15 10 C 11 14, 4 13, 1 7 Z"
        className="fill-foreground"
      />
      <rect x="5" y="5" width="2" height="2" className="fill-background" />
    </svg>
  );
}
