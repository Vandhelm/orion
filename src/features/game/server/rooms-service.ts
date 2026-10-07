import "server-only";
import { createHash, randomBytes } from "node:crypto";
import {
  PRIVATE_ROOM_MESSAGE,
  canJoinWithCode,
  isFull,
  pickQuickPlayRoom,
  randomRoomCode,
  unknownCodeMessage,
  validateJoinCode,
  validateNewRoom,
  type NewRoomInput,
  type Room,
} from "../rooms";
import {
  findRoom,
  insertInvite,
  insertRoom,
  listOpenPublicRooms,
  redeemInvite as redeemInviteRow,
  releaseSeat,
  takeSeat,
} from "./rooms-repository";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const fail = <T>(error: string): Result<T> => ({ ok: false, error });

const MAX_CODE_ATTEMPTS = 5;
const QUICK_PLAY_ATTEMPTS = 3;
const INVITE_TOKEN_BYTES = 32;
const INVITE_LIFETIME_MS = 24 * 60 * 60 * 1000;
const INVALID_INVITE_MESSAGE = "Ce lien d'invitation a déjà servi ou a expiré. Demande-en un nouveau.";

/** On ne stocke que l'empreinte : une fuite de la base ne donne aucun lien utilisable. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export { listOpenPublicRooms as listRooms, releaseSeat as leaveRoom };

/** Salon trouvé par son code, pour le rejoindre : un salon privé ne s'ouvre pas ainsi. */
export async function findRoomByCode(rawCode: string): Promise<Result<Room>> {
  const check = validateJoinCode(rawCode);
  if ("error" in check) return fail(check.error);
  const found = await findRoom(check.code);
  if (!found) return fail(unknownCodeMessage(check.code));
  if (!canJoinWithCode(found)) return fail(PRIVATE_ROOM_MESSAGE);
  return ok(found);
}

/** État d'un salon pour ceux qui y sont déjà (salle d'attente). */
export async function roomState(id: string): Promise<Result<Room>> {
  const found = await findRoom(id);
  return found ? ok(found) : fail("Ce salon n'existe plus.");
}

/** Rejoindre avec le code (liste, champ « Tu as un code ? », lien ou QR code). */
export async function joinRoom(id: string): Promise<Result<Room>> {
  const found = await findRoom(id);
  if (!found) return fail("Ce salon n'existe plus.");
  if (!canJoinWithCode(found)) return fail(PRIVATE_ROOM_MESSAGE);
  if (isFull(found)) return fail(`« ${found.name} » est complet.`);
  const seated = await takeSeat(id);
  return seated ? ok(seated) : fail(`« ${found.name} » s'est rempli entre-temps.`);
}

export async function createRoom(input: NewRoomInput): Promise<Result<Room>> {
  const error = validateNewRoom(input);
  if (error) return fail(error);
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const created = await insertRoom({
      id: randomRoomCode(),
      name: input.name.trim(),
      visibility: input.visibility,
      maxPlayers: input.maxPlayers,
    });
    if (created) return ok(created);
  }
  return fail("Impossible de créer le salon pour le moment. Réessaie.");
}

/** Partie rapide : le salon public le plus rempli, sinon un nouveau salon dont on est l'hôte. */
export async function quickPlay(playerName: string): Promise<Result<{ room: Room; host: boolean }>> {
  for (let attempt = 0; attempt < QUICK_PLAY_ATTEMPTS; attempt++) {
    const candidate = pickQuickPlayRoom(await listOpenPublicRooms());
    if (!candidate) break;
    const seated = await takeSeat(candidate.id);
    if (seated) return ok({ room: seated, host: false });
  }
  const created = await createRoom({ name: `Salon de ${playerName}`.slice(0, 28), visibility: "public", maxPlayers: 8 });
  return created.ok ? ok({ room: created.data, host: true }) : created;
}

/** Nouveau lien d'invitation à usage unique vers un salon privé. Renvoie le jeton (jamais stocké en clair). */
export async function createInvite(roomId: string): Promise<Result<string>> {
  const found = await findRoom(roomId);
  if (!found) return fail("Ce salon n'existe plus.");
  if (found.visibility !== "private") return fail("Les invitations servent aux salons privés.");
  const token = randomBytes(INVITE_TOKEN_BYTES).toString("base64url");
  await insertInvite(roomId, hashToken(token), new Date(Date.now() + INVITE_LIFETIME_MS));
  return ok(token);
}

export async function redeemInvite(token: string): Promise<Result<Room>> {
  if (!/^[\w-]{20,100}$/.test(token)) return fail(INVALID_INVITE_MESSAGE);
  const outcome = await redeemInviteRow(hashToken(token));
  if ("room" in outcome) return ok(outcome.room);
  return fail(outcome.error === "full" ? "Ce salon est complet. Ton invitation reste valable." : INVALID_INVITE_MESSAGE);
}
