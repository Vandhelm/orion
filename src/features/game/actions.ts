"use server";

import { cookies } from "next/headers";
import type { NewRoomInput, Room } from "./rooms";
import { validateNickname } from "./rooms";
import * as rooms from "./server/rooms-service";
import type { Result } from "./server/rooms-service";

/**
 * Server Actions des salons. Ouvertes aux invités (pas de compte requis pour jouer).
 * Un cookie httpOnly retient le salon occupé par ce navigateur : on ne peut libérer
 * que sa propre place, et rejoindre un autre salon libère la précédente.
 */

const SEAT_COOKIE = "orion_room";
const SEAT_MAX_AGE = 60 * 60 * 24;

async function rememberSeat(roomId: string) {
  const store = await cookies();
  const previous = store.get(SEAT_COOKIE)?.value;
  if (previous && previous !== roomId) await rooms.leaveRoom(previous);
  store.set(SEAT_COOKIE, roomId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SEAT_MAX_AGE,
    path: "/",
  });
}

async function seated<T extends { id: string }>(result: Result<T>): Promise<Result<T>> {
  if (result.ok) await rememberSeat(result.data.id);
  return result;
}

export async function listRoomsAction(): Promise<Room[]> {
  return rooms.listRooms();
}

export async function getRoomAction(code: string): Promise<Result<Room>> {
  return rooms.getRoom(String(code));
}

export async function joinRoomAction(id: string, password: string | null = null): Promise<Result<Room>> {
  return seated(await rooms.joinRoom(String(id), password === null ? null : String(password)));
}

export async function createRoomAction(input: NewRoomInput): Promise<Result<Room>> {
  return seated(
    await rooms.createRoom({
      name: String(input.name),
      visibility: input.visibility,
      password: String(input.password ?? ""),
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

export async function leaveRoomAction(id: string): Promise<void> {
  const store = await cookies();
  if (store.get(SEAT_COOKIE)?.value !== id) return;
  await rooms.leaveRoom(id);
  store.delete(SEAT_COOKIE);
}
