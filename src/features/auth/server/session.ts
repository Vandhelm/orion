import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type Session = typeof auth.$Infer.Session;

/** Session vérifiée en base, mémorisée pour la durée d'un rendu. */
export const getSession = cache(async (): Promise<Session | null> => {
  return auth.api.getSession({ headers: await headers() });
});
