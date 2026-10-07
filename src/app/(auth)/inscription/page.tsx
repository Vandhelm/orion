import Link from "next/link";
import { AuthForm } from "@/features/auth/components/AuthForm";

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl">Inscription</h1>
      <AuthForm mode="sign-up" />
      <p className="text-sm text-muted">
        Déjà inscrit ? <Link href="/connexion" className="text-foreground underline">Connectez-vous</Link>
      </p>
    </>
  );
}
