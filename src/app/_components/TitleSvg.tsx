type TitleLayer = {
  className?: string;
  fillUrl?: string;
  strokeWidth?: number;
  transform?: string;
  clipPathId?: string;
};

/**
 * Les 10 calques du titre "O.R.I.O.N" (ombre, contours, remplissages, trames)
 * ne diffèrent que par couleur/largeur de trait/décalage : un tableau de données
 * mappé plutôt que 10 `<use>` répétés à la main.
 */
const TITLE_LAYERS: TitleLayer[] = [
  { className: "fill-foreground stroke-foreground", strokeWidth: 34, transform: "translate(8 10)" },
  { className: "fill-foreground stroke-foreground", strokeWidth: 32 },
  { className: "fill-background stroke-background", strokeWidth: 24 },
  { className: "fill-accent stroke-accent", strokeWidth: 6, transform: "translate(7 9)" },
  { className: "fill-foreground stroke-foreground", strokeWidth: 10 },
  { className: "fill-background" },
  { fillUrl: "txS", clipPathId: "cS" },
  { fillUrl: "txM", clipPathId: "cM" },
  { fillUrl: "txL", clipPathId: "cL" },
  { className: "fill-foreground", clipPathId: "cLine" },
];

const LETTERS = [
  { letter: "O", x: 42 },
  { letter: "R", x: 184 },
  { letter: "I", x: 326 },
  { letter: "O", x: 468 },
  { letter: "N", x: 610 },
];

const SERIF_NOTCHES_X = [154, 296, 438, 580];

export function TitleSvg() {
  return (
    <svg className="block w-full h-auto overflow-visible" viewBox="0 95 770 250" preserveAspectRatio="xMidYMid meet" role="img" aria-label="O.R.I.O.N">
      <defs>
        <pattern id="txS" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" className="fill-background" />
          <circle cx="3" cy="3" r="1.2" className="fill-foreground" />
        </pattern>
        <pattern id="txM" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" className="fill-background" />
          <rect width="2" height="2" className="fill-foreground" />
          <rect x="2" y="2" width="2" height="2" className="fill-foreground" />
        </pattern>
        <pattern id="txL" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" className="fill-foreground" />
          <circle cx="3" cy="3" r="1.1" className="fill-background" />
        </pattern>
        <clipPath id="cS">
          <rect x="0" y="214" width="900" height="30" />
        </clipPath>
        <clipPath id="cM">
          <rect x="0" y="244" width="900" height="28" />
        </clipPath>
        <clipPath id="cL">
          <rect x="0" y="272" width="900" height="40" />
        </clipPath>
        <clipPath id="cLine">
          <rect x="0" y="209" width="900" height="5" />
        </clipPath>
        <g id="orion" className="font-sans" fontWeight={700} fontSize={280}>
          {LETTERS.map(({ letter, x }) => (
            <text key={x} x={x} y="300" textLength="104" lengthAdjust="spacingAndGlyphs">
              {letter}
            </text>
          ))}
          {SERIF_NOTCHES_X.map((x) => (
            <rect key={x} x={x} y="270" width="24" height="30" />
          ))}
        </g>
      </defs>
      <g transform="skewX(-8) translate(30 0)" strokeLinejoin="miter" strokeMiterlimit={2} strokeLinecap="square">
        {TITLE_LAYERS.map((layer, index) => (
          <use
            key={index}
            href="#orion"
            fill={layer.fillUrl ? `url(#${layer.fillUrl})` : undefined}
            className={layer.className}
            strokeWidth={layer.strokeWidth}
            transform={layer.transform}
            clipPath={layer.clipPathId ? `url(#${layer.clipPathId})` : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
