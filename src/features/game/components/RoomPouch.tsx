import { useId } from "react";
import { isFull, type Room } from "../rooms";

const ACCENT_CLASSES = ["poch--1", "poch--2", "poch--3", "poch--4"] as const;
/** Au-delà, le nom est resserré pour tenir dans la largeur de la pochette. */
const NAME_FIT_LENGTH = 14;
const NAME_MAX_WIDTH = 250;

/** Couleur du liseré, stable pour un même salon (dérivée de son code). */
function accentClass(room: Room): string {
  const sum = [...room.id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return ACCENT_CLASSES[sum % ACCENT_CLASSES.length];
}

/** Rayons du soleil : 16 triangles autour de (150, 255). */
const SUN_RAYS =
  "M150 255 L139.7 137.4 A118 118 0 0 1 160.3 137.4Z M150 255 L188.4 143.4 A118 118 0 0 1 201.7 148.9Z M150 255 L227.0 165.6 A118 118 0 0 1 239.4 178.0Z M150 255 L256.5 204.2 A118 118 0 0 1 261.2 215.6Z M150 255 L267.5 243.7 A118 118 0 0 1 267.5 266.3Z M150 255 L261.7 292.9 A118 118 0 0 1 255.8 307.2Z M150 255 L239.7 331.6 A118 118 0 0 1 226.6 344.7Z M150 255 L201.3 361.3 A118 118 0 0 1 188.9 366.4Z M150 255 L160.8 372.5 A118 118 0 0 1 139.2 372.5Z M150 255 L111.6 366.6 A118 118 0 0 1 98.3 361.1Z M150 255 L72.6 344.1 A118 118 0 0 1 60.9 332.4Z M150 255 L43.5 305.8 A118 118 0 0 1 38.8 294.4Z M150 255 L32.5 266.3 A118 118 0 0 1 32.5 243.7Z M150 255 L38.3 217.1 A118 118 0 0 1 44.2 202.8Z M150 255 L60.3 178.4 A118 118 0 0 1 73.4 165.3Z M150 255 L98.7 148.7 A118 118 0 0 1 111.1 143.6Z";

type RoomPouchProps = { room: Room; onJoin: () => void };

/** Pochette d'un salon public : nom découpé dans le carton, soleil pour rejoindre, paramètres en bas. */
export function RoomPouch({ room, onJoin }: RoomPouchProps) {
  // Les ids de useId contiennent des caractères mal acceptés dans url(#…).
  const id = `poch${useId().replace(/[^\w-]/g, "")}`;
  const maskId = `${id}-mask`;
  const wavesId = `${id}-waves`;
  const full = isFull(room);
  const params: [string, string][] = [
    ["LANGUE", room.language.toUpperCase()],
    ["PILOTES", `${room.players} / ${room.maxPlayers}`],
    ["BOTS", room.bots ? "Oui" : "Non"],
  ];

  return (
    <li className={`poch ${accentClass(room)}`}>
      <div className="poch__wrap">
        <svg viewBox="0 0 300 660" role="img" aria-label={`${room.name}, ${room.mode}`}>
          <defs>
            {/* Masque : blanc = carton visible, noir = découpe (le carton blanc apparaît dessous). */}
            <mask id={maskId}>
              <rect width="300" height="660" fill="white" />
              <text
                x="150"
                y="64"
                textAnchor="middle"
                fontFamily="Georgia, serif"
                fontSize="24"
                fontWeight="bold"
                fill="black"
                {...(room.name.length > NAME_FIT_LENGTH && { textLength: NAME_MAX_WIDTH, lengthAdjust: "spacingAndGlyphs" })}
              >
                {room.name}
              </text>
              <text x="150" y="92" textAnchor="middle" fontFamily="'Courier New', monospace" fontSize="13" fontWeight="bold" letterSpacing="3" fill="black">
                {room.mode.toUpperCase()}
              </text>
              <rect x="10" y="10" width="280" height="640" fill={`url(#${wavesId})`} opacity="0.15" />
              <circle cx="150" cy="0" r="22" fill="black" />
            </mask>
            <pattern id={wavesId} width="100" height="50" patternUnits="userSpaceOnUse" x="10" y="10">
              <image width="100" height="50" preserveAspectRatio="none" href="/kiosque/vagues.png" />
            </pattern>
          </defs>
          <rect width="300" height="660" rx="8" className="poch__card" mask={`url(#${maskId})`} />
          <rect x="10" y="10" width="280" height="640" rx="4" className="poch__edge" mask={`url(#${maskId})`} />
          <g aria-hidden="true">
            <rect x="22" y="440" width="256" height="200" rx="4" className="poch__panel" />
            <line x1="40" y1="462" x2="125" y2="462" className="stroke-background" strokeWidth="1.2" />
            <line x1="175" y1="462" x2="260" y2="462" className="stroke-background" strokeWidth="1.2" />
            <Fish />
            <text x="150" y="492" textAnchor="middle" className="poch__title">
              PARAMÈTRES
            </text>
          </g>
          <g>
            {params.map(([label, value], row) => {
              const y = 539 + row * 30;
              return (
                <g key={label}>
                  <line x1="40" y1={y - 6} x2="260" y2={y - 6} className="poch__dots" />
                  <text x="40" y={y} className="poch__label">
                    {label}
                  </text>
                  <text x="260" y={y} textAnchor="end" className="poch__value">
                    {value}
                  </text>
                </g>
              );
            })}
          </g>
          <g className="poch__accent" aria-hidden="true">
            <circle cx="130" cy="625" r="2.5" />
            <circle cx="150" cy="625" r="3.5" />
            <circle cx="170" cy="625" r="2.5" />
          </g>
        </svg>
        <button type="button" className="poch__join" disabled={full} aria-label={full ? `${room.name} est complet` : `Rejoindre ${room.name}`} onClick={onJoin}>
          <Sun label={full ? "COMPLET" : "REJOINDRE"} />
        </button>
      </div>
    </li>
  );
}

function Fish() {
  return (
    <>
      <g className="poch__paper">
        <ellipse cx="153" cy="462" rx="11" ry="6.5" />
        <path d="M143 462 L134 455 Q136 462 134 469 Z" />
        <path d="M150 456 Q153 451 158 456 Z" />
      </g>
      <circle cx="159" cy="460.5" r="1.3" className="poch__ink" />
      <path d="M156 457 Q154 462 156 467" fill="none" className="stroke-foreground" strokeWidth=".8" />
    </>
  );
}

/** Le soleil, dessiné dans son propre cadre (236 × 236 autour de son centre). */
function Sun({ label }: { label: string }) {
  return (
    <svg viewBox="32 137 236 236" aria-hidden="true">
      <path className="rays poch__paper" d={SUN_RAYS} />
      <circle cx="150" cy="255" r="60" className="poch__ink" />
      <circle cx="150" cy="255" r="60" className="poch__edge" />
      <circle className="disc poch__paper" cx="150" cy="255" r="52" />
      <text x="150" y="252" textAnchor="middle" className="poch__jp">
        参加
      </text>
      <text x="150" y="276" textAnchor="middle" textLength="80" lengthAdjust="spacingAndGlyphs" className="poch__cta">
        {label}
      </text>
    </svg>
  );
}
