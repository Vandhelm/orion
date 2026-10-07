"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { useGame } from "../GameProvider";
import { CreatureSvg } from "../creatures";
import { NICKNAME_MAX_LENGTH } from "../rooms";
import { StatusMessage } from "./StatusMessage";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 12;
const TOO_MANY_REQUESTS = 429;

/** Nom de pilote tiré du courriel (partie avant @), comme dans la maquette. */
function pilotNameFromEmail(email: string): string {
  const name = email.split("@")[0].replace(/[^\wÀ-ÿ.-]/g, "").slice(0, NICKNAME_MAX_LENGTH) || "Pilote";
  return name.length < 2 ? `${name}_01` : name;
}

type Invalid = { email?: boolean; password?: boolean };

/** Onglet « Authentification » : vraie connexion et création de compte (Better Auth). */
export function AuthPanel() {
  const { mode, account, setAccount, avatar, say, hush, emailRef } = useGame();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState<Invalid>({});
  const [pending, setPending] = useState(false);

  /** Validation côté navigateur, pour guider ; le serveur revalide tout. */
  function checkFields(minPasswordLength: number, passwordMessage: string): boolean {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setInvalid({ email: true });
      say("auth", "Entre une adresse courriel valide.", true);
      emailRef.current?.focus();
      return false;
    }
    if (password.length < minPasswordLength) {
      setInvalid({ password: true });
      say("auth", passwordMessage, true);
      return false;
    }
    setInvalid({});
    return true;
  }

  function reportFailure(status: number, genericMessage: string) {
    say("auth", status === TOO_MANY_REQUESTS ? "Trop de tentatives. Réessaie plus tard." : genericMessage, true);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !checkFields(1, "Entre ton mot de passe.")) return;
    setPending(true);
    say("auth", "Connexion…");
    const { data, error } = await authClient.signIn.email({ email: email.trim(), password });
    setPending(false);
    // Message volontairement générique : ne pas révéler si le courriel a un compte.
    if (error) return reportFailure(error.status, "Courriel ou mot de passe invalide.");
    setPassword("");
    setAccount({ name: data.user.name });
    say("auth", `Bienvenue, ${data.user.name} !`);
  }

  async function signUp() {
    const lengthMessage = `Pour créer un compte, entre ton courriel et choisis un mot de passe d'au moins ${MIN_PASSWORD_LENGTH} caractères, puis reclique ici.`;
    if (pending || !checkFields(MIN_PASSWORD_LENGTH, lengthMessage)) return;
    setPending(true);
    say("auth", "Création du compte…");
    const name = pilotNameFromEmail(email.trim());
    const { data, error } = await authClient.signUp.email({ name, email: email.trim(), password });
    setPending(false);
    if (error) return reportFailure(error.status, "Impossible de créer le compte avec ces informations.");
    setPassword("");
    setAccount({ name: data.user.name });
    say("auth", `Compte créé. Bienvenue, ${data.user.name} !`);
  }

  async function signOut() {
    await authClient.signOut();
    setAccount(null);
    say("auth", "Tu es déconnecté.");
    emailRef.current?.focus();
  }

  return (
    <div className="panel" id="panelAuth" role="tabpanel" aria-labelledby="tabAuth" hidden={mode !== "auth"}>
      <form className="authf" noValidate onSubmit={signIn} hidden={!!account}>
        <div className="field flex flex-col gap-1">
          <label htmlFor="email" style={{ fontSize: 20 }}>
            Courriel :
          </label>
          <input
            ref={emailRef}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="toi@exemple.com"
            spellCheck={false}
            value={email}
            aria-invalid={invalid.email || undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              hush("auth");
            }}
          />
        </div>
        <div className="field flex flex-col gap-1">
          <label htmlFor="pass" style={{ fontSize: 20 }}>
            Mot de passe :
          </label>
          <input
            id="pass"
            type="password"
            autoComplete="current-password"
            placeholder="••••••"
            maxLength={128}
            value={password}
            aria-invalid={invalid.password || undefined}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button className="submit" type="submit" disabled={pending}>
          SE CONNECTER
        </button>
        <div className="alinks">
          <button className="linkbtn" type="button" onClick={signUp} disabled={pending}>
            Créer un compte
          </button>
        </div>
      </form>

      <div className="logged" hidden={!account}>
        <div className="who">
          <span className="avatar" aria-hidden="true">
            <CreatureSvg avatar={avatar} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="lbl2">Connecté :</span>
            <b className="acc">{account?.name}</b>
            <button className="linkbtn" type="button" onClick={signOut}>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
      <StatusMessage area="auth" />
    </div>
  );
}
