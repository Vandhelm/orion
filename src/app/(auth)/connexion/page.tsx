import Link from "next/link";
import { AuthForm } from "@/features/auth/components/AuthForm";

export default function SignInPage() {
  return (
    <>
      <h1 className="text-2xl">Connexion</h1>
      <AuthForm mode="sign-in" />
      <p className="text-sm text-muted">
        Pas de compte ? <Link href="/inscription" className="text-foreground underline">Inscrivez-vous</Link>
      </p>
    </>
  );
}
