"use server";

import { cookies } from "next/headers";
import type { NewRoomInput, Room } from "./rooms";
import { validateNickname } from "./rooms";
import * as rooms from "./server/rooms-service";
import type { Result } from "./server/rooms-service";

/**
 * Server Actions des salons. Ouvertes aux invités (pas de compte requis pour jouer).
 * Un cookie httpOnly retient le salon occupé par ce navigateur : on ne peut libérer
 * que sa propre place, inviter que dans son propre salon, et rejoindre un autre salon
 * libère la place précédente.
 */

const SEAT_COOKIE = "orion_room";
const SEAT_MAX_AGE = 60 * 60 * 24;

async function currentSeat(): Promise<string | undefined> {
  return (await cookies()).get(SEAT_COOKIE)?.value;
}

async function rememberSeat(roomId: string) {
  const previous = await currentSeat();
  if (previous && previous !== roomId) await rooms.leaveRoom(previous);
  (await cookies()).set(SEAT_COOKIE, roomId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SEAT_MAX_AGE,
    path: "/",
  });
}

async function seated(result: Result<Room>): Promise<Result<Room>> {
  if (result.ok) await rememberSeat(result.data.id);
  return result;
}

const NOT_IN_ROOM: Result<never> = { ok: false, error: "Tu n'es pas dans ce salon." };

export async function listRoomsAction(): Promise<Room[]> {
  return rooms.listRooms();
}

/** Trouver un salon par son code avant de le rejoindre (les salons privés sont refusés). */
export async function findRoomByCodeAction(code: string): Promise<Result<Room>> {
  return rooms.findRoomByCode(String(code));
}

/** Places à jour de son propre salon (salle d'attente). */
export async function roomStateAction(id: string): Promise<Result<Room>> {
  if ((await currentSeat()) !== id) return NOT_IN_ROOM;
  return rooms.roomState(id);
}

export async function joinRoomAction(id: string): Promise<Result<Room>> {
  return seated(await rooms.joinRoom(String(id)));
}

export async function redeemInviteAction(token: string): Promise<Result<Room>> {
  return seated(await rooms.redeemInvite(String(token)));
}

export async function createRoomAction(input: NewRoomInput): Promise<Result<Room>> {
  return seated(
    await rooms.createRoom({
      name: String(input.name),
      visibility: input.visibility,
      maxPlayers: Number(input.maxPlayers),
    }),
  );
}

export async function quickPlayAction(playerName: string): Promise<Result<{ room: Room; host: boolean }>> {
  const nameError = validateNickname(String(playerName));
  if (nameError) return { ok: false, error: nameError };
  const result = await rooms.quickPlay(String(playerName).trim());
  if (result.ok) await rememberSeat(result.data.room.id);
  return result;
}

/** Nouveau lien d'invitation : seulement pour un pilote assis dans ce salon privé. */
export async function createInviteAction(roomId: string): Promise<Result<string>> {
  if ((await currentSeat()) !== roomId) return NOT_IN_ROOM;
  return rooms.createInvite(roomId);
}

export async function leaveRoomAction(id: string): Promise<void> {
  if ((await currentSeat()) !== id) return;
  await rooms.leaveRoom(id);
  (await cookies()).delete(SEAT_COOKIE);
}
