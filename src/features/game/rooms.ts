/**
 * Règles des salons de course. Fonctions pures : aucune dépendance à React, au DOM ni à la base,
 * utilisées à la fois par l'interface et par le serveur ; l'aléatoire est injecté.
 * Confidentialité : aucun hôte ni joueur n'est stocké, seulement le nombre de places prises.
 *
 * Visibilité d'un salon :
 * - public : affiché dans la liste, n'importe qui peut entrer ;
 * - semi-public : pas dans la liste, on entre avec le code, le lien ou le QR code ;
 * - private : on n'entre qu'avec un lien d'invitation, valable une seule fois.
 */

export const VISIBILITIES = ["public", "semi-public", "private"] as const;
export type Visibility = (typeof VISIBILITIES)[number];
export type RaceMode = "Grand Prix" | "Sprint" | "Contre-la-montre";

/** Salon tel que l'interface le voit. */
export type Room = {
  id: string;
  name: string;
  visibility: Visibility;
  players: number;
  maxPlayers: number;
  mode: string;
};

export type RandomSource = () => number;

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  public: "Salon public",
  "semi-public": "Salon semi-public",
  private: "Salon privé",
};

export const MAX_PLAYER_OPTIONS = [4, 6, 8, 10, 12] as const;
export const DEFAULT_MAX_PLAYERS = 8;
export const MIN_PLAYERS_TO_START = 2;
export const ROOM_CODE_LENGTH = 4;
export const ROOM_NAME_MAX_LENGTH = 28;
export const MIN_NAME_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 18;

export function isFull(room: Room): boolean {
  return room.players >= room.maxPlayers;
}

export function isVisibility(value: unknown): value is Visibility {
  return VISIBILITIES.includes(value as Visibility);
}

const CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Code lettre-chiffre-lettre-chiffre (ex. K7Q2). L'unicité est garantie par la base (clé primaire). */
export function randomRoomCode(random: RandomSource = Math.random): string {
  const letter = () => CODE_LETTERS[Math.floor(random() * CODE_LETTERS.length)];
  const digit = () => String(Math.floor(random() * 10));
  return letter() + digit() + letter() + digit();
}

/** Garde seulement lettres majuscules et chiffres, comme on tape un code. */
export function normalizeRoomCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Message d'erreur, ou null si le surnom est valide. */
export function validateNickname(value: string): string | null {
  const nickname = value.trim();
  if (nickname.length < MIN_NAME_LENGTH) return "Choisis un surnom d'au moins 2 caractères.";
  if (nickname.length > NICKNAME_MAX_LENGTH) return `Le surnom compte au plus ${NICKNAME_MAX_LENGTH} caractères.`;
  if (!/^[\wÀ-ÿ .-]+$/.test(nickname)) return "Le surnom ne peut contenir que des lettres, chiffres, espaces, - . et _";
  return null;
}

/** Vérifie la forme d'un code saisi (son existence est vérifiée par le serveur). */
export function validateJoinCode(rawCode: string): { code: string } | { error: string } {
  const code = normalizeRoomCode(rawCode.trim());
  if (!code) return { error: "Entre le code du salon." };
  if (code.length !== ROOM_CODE_LENGTH) return { error: "Le code compte 4 caractères (ex. K7Q2)." };
  return { code };
}

export function unknownCodeMessage(code: string): string {
  return `Aucun salon ne porte le code ${code}. Vérifie-le auprès de la personne qui t'a invité.`;
}

export const PRIVATE_ROOM_MESSAGE = "Ce salon est privé : on y entre seulement avec un lien d'invitation.";

/** Un salon privé ne s'ouvre pas avec son code : seulement avec une invitation. */
export function canJoinWithCode(room: Pick<Room, "visibility">): boolean {
  return room.visibility !== "private";
}

/* ---------- Liens à partager ---------- */

export const ROOM_LINK_PARAM = "salon";
export const INVITATION_LINK_PARAM = "invitation";

/** Lien vers un salon public ou semi-public (même effet que taper son code). */
export function roomLink(origin: string, code: string): string {
  return `${origin}/?${ROOM_LINK_PARAM}=${encodeURIComponent(code)}`;
}

/** Lien d'invitation à usage unique vers un salon privé. */
export function invitationLink(origin: string, token: string): string {
  return `${origin}/?${INVITATION_LINK_PARAM}=${encodeURIComponent(token)}`;
}

export type NewRoomInput = {
  name: string;
  visibility: Visibility;
  maxPlayers: number;
};

