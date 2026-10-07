"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { useReplay } from "@/features/home/replay-context";
import { useGame } from "../GameProvider";
import { CreatureSvg } from "../creatures";
import { NICKNAME_MAX_LENGTH, normalizeRoomCode } from "../rooms";
import { AuthPanel } from "./AuthPanel";
import { StatusMessage } from "./StatusMessage";
import { WindowBar } from "./WindowBar";

/** Onglet « Anonyme » : un pilote (avatar) et un surnom. */
function AnonPanel() {
  const { mode, avatar, nextAvatar, nickname, changeNickname, nicknameInvalid, nicknameRef } = useGame();
  return (
    <div className="panel" id="panelAnon" role="tabpanel" aria-labelledby="tabAnon" hidden={mode !== "anon"}>
      <div className="who">
        <button className="avatar" type="button" aria-label="Changer de pilote" onClick={nextAvatar}>
          <CreatureSvg avatar={avatar} />
        </button>
        <div className="field flex min-w-0 flex-1 flex-col gap-1">
          <label htmlFor="nick" style={{ fontSize: 20 }}>
            Surnom :
          </label>
          <input
            ref={nicknameRef}
            id="nick"
            value={nickname}
            maxLength={NICKNAME_MAX_LENGTH}
            autoComplete="nickname"
            spellCheck={false}
            aria-invalid={nicknameInvalid || undefined}
            onChange={(event) => changeNickname(event.target.value)}
          />
          <button className="linkbtn" type="button" onClick={nextAvatar}>
            Changer de pilote
          </button>
        </div>
      </div>
    </div>
  );
}

/** « Tu as un code ? » : rejoindre un salon avec son code. */
function JoinCodeForm() {
  const { joinWithCode } = useGame();
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCode(code.trim().toUpperCase());
    if (!joinWithCode(code)) inputRef.current?.focus();
  }

  return (
    <form className="field flex flex-col gap-1" noValidate onSubmit={submit}>
      <label htmlFor="code" style={{ fontSize: 20 }}>
        Tu as un code ?
      </label>
      <div className="coderow">
        <input
          ref={inputRef}
          id="code"
          placeholder="K7Q2"
          maxLength={6}
          autoComplete="off"
          spellCheck={false}
          value={code}
          onChange={(event) => setCode(normalizeRoomCode(event.target.value))}
        />
        <button className="mini" type="submit">
          ENTRER
        </button>
      </div>
    </form>
  );
}

/** Rejoue l'apparition de la fenêtre (classe `go`) à chaque « Rejouer l'intro », tant qu'elle n'a pas été quittée. */
function useReplayReveal(element: RefObject<HTMLElement | null>, revealed: boolean) {
  const { replayKey } = useReplay();
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const node = element.current;
    if (!node || !revealed) return;
    node.classList.remove("go");
    void node.offsetWidth;
    node.classList.add("go");
  }, [replayKey, element, revealed]);
}

/** Fenêtre « Joue maintenant » : onglets Anonyme / Authentification, JOUER, salons, code. */
export function GameWindow() {
  const { activeWindow, homeRevealed, busy, quickPlay, openCreateRoom, openRooms, homeWindowRef, playButtonRef, roomsButtonRef } =
    useGame();
  useReplayReveal(homeWindowRef, homeRevealed);

  return (
    <section
      ref={homeWindowRef}
      className={`login${homeRevealed ? " reveal go" : ""}`}
      id="winHome"
      style={homeRevealed ? { animationDelay: "1.55s" } : undefined}
      aria-labelledby="tHome"
      hidden={activeWindow !== "home"}
    >
      <WindowBar titleId="tHome" title="Joue maintenant" />
      <div className="wbody">
        <AnonPanel />
        <AuthPanel />
        <div className="acts">
          <button ref={playButtonRef} className="submit main" type="button" disabled={busy} onClick={quickPlay}>
            JOUER
          </button>
          <button className="submit" type="button" onClick={() => openCreateRoom("home")}>
            CRÉER UN SALON
          </button>
          <button ref={roomsButtonRef} className="submit" type="button" onClick={openRooms}>
            SALONS
          </button>
        </div>
        <hr className="sep" />
        <JoinCodeForm />
        <StatusMessage area="home" />
      </div>
    </section>
  );
}
