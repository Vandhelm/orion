import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit ne lit pas .env.local tout seul ; une variable déjà définie (ex. base de production) reste prioritaire.
if (!process.env.DATABASE_URL && existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
  // Drizzle ne gère que ses tables : celles de Better Auth ont leur propre migration.
  tablesFilter: ["room", "room_invite"],
});
