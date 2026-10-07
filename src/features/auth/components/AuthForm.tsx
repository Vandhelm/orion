"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthMode;
};

const SUBMIT_LABEL: Record<AuthMode, string> = {
  "sign-in": "Se connecter",
  "sign-up": "Créer le compte",
};

// Messages volontairement génériques : ne pas révéler si un courriel est déjà inscrit.
const FAILURE_MESSAGE: Record<AuthMode, string> = {
  "sign-in": "Courriel ou mot de passe invalide.",
  "sign-up": "Impossible de créer le compte avec ces informations.",
};

const TOO_MANY_REQUESTS = 429;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const { error } =
      mode === "sign-up"
        ? await authClient.signUp.email({ name: String(form.get("name")), email, password })
        : await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.status === TOO_MANY_REQUESTS ? "Trop de tentatives. Réessayez plus tard." : FAILURE_MESSAGE[mode]);
      setPending(false);
      return;
    }
    router.replace("/compte");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      {mode === "sign-up" && <Field name="name" label="Nom" type="text" autoComplete="name" />}
      <Field name="email" label="Courriel" type="email" autoComplete="email" />
      <Field
        name="password"
        label="Mot de passe"
        type="password"
        autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
        minLength={mode === "sign-up" ? 12 : undefined}
        maxLength={128}
        hint={mode === "sign-up" ? "12 caractères minimum." : undefined}
      />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-md bg-foreground px-4 text-background disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        {pending ? "Envoi…" : SUBMIT_LABEL[mode]}
      </button>
    </form>
  );
}

type FieldProps = {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
  hint?: string;
};

function Field({ name, label, hint, ...inputProps }: FieldProps) {
  const hintId = hint ? `${name}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required
        aria-describedby={hintId}
        className="min-h-11 rounded-md border border-border bg-background px-3 focus-visible:outline-2 focus-visible:outline-foreground"
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
