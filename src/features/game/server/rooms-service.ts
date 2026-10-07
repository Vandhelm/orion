import "server-only";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import {
  isFull,
  pickQuickPlayRoom,
  randomRoomCode,
  unknownCodeMessage,
  validateJoinCode,
  validateNewRoom,
  type NewRoomInput,
  type Room,
} from "../rooms";
import { findRoom, insertRoom, listOpenPublicRooms, releaseSeat, takeSeat } from "./rooms-repository";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const fail = <T>(error: string): Result<T> => ({ ok: false, error });

const MAX_CODE_ATTEMPTS = 5;
const QUICK_PLAY_ATTEMPTS = 3;

export { listOpenPublicRooms as listRooms };

function withoutPassword({ id, name, visibility, players, maxPlayers, mode }: Room): Room {
  return { id, name, visibility, players, maxPlayers, mode };
}

/** Salon visible par son code (un salon privé ou semi-privé se trouve aussi par son code). */
export async function getRoom(rawCode: string): Promise<Result<Room>> {
  const check = validateJoinCode(rawCode);
  if ("error" in check) return fail(check.error);
  const found = await findRoom(check.code);
  if (!found) return fail(unknownCodeMessage(check.code));
  return ok(withoutPassword(found));
}

/** Rejoindre un salon : vérifie le mot de passe d'un salon privé, puis prend une place. */
export async function joinRoom(id: string, password: string | null): Promise<Result<Room>> {
  const found = await findRoom(id);
  if (!found) return fail("Ce salon n'existe plus.");
  if (found.visibility === "private") {
    if (!password) return fail("Entre le mot de passe.");
    if (!found.passwordHash || !(await verifyPassword({ hash: found.passwordHash, password }))) {
      return fail("Mot de passe incorrect.");
    }
  }
  if (isFull(found)) return fail(`« ${found.name} » est complet.`);
  const seated = await takeSeat(id);
  return seated ? ok(seated) : fail(`« ${found.name} » s'est rempli entre-temps.`);
}

export async function createRoom(input: NewRoomInput): Promise<Result<Room>> {
  const error = validateNewRoom(input);
  if (error) return fail(error);
  const passwordHash = input.visibility === "private" ? await hashPassword(input.password) : null;
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const created = await insertRoom({
      id: randomRoomCode(),
      name: input.name.trim(),
      visibility: input.visibility,
      maxPlayers: input.maxPlayers,
      passwordHash,
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
  const created = await createRoom({
    name: `Salon de ${playerName}`.slice(0, 28),
    visibility: "public",
    password: "",
    maxPlayers: 8,
  });
  return created.ok ? ok({ room: created.data, host: true }) : created;
}

export { releaseSeat as leaveRoom };
