/** Bande tramée rouge derrière la colonne, avec deux poissons géants (réutilise #sceneD de l'intro). */
export function Backband() {
  return (
    <div className="backband" aria-hidden="true">
      <svg viewBox="0 0 1600 500" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="bbDots" width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="4.5" r="2.2" fill="var(--color-white)" />
          </pattern>
          <pattern id="bbDotsS" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.1" fill="var(--color-neutral-950)" />
          </pattern>
          <linearGradient id="bbFade" x1="0" x2="1">
            <stop offset="0" stopColor="var(--color-white)" stopOpacity="1" />
            <stop offset=".5" stopColor="var(--color-white)" stopOpacity=".15" />
            <stop offset="1" stopColor="var(--color-white)" stopOpacity=".9" />
          </linearGradient>
          <mask id="bbMask">
            <rect width="1600" height="500" fill="url(#bbFade)" />
          </mask>
        </defs>
        <rect width="1600" height="500" fill="var(--color-red-600)" />
        <rect width="1600" height="500" fill="url(#bbDots)" mask="url(#bbMask)" />
        <g transform="translate(-180 -470) scale(1.55)">
          <use href="#sceneD" />
        </g>
        <g transform="translate(1600 -300) scale(-1.25 1.25)">
          <use href="#sceneD" />
        </g>
        <rect width="1600" height="500" fill="url(#bbDotsS)" opacity=".35" />
      </svg>
    </div>
  );
}
