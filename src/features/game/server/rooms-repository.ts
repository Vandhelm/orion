import "server-only";
import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { room, roomInvite } from "@/db/schema";
import { db } from "@/lib/db";
import type { Room, Visibility } from "../rooms";

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

export async function findRoom(id: string): Promise<Room | null> {
  const [found] = await db.select(ROOM_FIELDS).from(room).where(eq(room.id, id));
  return found ?? null;
}

export type NewRoomRow = { id: string; name: string; visibility: Visibility; maxPlayers: number };

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

/** Libère une place ; le salon (et ses invitations) disparaît quand il est vide. */
export async function releaseSeat(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(room)
      .set({ players: sql`${room.players} - 1` })
      .where(and(eq(room.id, id), gt(room.players, 0)));
    await tx.delete(room).where(and(eq(room.id, id), eq(room.players, 0)));
  });
}

export async function insertInvite(roomId: string, tokenHash: string, expiresAt: Date): Promise<void> {
  await db.insert(roomInvite).values({ roomId, tokenHash, expiresAt });
}

export type RedeemOutcome = { room: Room } | { error: "invalid" | "full" };

/**
 * Utilise une invitation : la place est prise et l'invitation supprimée dans la même transaction.
 * Si le salon est complet, rien n'est consommé ; une invitation ne sert donc qu'une seule fois.
 */
export async function redeemInvite(tokenHash: string): Promise<RedeemOutcome> {
  return db.transaction(async (tx) => {
    const [invite] = await tx
      .select({ roomId: roomInvite.roomId })
      .from(roomInvite)
      .where(and(eq(roomInvite.tokenHash, tokenHash), gt(roomInvite.expiresAt, sql`now()`)))
      .for("update");
    if (!invite) return { error: "invalid" };

    const [seated] = await tx
      .update(room)
      .set({ players: sql`${room.players} + 1` })
      .where(and(eq(room.id, invite.roomId), lt(room.players, room.maxPlayers)))
      .returning(ROOM_FIELDS);
    if (!seated) return { error: "full" };

    await tx.delete(roomInvite).where(eq(roomInvite.tokenHash, tokenHash));
    return { room: seated };
  });
}
