import "server-only";
import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { room } from "@/db/schema";
import { db } from "@/lib/db";
import type { Room, Visibility } from "../rooms";

/** Colonnes renvoyées à l'interface : jamais le mot de passe haché. */
const ROOM_FIELDS = {
  id: room.id,
  name: room.name,
  visibility: room.visibility,
  players: room.players,
  maxPlayers: room.maxPlayers,
  mode: room.mode,
};

export async function listOpenPublicRooms(): Promise<Room[]> {
  return db
    .select(ROOM_FIELDS)
    .from(room)
    .where(and(eq(room.visibility, "public"), lt(room.players, room.maxPlayers)))
    .orderBy(desc(room.createdAt), asc(room.id));
}

export async function findRoom(id: string): Promise<(Room & { passwordHash: string | null }) | null> {
  const [found] = await db
    .select({ ...ROOM_FIELDS, passwordHash: room.passwordHash })
    .from(room)
    .where(eq(room.id, id));
  return found ?? null;
}

export type NewRoomRow = {
  id: string;
  name: string;
  visibility: Visibility;
  maxPlayers: number;
  passwordHash: string | null;
};

/** Insère le salon (son créateur occupe la première place). Renvoie null si le code est déjà pris. */
export async function insertRoom(row: NewRoomRow): Promise<Room | null> {
  const [created] = await db
    .insert(room)
    .values({ ...row, players: 1 })
    .onConflictDoNothing({ target: room.id })
    .returning(ROOM_FIELDS);
  return created ?? null;
}

/** Prend une place en une seule requête : impossible de dépasser le maximum, même à plusieurs en même temps. */
export async function takeSeat(id: string): Promise<Room | null> {
  const [updated] = await db
    .update(room)
    .set({ players: sql`${room.players} + 1` })
    .where(and(eq(room.id, id), lt(room.players, room.maxPlayers)))
    .returning(ROOM_FIELDS);
  return updated ?? null;
}

/** Libère une place ; le salon disparaît quand il est vide. */
export async function releaseSeat(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(room)
      .set({ players: sql`${room.players} - 1` })
      .where(and(eq(room.id, id), gt(room.players, 0)));
    await tx.delete(room).where(and(eq(room.id, id), eq(room.players, 0)));
  });
}