/** Message d'erreur, ou null si le salon peut être créé. Vérifié côté navigateur et côté serveur. */
export function validateNewRoom(input: NewRoomInput): string | null {
  const name = input.name.trim();
  if (name.length < MIN_NAME_LENGTH) return "Donne un nom d'au moins 2 caractères à ton salon.";
  if (name.length > ROOM_NAME_MAX_LENGTH) return `Le nom compte au plus ${ROOM_NAME_MAX_LENGTH} caractères.`;
  if (!isVisibility(input.visibility)) return "Choisis qui peut entrer.";
  if (!MAX_PLAYER_OPTIONS.includes(input.maxPlayers as (typeof MAX_PLAYER_OPTIONS)[number])) return "Nombre de places invalide.";
  return null;
}

/** Partie rapide : le salon public ouvert le plus rempli, pour que la course démarre vite. */
export function pickQuickPlayRoom(rooms: readonly Room[]): Room | null {
  const open = rooms.filter((room) => room.visibility === "public" && !isFull(room));
  if (open.length === 0) return null;
  return open.reduce((best, room) =>
    room.players / room.maxPlayers > best.players / best.maxPlayers ? room : best,
  );
}

export function listOpenPublicRooms(rooms: readonly Room[], query: string): Room[] {
  const search = query.trim().toLowerCase();
  return rooms.filter(
    (room) => room.visibility === "public" && !isFull(room) && (!search || room.name.toLowerCase().includes(search)),
  );
}

export type RaceInfo = { laps: number; currentLap: number };

/** Infos de course de démonstration, stables pour un même salon (dérivées du nom). */
export function raceInfo(room: Room): RaceInfo {
  const seed = room.name.length;
  const laps = [3, 5, 7, 10][seed % 4];
  return { laps, currentLap: room.players > 3 ? (seed % laps) + 1 : 0 };
}

/* ---------- Grille de la page Salons ---------- */

export const CELLS_PER_PAGE = 16;

export type RoomPage = { shown: Room[]; page: number; pageCount: number; perPage: number };

/** Au-delà de 16 salons, une case « suite » prend la dernière place de chaque page. */
export function paginateRooms(list: readonly Room[], requestedPage: number): RoomPage {
  const pageCount = list.length <= CELLS_PER_PAGE ? 1 : Math.ceil(list.length / (CELLS_PER_PAGE - 1));
  const page = requestedPage >= pageCount ? 0 : requestedPage;
  const perPage = pageCount > 1 ? CELLS_PER_PAGE - 1 : CELLS_PER_PAGE;
  return { shown: list.slice(page * perPage, page * perPage + perPage), page, pageCount, perPage };
}

export type GridArea = { gridRow: string; gridColumn: string };
export type RoomGridLayout = { gridTemplateRows: string; center: GridArea; slots: GridArea[] };

const GRID_SPAN = 12;

function area(rowStart: number, rowEnd: number, columnStart: number, columnEnd: number): GridArea {
  return { gridRow: `${rowStart} / ${rowEnd}`, gridColumn: `${columnStart} / ${columnEnd}` };
}

/**
 * Répartit les cases autour du détail central (grille de 12 colonnes) :
 * haut, droite, bas, gauche à tour de rôle, 4 cases max par côté,
 * puis les places sont données dans le sens horaire.
 */
export function layoutRoomGrid(cellCount: number): RoomGridLayout {
  const perSide = [0, 0, 0, 0];
  for (let i = 0; i < cellCount; i++) perSide[i % 4]++;
  const [top, right, bottom, left] = perSide;

  const topRow = top ? 1 : 0;
  const middleStart = topRow + 1;
  const bottomRow = middleStart + GRID_SPAN;
  const slots: GridArea[] = [];

  for (let i = 0; i < top; i++) {
    slots.push(area(topRow, topRow + 1, 1 + (i * GRID_SPAN) / top, 1 + ((i + 1) * GRID_SPAN) / top));
  }
  for (let i = 0; i < right; i++) {
    slots.push(area(middleStart + (i * GRID_SPAN) / right, middleStart + ((i + 1) * GRID_SPAN) / right, 10, 13));
  }
  for (let i = bottom - 1; i >= 0; i--) {
    slots.push(area(bottomRow, bottomRow + 1, 1 + (i * GRID_SPAN) / bottom, 1 + ((i + 1) * GRID_SPAN) / bottom));
  }
  for (let i = left - 1; i >= 0; i--) {
    slots.push(area(middleStart + (i * GRID_SPAN) / left, middleStart + ((i + 1) * GRID_SPAN) / left, 1, 4));
  }

  return {
    gridTemplateRows: `${top ? "minmax(170px,auto) " : ""}repeat(12,minmax(40px,auto))${bottom ? " minmax(170px,auto)" : ""}`,
    center: area(middleStart, bottomRow, left ? 4 : 1, right ? 10 : 13),
    slots,
  };
}
