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
      className="min-h-[46px] cursor-pointer rounded-[10px] border-2 border-border bg-background px-4 font-sans text-[14px] tracking-[0.06em] hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      SE DÉCONNECTER
    </button>
  );
}
