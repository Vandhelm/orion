"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/Logo";
import { Stripes } from "@/components/Stripes";
import styles from "./AuthForm.module.css";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthMode;
  /** Classes ajoutées à la carte (ex. animation d'apparition sur l'accueil). */
  className?: string;
};

const COPY: Record<AuthMode, { title: string; submit: string; switchLabel: string; switchHref: string }> = {
  "sign-in": { title: "Connexion", submit: "SE CONNECTER", switchLabel: "Créer un compte", switchHref: "/inscription" },
  "sign-up": { title: "Inscription", submit: "CRÉER LE COMPTE", switchLabel: "J'ai déjà un compte", switchHref: "/connexion" },
};

// Messages volontairement génériques : ne pas révéler si un courriel est déjà inscrit.
const FAILURE_MESSAGE: Record<AuthMode, string> = {
  "sign-in": "Courriel ou mot de passe invalide.",
  "sign-up": "Impossible de créer le compte avec ces informations.",
};

const TOO_MANY_REQUESTS = 429;

export function AuthForm({ mode, className = "" }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const copy = COPY[mode];

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
    <form onSubmit={handleSubmit} className={`${styles.card} ${className}`}>
      <div className="h-[30px] box-border border-b-2 border-border flex items-center gap-2 px-2">
        <div className="w-4 h-4 border-2 border-border bg-background box-border shrink-0" />
        <Stripes />
        <h2 className="m-0 font-sans font-normal text-[13px] px-2">{copy.title}</h2>
        <Stripes />
      </div>

      <div className="p-[22px_24px_24px] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Logo width={40} height={26} />
          <div className="text-[20px] leading-[1.05]">
            Bienvenue à bord.
            <br />
            Identifiez-vous pour plonger.
          </div>
        </div>

        {mode === "sign-up" && <Field name="name" label="Nom" type="text" autoComplete="name" placeholder="Capitaine Nemo" />}
        <Field name="email" label="Courriel" type="email" autoComplete="email" placeholder="vous@exemple.com" />
        <Field
          name="password"
          label="Mot de passe"
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          placeholder="••••••••"
          minLength={mode === "sign-up" ? 12 : undefined}
          maxLength={128}
          hint={mode === "sign-up" ? "12 caractères minimum." : undefined}
        />

        <div className="flex justify-end pt-[6px] px-1">
          <button
            type="submit"
            disabled={pending}
            className={`${styles.submit} w-full font-sans text-[14px] tracking-[0.06em] bg-background text-foreground border-2 border-border rounded-[10px] min-h-[46px] cursor-pointer hover:bg-foreground hover:text-background active:bg-accent active:text-accent-foreground disabled:cursor-wait disabled:opacity-60`}
          >
            {pending ? "ENVOI…" : copy.submit}
          </button>
        </div>

        {error && (
          <p role="alert" className="m-0 text-[19px] leading-[1.1] text-danger border-2 border-border px-[10px] py-[6px]">
            {error}
          </p>
        )}

        <div className="flex justify-end text-[19px]">
          <Link href={copy.switchHref} className="hover:bg-highlight hover:text-highlight-foreground">
            {copy.switchLabel}
          </Link>
        </div>
      </div>
    </form>
  );
}

type FieldProps = {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  placeholder: string;
  minLength?: number;
  maxLength?: number;
  hint?: string;
};

function Field({ name, label, hint, ...inputProps }: FieldProps) {
  const hintId = hint ? `${name}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-[20px]">
        {label} :
      </label>
      <input
        id={name}
        name={name}
        required
        aria-describedby={hintId}
        className={`${styles.fieldInput} font-mono text-[22px] text-foreground bg-background border-2 border-border px-[10px] py-[6px] outline-none w-full box-border`}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="m-0 text-[17px] text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
