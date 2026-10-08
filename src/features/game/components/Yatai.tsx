import type { ReactNode, Ref } from "react";

type YataiProps = {
  ref?: Ref<HTMLDivElement>;
  /** Pans du noren, sous le toit (le formulaire du code). */
  noren: ReactNode;
  /** Contenu de l'ouverture : le kiosque grandit avec lui. */
  children: ReactNode;
};

/** Le kiosque dessiné : toit, lanterne, noren, ouverture, comptoir et caisse. Décor seulement. */
export function Yatai({ ref, noren, children }: YataiProps) {
  return (
    <div ref={ref} className="yatai">
      <div className="yatai__rays" aria-hidden="true">
        <div className="k-rays__dots" />
        <div className="k-rays__lines" />
      </div>
      <Roof />
      {noren}
      <div className="yatai__shoji yatai__shoji--out" aria-hidden="true" />
      <Lantern />
      <div className="yatai__body">
        <i className="yatai__post" />
        <div className="yatai__opening">
          <div className="yatai__row">
            <div className="yatai__window">{children}</div>
            <div className="yatai__side" aria-hidden="true">
              <div className="yatai__shoji yatai__shoji--in" />
              <Bowls />
            </div>
          </div>
        </div>
        <i className="yatai__post" />
      </div>
      <div className="yatai__counter" aria-hidden="true" />
      <Cart />
      <div className="yatai__ground" aria-hidden="true" />
    </div>
  );
}

function Roof() {
  return (
    <svg className="yatai__roof" viewBox="0 0 640 65" aria-hidden="true">
      <defs>
        <pattern id="yatai-planks" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <rect width="8" height="8" className="fill-foreground" />
          <line x1="0" y1="4" x2="8" y2="4" className="stroke-background" strokeWidth="1.4" />
        </pattern>
      </defs>
      <g fill="none" className="stroke-background" strokeWidth="3" strokeLinejoin="round">
        <path d="M80 18 H560 L634 56 H6 Z" fill="url(#yatai-planks)" />
        <path d="M80 18 L6 56" />
        <line x1="70" y1="12" x2="570" y2="12" strokeWidth="5" />
        <rect x="2" y="56" width="636" height="8" className="fill-background" />
      </g>
    </svg>
  );
}

function Lantern() {
  return (
    <svg className="yatai__lantern" viewBox="0 0 56 130" aria-hidden="true">
      <g className="stroke-background" strokeWidth="3">
        <line x1="28" y1="0" x2="28" y2="8" strokeWidth="2" />
        <rect x="8" y="6" width="40" height="10" className="fill-foreground" />
        <rect x="1.5" y="14" width="53" height="106" rx="24" className="fill-background" />
        <rect x="8" y="118" width="40" height="10" className="fill-foreground" />
      </g>
      <path
        d="M5 26H51M3 35H53M2 44H54M2 53H54M2 62H54M2 71H54M2 80H54M2 89H54M2 98H54M3 107H53M5 115H51"
        className="stroke-foreground"
        strokeWidth="1.2"
      />
      <g className="fill-foreground stroke-background" fontWeight="800" fontSize="31" textAnchor="middle" strokeWidth="5" paintOrder="stroke">
        <text x="28" y="60">そ</text>
        <text x="28" y="98">ば</text>
      </g>
    </svg>
  );
}

function Bowls() {
  return (
    <div className="yatai__bowls">
      <svg viewBox="0 0 80 26">
        <g className="fill-background stroke-background" strokeWidth="2">
          <path d="M2 25 a16 11 0 0 1 32 0 Z" />
          <path d="M44 25 a16 11 0 0 1 32 0 Z" />
        </g>
        <path d="M12 11 q-4 -4 0 -8 M24 11 q-4 -4 0 -8 M60 11 q-4 -4 0 -8" fill="none" className="stroke-background" strokeWidth="2" />
      </svg>
    </div>
  );
}

function Cart() {
  return (
    <div className="yatai__cart" aria-hidden="true">
      <svg className="yatai__tiles">
        <defs>
          <pattern id="yatai-tiles" width="20" height="16" patternUnits="userSpaceOnUse">
            <rect width="20" height="16" className="fill-foreground" />
            <rect x="3" y="3" width="14" height="10" fill="none" className="stroke-background" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#yatai-tiles)" />
      </svg>
      <i className="yatai__handles" />
      <i className="yatai__wheel yatai__wheel--l" />
      <i className="yatai__wheel yatai__wheel--r" />
    </div>
  );
}
