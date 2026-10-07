/**
 * Logique des salons de course (maquette locale, sans serveur de jeu).
 * Fonctions pures : aucune dépendance à React ni au DOM, l'aléatoire est injecté.
 * Confidentialité : aucun hôte ni joueur n'est stocké, seulement le nombre de places prises.
 */

export type Visibility = "public" | "semi" | "private";
export type RaceMode = "Grand Prix" | "Sprint" | "Contre-la-montre";

export type Room = {
  code: string;
  name: string;
  visibility: Visibility;
  players: number;
  maxPlayers: number;
  mode: RaceMode;
  /** Salon privé seulement. Maquette : gardé dans le navigateur, à déplacer côté serveur avec le vrai jeu. */
  password?: string;
  /** Salon créé par ce joueur : supprimé quand il le quitte vide. */
  mine?: boolean;
};

export type RandomSource = () => number;

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  public: "Salon public",
  semi: "Salon semi-privé",
  private: "Salon privé",
};

export const MAX_PLAYER_OPTIONS = [4, 6, 8, 10, 12] as const;
export const DEFAULT_MAX_PLAYERS = 8;
export const MIN_PLAYERS_TO_START = 2;
export const ROOM_CODE_LENGTH = 4;
export const MIN_ROOM_PASSWORD_LENGTH = 4;
export const MIN_NAME_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 18;

const SEED_ROOMS: readonly Room[] = [
  { code: "S100", name: "Kakigōri fraise", visibility: "public", players: 5, maxPlayers: 8, mode: "Grand Prix" },
  { code: "S137", name: "Stand Ramune", visibility: "semi", players: 2, maxPlayers: 6, mode: "Sprint" },
  { code: "S174", name: "Mochi secret", visibility: "private", players: 5, maxPlayers: 8, mode: "Grand Prix", password: "1234" },
  { code: "S211", name: "Dango Club", visibility: "public", players: 3, maxPlayers: 10, mode: "Contre-la-montre" },
  { code: "S248", name: "Cornet géant", visibility: "public", players: 8, maxPlayers: 8, mode: "Grand Prix" },
  { code: "S285", name: "Glaçons & Cie", visibility: "semi", players: 1, maxPlayers: 4, mode: "Sprint" },
  { code: "S322", name: "Taiyaki chaud", visibility: "public", players: 6, maxPlayers: 12, mode: "Contre-la-montre" },
  { code: "S359", name: "Yuzu privé", visibility: "private", players: 4, maxPlayers: 4, mode: "Grand Prix", password: "1234" },
  { code: "S396", name: "Soft cream", visibility: "public", players: 2, maxPlayers: 6, mode: "Grand Prix" },
  { code: "S433", name: "Comptoir 42", visibility: "public", players: 4, maxPlayers: 8, mode: "Grand Prix" },
  { code: "S470", name: "Bâtonnets glacés", visibility: "public", players: 1, maxPlayers: 6, mode: "Sprint" },
  { code: "S507", name: "Sirop melon", visibility: "public", players: 2, maxPlayers: 4, mode: "Sprint" },
];

export function createSeedRooms(): Room[] {
  return SEED_ROOMS.map((room) => ({ ...room }));
}

export function isFull(room: Room): boolean {
  return room.players >= room.maxPlayers;
}

export function findRoomByCode(rooms: readonly Room[], code: string): Room | undefined {
  return rooms.find((room) => room.code === code);
}

const CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Code lettre-chiffre-lettre-chiffre (ex. K7Q2), unique parmi les salons existants. */
export function generateRoomCode(rooms: readonly Room[], random: RandomSource = Math.random): string {
  const letter = () => CODE_LETTERS[Math.floor(random() * CODE_LETTERS.length)];
  const digit = () => String(Math.floor(random() * 10));
  let code: string;
  do {
    code = letter() + digit() + letter() + digit();
  } while (findRoomByCode(rooms, code));
  return code;
}

/** Garde seulement lettres majuscules et chiffres, comme on tape un code. */
export function normalizeRoomCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Message d'erreur, ou null si le surnom est valide. */
export function validateNickname(value: string): string | null {
  const nickname = value.trim();
  if (nickname.length < MIN_NAME_LENGTH) return "Choisis un surnom d'au moins 2 caractères.";
  if (!/^[\wÀ-ÿ .-]+$/.test(nickname)) return "Le surnom ne peut contenir que des lettres, chiffres, espaces, - . et _";
  return null;
}

export type JoinCodeResult = { room: Room } | { error: string };

export function resolveJoinCode(rooms: readonly Room[], rawCode: string): JoinCodeResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { error: "Entre le code du salon." };
  if (code.length < ROOM_CODE_LENGTH) return { error: "Le code compte 4 caractères (ex. K7Q2)." };
  const room = findRoomByCode(rooms, code);
  if (!room) return { error: `Aucun salon ne porte le code ${code}. Vérifie-le auprès de la personne qui t'a invité.` };
  return { room };
}

export type NewRoomInput = {
  name: string;
  visibility: Visibility;
  password: string;
  maxPlayers: number;
};

export function validateNewRoom(input: NewRoomInput): string | null {
  if (input.name.trim().length < MIN_NAME_LENGTH) return "Donne un nom d'au moins 2 caractères à ton salon.";
  if (input.visibility === "private" && input.password.length < MIN_ROOM_PASSWORD_LENGTH) {
    return "Le mot de passe compte au moins 4 caractères.";
  }
  return null;
}

export function createRoom(rooms: readonly Room[], input: NewRoomInput, random: RandomSource = Math.random): Room {
  return {
    code: generateRoomCode(rooms, random),
    name: input.name.trim(),
    visibility: input.visibility,
    players: 1,
    maxPlayers: input.maxPlayers,
    mode: "Grand Prix",
    password: input.visibility === "private" ? input.password : undefined,
    mine: true,
  };
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

export function updatePlayers(rooms: readonly Room[], code: string, delta: number): Room[] {
  return rooms.map((room) =>
    room.code === code ? { ...room, players: Math.min(room.maxPlayers, Math.max(0, room.players + delta)) } : room,
  );
}

/** Quitter un salon : une place se libère, et un salon à soi qui se vide disparaît. */
export function leaveRoom(rooms: readonly Room[], code: string): Room[] {
  return updatePlayers(rooms, code, -1).filter((room) => !(room.code === code && room.mine && room.players === 0));
}

/** « Actualiser » : chaque salon des autres gagne ou perd au plus un pilote. */
export function refreshOccupancy(rooms: readonly Room[], random: RandomSource = Math.random): Room[] {
  return rooms.map((room) =>
    room.mine
      ? room
      : { ...room, players: Math.max(1, Math.min(room.maxPlayers, room.players + Math.round(random() * 2 - 1))) },
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
