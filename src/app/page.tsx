import { getSession } from "@/features/auth/server/session";
import { OrionHome } from "@/features/home/components/OrionHome";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [session, { error }] = await Promise.all([getSession(), searchParams]);
  return (
    <OrionHome
      initialAccount={session ? { name: session.user.name } : null}
      // Better Auth renvoie ici avec ?error=… quand Discord ou GitHub refuse la connexion.
      socialSignInFailed={!session && typeof error === "string"}
    />
  );
}
