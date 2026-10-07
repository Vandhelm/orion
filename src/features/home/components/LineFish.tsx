/** Rangées d'écailles (arcs) du poisson au trait, de haut en bas. */
const SCALE_ROWS = [
  "M330 450 a22 22 0 0 1 44 0 M374 450 a22 22 0 0 1 44 0 M418 450 a22 22 0 0 1 44 0 M462 450 a22 22 0 0 1 44 0 M506 456 a22 22 0 0 1 44 0",
  "M308 494 a22 22 0 0 1 44 0 M352 494 a22 22 0 0 1 44 0 M396 494 a22 22 0 0 1 44 0 M440 494 a22 22 0 0 1 44 0 M484 494 a22 22 0 0 1 44 0 M528 494 a22 22 0 0 1 44 0",
  "M330 538 a22 22 0 0 1 44 0 M374 538 a22 22 0 0 1 44 0 M418 538 a22 22 0 0 1 44 0 M462 538 a22 22 0 0 1 44 0 M506 538 a22 22 0 0 1 44 0 M550 538 a22 22 0 0 1 44 0",
  "M352 582 a22 22 0 0 1 44 0 M396 582 a22 22 0 0 1 44 0 M440 582 a22 22 0 0 1 44 0 M484 582 a22 22 0 0 1 44 0",
];

/**
 * Poisson au trait du héros et du soleil. Ses couleurs viennent des variables
 * --blush (corps), --red (nageoires) et --blue (trait) définies dans orion.css.
 */
export function LineFish({ className }: { className: string }) {
  return (
    <svg viewBox="150 330 620 360" className={className} aria-hidden="true">
      <path
        d="M170 520 C 230 410, 380 372, 520 420 C 580 440, 618 480, 640 520 C 618 560, 580 600, 520 620 C 380 668, 230 630, 170 520 Z"
        fill="var(--blush)"
        stroke="var(--blue)"
        strokeWidth="7"
      />
      <path d="M630 520 L 735 430 C 712 488, 712 552, 735 610 Z" fill="var(--red)" stroke="var(--blue)" strokeWidth="7" strokeLinejoin="round" />
      <path d="M360 412 C 395 335, 470 330, 525 422" fill="var(--red)" stroke="var(--blue)" strokeWidth="7" />
      <path d="M385 636 C 405 700, 465 700, 485 622" fill="var(--red)" stroke="var(--blue)" strokeWidth="7" />
      <g fill="none" stroke="var(--blue)" strokeWidth="4" strokeLinecap="round">
        <path d="M272 452 C 302 490, 302 552, 272 590" strokeWidth="7" />
        {SCALE_ROWS.map((d) => (
          <path key={d} d={d} />
        ))}
        <path d="M660 520 L 712 476 M660 520 L 712 520 M660 520 L 712 564" />
      </g>
      <circle cx="225" cy="500" r="17" fill="var(--color-white)" stroke="var(--blue)" strokeWidth="6" />
      <circle cx="229" cy="500" r="8" fill="var(--red)" />
      <path d="M175 528 L 205 532" stroke="var(--blue)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
