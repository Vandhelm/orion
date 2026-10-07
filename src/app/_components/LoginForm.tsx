"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { Logo } from "./Logo";
import { Stripes } from "./Stripes";

export function LoginForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className={styles.login}
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div className="h-[30px] box-border border-b-2 border-border flex items-center gap-2 px-2">
        <div className="w-4 h-4 border-2 border-border bg-background box-border shrink-0" />
        <Stripes />
        <h2 className="m-0 font-sans font-normal text-[13px] px-2">Connexion</h2>
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

        <div className="flex flex-col gap-1">
          <label htmlFor="login-email" className="text-[20px]">
            Courriel :
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            className={`${styles.fieldInput} font-mono text-[22px] text-foreground bg-background border-2 border-border px-[10px] py-[6px] outline-none w-full box-border`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="login-pass" className="text-[20px]">
            Mot de passe :
          </label>
          <input
            id="login-pass"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${styles.fieldInput} font-mono text-[22px] text-foreground bg-background border-2 border-border px-[10px] py-[6px] outline-none w-full box-border`}
          />
        </div>

        <div className="flex justify-end pt-[6px] px-1">
          <button
            type="submit"
            className={`${styles.submit} w-full font-sans text-[14px] tracking-[0.06em] bg-background text-foreground border-2 border-border rounded-[10px] min-h-[46px] cursor-pointer hover:bg-foreground hover:text-background active:bg-accent active:text-accent-foreground`}
          >
            SE CONNECTER
          </button>
        </div>

        {sent && (
          <div className="text-[19px] leading-[1.1] bg-highlight text-highlight-foreground border-2 border-border px-[10px] py-[6px]">
            Maquette : aucune donnée n&apos;est envoyée.
          </div>
        )}

        <div className="flex justify-between text-[19px]">
          <a href="#" className="hover:bg-highlight">
            Mot de passe oublié ?
          </a>
          <a href="#" className="hover:bg-highlight">
            Créer un compte
          </a>
        </div>
      </div>
    </form>
  );
}
