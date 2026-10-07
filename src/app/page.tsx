import { getSession } from "@/features/auth/server/session";
import { OrionHome } from "@/features/home/components/OrionHome";

export default async function Home() {
  const session = await getSession();
  return <OrionHome initialAccount={session ? { name: session.user.name } : null} />;
}
