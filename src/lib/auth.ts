import { betterAuth, type BetterAuthOptions } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { username } from "better-auth/plugins";
import { Pool } from "pg";
// Chemin relatif : le CLI de migration ne connaît pas l'alias @/.
import { pseudoEmail } from "../features/auth/pseudo-email";

// Pas de "server-only" ici : le CLI de Better Auth importe ce fichier pour les migrations.

const ONE_DAY = 60 * 60 * 24;

/** Discord et GitHub ne sont activés que si leurs identifiants sont configurés. */
function socialProviders(): BetterAuthOptions["socialProviders"] {
  const providers: BetterAuthOptions["socialProviders"] = {};
  const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
  if (DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET) {
    providers.discord = { clientId: DISCORD_CLIENT_ID, clientSecret: DISCORD_CLIENT_SECRET };
  }
  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    providers.github = { clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET };
  }
  return providers;
}

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: {
    enabled: true,
    // Mots de passe hachés en scrypt (sel unique par utilisateur) par Better Auth.
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: socialProviders(),
  account: {
    accountLinking: {
      enabled: true,
      // Un même compte peut être relié à Discord et à GitHub en même temps.
      trustedProviders: ["discord", "github"],
      // Un compte pseudo a un courriel fictif : il doit pouvoir lier un Discord ou un GitHub quand même.
      allowDifferentEmails: true,
    },
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
      "/sign-in/username": { window: 60, max: 5 },
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60 * 10, max: 3 },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      // Inscription par pseudo uniquement : pas de compte « courriel + mot de passe ».
      // Le courriel est toujours recalculé ici, le client ne peut pas en imposer un vrai.
      const pseudo: unknown = ctx.body?.username;
      if (typeof pseudo !== "string" || !pseudo.trim()) {
        throw new APIError("BAD_REQUEST", { message: "Pseudo requis." });
      }
      return { context: { body: { ...ctx.body, email: pseudoEmail(pseudo) } } };
    }),
  },
  plugins: [username()],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
