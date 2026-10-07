const SPARK_PATH = "M0 -14 L3 -3 L14 0 L3 3 L0 14 L-3 3 L-14 0 L-3 -3 Z";

/** Une lame de lumière par coupe du poisson, décalées de 100 unités et de 50 ms. */
const GLINTS = [0, 1, 2, 3, 4, 5].map((i) => ({
  y1: (595.4 + i * 100).toFixed(1),
  y2: (-63.4 + i * 100).toFixed(1),
  delay: `${(0.5 + i * 0.05).toFixed(2)}s`,
}));

const SPARKS = [
  { x: 590, y: 240, scale: 1.6, fill: "var(--color-red-600)", delay: "0.60s" },
  { x: 250, y: 430, scale: 1.1, fill: "var(--color-neutral-950)", delay: "0.75s" },
  { x: 700, y: 330, scale: 1.3, fill: "var(--color-neutral-950)", delay: "0.85s" },
  { x: 470, y: 700, scale: 1.2, fill: "var(--color-red-600)", delay: "0.80s" },
  { x: 140, y: 610, scale: 1, fill: "var(--color-neutral-950)", delay: "0.68s" },
];

/** Reflets qui glissent le long des coupes et étincelles de l'intro. */
export function IntroEffects() {
  return (
    <svg className="fx" viewBox="0 160 800 760" aria-hidden="true">
      <g className="glints" strokeLinecap="round">
        {[
          { stroke: "var(--color-neutral-950)", width: 7 },
          { stroke: "var(--color-white)", width: 3 },
        ].map(({ stroke, width }) => (
          <g key={width} stroke={stroke} strokeWidth={width}>
            {GLINTS.map((glint) => (
              <line key={glint.y1} x1="-300" y1={glint.y1} x2="1100" y2={glint.y2} style={{ animationDelay: glint.delay }} />
            ))}
          </g>
        ))}
      </g>
      {SPARKS.map((spark) => (
        <g key={`${spark.x}-${spark.y}`} transform={`translate(${spark.x} ${spark.y}) scale(${spark.scale})`}>
          <path
            className="spark"
            d={SPARK_PATH}
            fill={spark.fill}
            stroke="var(--color-white)"
            strokeWidth="1.5"
            style={{ animationDelay: spark.delay }}
          />
        </g>
      ))}
    </svg>
  );
}
