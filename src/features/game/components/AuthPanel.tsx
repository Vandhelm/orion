"use client";

import { useEffect, useState, type FormEvent } from "react";
import { pseudoEmail } from "@/features/auth/pseudo-email";
import { authClient } from "@/lib/auth-client";
import { useGame } from "../GameProvider";
import { CreatureSvg } from "../creatures";
import { StatusMessage } from "./StatusMessage";

type SocialProvider = "discord" | "github";

const SOCIAL_PROVIDERS: { id: SocialProvider; label: string }[] = [
  { id: "discord", label: "Discord" },
  { id: "github", label: "GitHub" },
];

/** Mêmes règles que le plugin username de Better Auth (vérifiées aussi côté serveur). */
const PSEUDO_PATTERN = /^[a-zA-Z0-9_.]{3,30}$/;
const MIN_PASSWORD_LENGTH = 12;
const TOO_MANY_REQUESTS = 429;
const USERNAME_TAKEN = "USERNAME_IS_ALREADY_TAKEN";

type Invalid = { pseudo?: boolean; password?: boolean };
type AuthResult = { data: { user: { name: string } } | null; error: { status: number; code?: string } | null };

/** Connexion (ou liaison) Discord / GitHub : redirige vers le fournisseur, qui ramène ensuite sur l'accueil. */
function startSocial(provider: SocialProvider, linkToCurrentAccount: boolean) {
  const options = { provider, callbackURL: "/", errorCallbackURL: "/" };
  return linkToCurrentAccount ? authClient.linkSocial(options) : authClient.signIn.social(options);
}

/** Formulaire secondaire : pseudo + mot de passe (connexion et création de compte). */
function PseudoForm() {
  const { setAccount, say, hush } = useGame();
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState<Invalid>({});
  const [pending, setPending] = useState(false);

  function checkFields(minPasswordLength: number, passwordMessage: string): boolean {
    if (!PSEUDO_PATTERN.test(pseudo.trim())) {
      setInvalid({ pseudo: true });
      say("auth", "Le pseudo compte 3 à 30 caractères : lettres, chiffres, _ et .", true);
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

  async function run(request: () => Promise<AuthResult>, welcome: string, failure: string) {
    setPending(true);
    const { data, error } = await request();
    setPending(false);
    if (error || !data) {
      if (error?.status === TOO_MANY_REQUESTS) return say("auth", "Trop de tentatives. Réessaie plus tard.", true);
      // Un pseudo est public : dire qu'il est pris ne révèle rien de secret.
      return say("auth", error?.code === USERNAME_TAKEN ? "Ce pseudo est déjà pris." : failure, true);
    }
    setPassword("");
    setAccount({ name: data.user.name });
    say("auth", `${welcome}, ${data.user.name} !`);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !checkFields(1, "Entre ton mot de passe.")) return;
    say("auth", "Connexion…");
    // Message volontairement générique : ne pas révéler lequel des deux est faux.
    await run(
      () => authClient.signIn.username({ username: pseudo.trim(), password }),
      "Bienvenue",
      "Pseudo ou mot de passe invalide.",
    );
  }

  async function signUp() {
    const lengthMessage = `Pour créer un compte, choisis un pseudo et un mot de passe d'au moins ${MIN_PASSWORD_LENGTH} caractères, puis reclique ici.`;
    if (pending || !checkFields(MIN_PASSWORD_LENGTH, lengthMessage)) return;
    say("auth", "Création du compte…");
    const name = pseudo.trim();
    await run(
      () => authClient.signUp.email({ username: name, name, email: pseudoEmail(name), password }),
      "Compte créé. Bienvenue",
      "Impossible de créer le compte avec ces informations.",
    );
  }

  return (
    <form className="authf" noValidate onSubmit={signIn}>
      <div className="field flex flex-col gap-1">
        <label htmlFor="pseudo" style={{ fontSize: 20 }}>
          Pseudo :
        </label>
        <input
          id="pseudo"
          autoComplete="username"
          spellCheck={false}
          maxLength={30}
          value={pseudo}
          aria-invalid={invalid.pseudo || undefined}
          onChange={(event) => {
            setPseudo(event.target.value);
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
  );
}

/** Comptes Discord / GitHub reliés au compte connecté, avec de quoi lier ceux qui manquent. */
function LinkedAccounts() {
  const { say } = useGame();
  const [linked, setLinked] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    authClient.listAccounts().then(({ data }) => {
      if (!cancelled) setLinked(data?.map((entry) => entry.providerId) ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function link(provider: SocialProvider, label: string) {
    const { error } = await startSocial(provider, true);
    if (error) say("auth", `Impossible de lier ${label} pour le moment.`, true);
  }

  if (!linked) return null;
  return (
    <ul className="mx-0 my-3 flex list-none flex-col gap-1.5 p-0">
      {SOCIAL_PROVIDERS.map(({ id, label }) => (
        <li key={id} className="flex items-center justify-between gap-2">
          <span className="lbl2">{label}</span>
          {linked.includes(id) ? (
            <span className="lbl2">✓ lié</span>
          ) : (
            <button className="mini" type="button" onClick={() => link(id, label)}>
              LIER
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Onglet « Authentification » : Discord et GitHub en avant, pseudo + mot de passe en option discrète. */
export function AuthPanel() {
  const { mode, account, setAccount, avatar, say } = useGame();
  const [showPseudo, setShowPseudo] = useState(false);

  async function social(provider: SocialProvider, label: string) {
    say("auth", `Redirection vers ${label}…`);
    const { error } = await startSocial(provider, false);
    if (error) say("auth", `Connexion ${label} indisponible pour le moment.`, true);
  }

  async function signOut() {
    await authClient.signOut();
    setAccount(null);
    say("auth", "Tu es déconnecté.");
  }

  return (
    <div className="panel" id="panelAuth" role="tabpanel" aria-labelledby="tabAuth" hidden={mode !== "auth"}>
      <div className="authf" hidden={!!account}>
        {SOCIAL_PROVIDERS.map(({ id, label }) => (
          <button key={id} className="submit main" type="button" onClick={() => social(id, label)}>
            CONTINUER AVEC {label.toUpperCase()}
          </button>
        ))}
        <button
          className="linkbtn"
          type="button"
          aria-expanded={showPseudo}
          aria-controls="pseudoForm"
          onClick={() => setShowPseudo((shown) => !shown)}
        >
          {showPseudo ? "Masquer la connexion par pseudo" : "Utiliser un pseudo et un mot de passe"}
        </button>
        <div id="pseudoForm" hidden={!showPseudo}>
          <PseudoForm />
        </div>
      </div>

      {account && (
        <div className="logged">
          <div className="who">
            <span className="avatar" aria-hidden="true">
              <CreatureSvg avatar={avatar} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="lbl2">Connecté :</span>
              <b className="acc">{account.name}</b>
              <button className="linkbtn" type="button" onClick={signOut}>
                Se déconnecter
              </button>
            </div>
          </div>
          <LinkedAccounts />
        </div>
      )}
      <StatusMessage area="auth" />
    </div>
  );
}
