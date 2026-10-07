import { getSession } from "@/features/auth/server/session";
import type { SharedLink } from "@/features/game/GameProvider";
import { INVITATION_LINK_PARAM, ROOM_LINK_PARAM } from "@/features/game/rooms";
import { OrionHome } from "@/features/home/components/OrionHome";

type SearchParams = Record<string, string | string[] | undefined>;

/** Lien partagé dans l'adresse : ?salon=K7Q2 (code) ou ?invitation=… (salon privé). */
function sharedLinkFrom(params: SearchParams): SharedLink | null {
  const invitation = params[INVITATION_LINK_PARAM];
  if (typeof invitation === "string" && invitation) return { kind: "invitation", token: invitation };
  const code = params[ROOM_LINK_PARAM];
  if (typeof code === "string" && code) return { kind: "room", code };
  return null;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  return (
    <OrionHome
      initialAccount={session ? { name: session.user.name } : null}
      // Better Auth renvoie ici avec ?error=… quand Discord ou GitHub refuse la connexion.
      socialSignInFailed={!session && typeof params.error === "string"}
      sharedLink={sharedLinkFrom(params)}
    />
  );
}
