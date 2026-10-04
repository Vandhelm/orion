type FishSceneVariant = "ink" | "paper";

type FishSceneColors = {
  circlePattern: "dotsDark" | "dotsLight";
  hatchPattern: "scD" | "scL";
  bellyPattern: "dotsDark" | "dotsLight";
  body: string;
  bodyStroke: string;
  detailStroke: string;
  eyeOuter: string;
  eyeInner: string;
};

/**
 * `sceneD` (corps encre) et `sceneL` (corps papier) de la maquette ne sont que
 * l'inversion de la même géométrie entre les deux couleurs — un seul composant
 * paramétré par variante, au lieu de dupliquer tous les `path`.
 */
const FISH_SCENE_VARIANTS: Record<FishSceneVariant, FishSceneColors> = {
  ink: {
    circlePattern: "dotsDark",
    hatchPattern: "scD",
    bellyPattern: "dotsLight",
    body: "fill-foreground",
    bodyStroke: "stroke-foreground",
    detailStroke: "stroke-background",
    eyeOuter: "fill-background",
    eyeInner: "fill-foreground",
  },
  paper: {
    circlePattern: "dotsLight",
    hatchPattern: "scL",
    bellyPattern: "dotsDark",
    body: "fill-background",
    bodyStroke: "stroke-background",
    detailStroke: "stroke-foreground",
    eyeOuter: "fill-foreground",
    eyeInner: "fill-background",
  },
};

export function FishScene({ id, variant }: { id: string; variant: FishSceneVariant }) {
  const c = FISH_SCENE_VARIANTS[variant];
  return (
    <g id={id}>
      <circle cx="560" cy="350" r="150" fill={`url(#${c.circlePattern})`} className={c.bodyStroke} strokeWidth={3} />
      <path
        d="M110 712 H 690 M150 728 H 650 M200 744 H 600"
        className={c.bodyStroke}
        strokeWidth={3}
        strokeDasharray="12 6"
      />
      <path d="M360 412 C 395 335, 470 330, 525 422 Z" className={c.body} />
      <path d="M385 636 C 405 700, 465 700, 485 622 Z" className={c.body} />
      <path d="M630 520 L 735 430 C 712 488, 712 552, 735 610 Z" className={c.body} />
      <path
        d="M170 520 C 230 410, 380 372, 520 420 C 580 440, 618 480, 640 520 C 618 560, 580 600, 520 620 C 380 668, 230 630, 170 520 Z"
        className={c.body}
      />
      <rect x="300" y="390" width="345" height="170" fill={`url(#${c.hatchPattern})`} clipPath="url(#bodyClip)" />
      <rect x="170" y="565" width="480" height="80" fill={`url(#${c.bellyPattern})`} clipPath="url(#bodyClip)" />
      <g fill="none" className={c.detailStroke} strokeLinecap="square">
        <path d="M272 452 C 302 490, 302 552, 272 590" strokeWidth={6} />
        <path d="M172 520 L 205 530" strokeWidth={4} />
        <path d="M400 405 L 418 352 M440 410 L 452 342 M480 414 L 486 352" strokeWidth={3} />
        <path d="M420 640 L 430 680 M450 636 L 455 676" strokeWidth={3} />
        <path d="M660 520 L 722 462 M660 520 L 712 520 M660 520 L 722 578" strokeWidth={3} />
        <path
          d="M300 540 C 335 552, 356 590, 344 622 C 318 604, 302 578, 300 540 Z"
          strokeWidth={3}
        />
      </g>
      <rect x="210" y="488" width="28" height="28" className={c.eyeOuter} />
      <rect x="222" y="496" width="12" height="12" className={c.eyeInner} />
    </g>
  );
}

/** `sceneS` : silhouette compacte déjà paramétrée par `currentColor` dans la maquette. */
export function FishSceneSilhouette({ id }: { id: string }) {
  return (
    <g id={id}>
      <circle cx="560" cy="350" r="150" fill="none" stroke="currentColor" strokeWidth={3} />
      <path d="M360 412 C 395 335, 470 330, 525 422 Z" fill="currentColor" />
      <path d="M385 636 C 405 700, 465 700, 485 622 Z" fill="currentColor" />
      <path d="M630 520 L 735 430 C 712 488, 712 552, 735 610 Z" fill="currentColor" />
      <path
        d="M170 520 C 230 410, 380 372, 520 420 C 580 440, 618 480, 640 520 C 618 560, 580 600, 520 620 C 380 668, 230 630, 170 520 Z"
        fill="currentColor"
      />
      <rect x="210" y="488" width="28" height="28" className="fill-foreground" />
      <rect x="222" y="496" width="8" height="8" className="fill-background" />
    </g>
  );
}
