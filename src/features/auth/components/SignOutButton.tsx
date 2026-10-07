"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.replace("/connexion");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="min-h-11 rounded-md border border-border px-4 focus-visible:outline-2 focus-visible:outline-foreground"
    >
      Se déconnecter
    </button>
  );
}
