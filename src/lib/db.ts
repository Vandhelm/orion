import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
// Chemins relatifs : le CLI de migration de Better Auth ne connaît pas l'alias @/.
import * as schema from "../db/schema";

/** Une seule connexion partagée par Better Auth et par Drizzle. */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
