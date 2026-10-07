import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

/** Session vérifiée en base, mémorisée pour la durée d'un rendu. */
export const getSession = cache(async (): Promise<Session | null> => {
  return auth.api.getSession({ headers: await headers() });
});

/** À appeler dans toute page, action ou route protégée : le proxy ne fait qu'une vérification optimiste. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/connexion");
  return session;
}
