import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Pas de "server-only" ici : le CLI de Better Auth importe ce fichier pour les migrations.

const ONE_DAY = 60 * 60 * 24;

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: {
    enabled: true,
    // Mots de passe hachés en scrypt (sel unique par utilisateur) par Better Auth.
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
  },
  session: {
    expiresIn: 7 * ONE_DAY,
    updateAge: ONE_DAY,
  },
  rateLimit: {
    enabled: true,
    // En base pour que la limite tienne entre redémarrages et instances.
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60 * 10, max: 3 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
