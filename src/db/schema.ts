import { sql } from "drizzle-orm";
import { check, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
// Chemin relatif : le CLI de migration de Better Auth ne connaît pas l'alias @/.
import { VISIBILITIES } from "../features/game/rooms";

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
    /** Salon privé seulement : mot de passe haché (scrypt), jamais en clair. */
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("room_players_range", sql`${table.players} >= 0 AND ${table.players} <= ${table.maxPlayers}`),
    check("room_password_only_private", sql`(${table.visibility} = 'private') = (${table.passwordHash} IS NOT NULL)`),
  ],
);

export type RoomRow = typeof room.$inferSelect;
