import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
// Chemin relatif : le CLI de migration de Better Auth ne connaît pas l'alias @/.
import { VISIBILITIES, type RoomLanguage } from "../features/game/rooms";

/** Tables du jeu (Drizzle). Les tables de connexion (user, session…) sont gérées par Better Auth. */

export const roomVisibility = pgEnum("room_visibility", VISIBILITIES);

export const room = pgTable(
  "room",
  {
    /** Code à 4 caractères (ex. K7Q2), aussi celui qu'on partage pour inviter. */
    id: varchar("id", { length: 6 }).primaryKey(),
    name: varchar("name", { length: 28 }).notNull(),
    players: integer("players").notNull().default(1),
    maxPlayers: integer("max_players").notNull(),
    visibility: roomVisibility("visibility").notNull(),
    mode: varchar("mode", { length: 32 }).notNull().default("Grand Prix"),
    /** Code ISO 639-1 parmi ROOM_LANGUAGES (vérifié par validateNewRoom). */
    language: varchar("language", { length: 2 }).$type<RoomLanguage>().notNull().default("fr"),
    bots: boolean("bots").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("room_players_range", sql`${table.players} >= 0 AND ${table.players} <= ${table.maxPlayers}`)],
);

/** Invitations à usage unique vers un salon privé : supprimées dès qu'elles servent, ou à expiration. */
export const roomInvite = pgTable(
  "room_invite",
  {
    /** Empreinte SHA-256 du jeton : le jeton lui-même n'existe que dans le lien partagé. */
    tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
    roomId: varchar("room_id", { length: 6 })
      .notNull()
      .references(() => room.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("room_invite_room_id_idx").on(table.roomId)],
);

export type RoomRow = typeof room.$inferSelect;
