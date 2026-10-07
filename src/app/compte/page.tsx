import { requireSession } from "@/features/auth/server/session";
import { SignOutButton } from "@/features/auth/components/SignOutButton";

export default async function AccountPage() {
  const { user } = await requireSession();
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl">Bonjour, {user.name}</h1>
      <p className="text-muted">{user.email}</p>
      <SignOutButton />
    </main>
  );
}
