/**
 * Salons de démonstration (ceux de la maquette). Pour le développement et les démos :
 *   bun run db:seed
 * Sans effet sur un salon qui existe déjà (même id).
 */
import { db, pool } from "../lib/db";
import { room } from "./schema";

const DEMO_ROOMS = [
  { id: "S100", name: "Kakigōri fraise", visibility: "public", players: 5, maxPlayers: 8, mode: "Grand Prix" },
  { id: "S137", name: "Stand Ramune", visibility: "semi-public", players: 2, maxPlayers: 6, mode: "Sprint" },
  { id: "S174", name: "Mochi secret", visibility: "private", players: 5, maxPlayers: 8, mode: "Grand Prix" },
  { id: "S211", name: "Dango Club", visibility: "public", players: 3, maxPlayers: 10, mode: "Contre-la-montre" },
  { id: "S248", name: "Cornet géant", visibility: "public", players: 8, maxPlayers: 8, mode: "Grand Prix" },
  { id: "S285", name: "Glaçons & Cie", visibility: "semi-public", players: 1, maxPlayers: 4, mode: "Sprint" },
  { id: "S322", name: "Taiyaki chaud", visibility: "public", players: 6, maxPlayers: 12, mode: "Contre-la-montre" },
  { id: "S359", name: "Yuzu privé", visibility: "private", players: 4, maxPlayers: 4, mode: "Grand Prix" },
  { id: "S396", name: "Soft cream", visibility: "public", players: 2, maxPlayers: 6, mode: "Grand Prix" },
  { id: "S433", name: "Comptoir 42", visibility: "public", players: 4, maxPlayers: 8, mode: "Grand Prix" },
  { id: "S470", name: "Bâtonnets glacés", visibility: "public", players: 1, maxPlayers: 6, mode: "Sprint" },
  { id: "S507", name: "Sirop melon", visibility: "public", players: 2, maxPlayers: 4, mode: "Sprint" },
] as const;

const inserted = await db
  .insert(room)
  .values([...DEMO_ROOMS])
  .onConflictDoNothing({ target: room.id })
  .returning({ id: room.id });

console.log(`${inserted.length} salon(s) de démonstration ajouté(s).`);
await pool.end();
