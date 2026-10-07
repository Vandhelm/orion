"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { useGame } from "../GameProvider";
import { DEFAULT_MAX_PLAYERS, MAX_PLAYER_OPTIONS, findRoomByCode, type Visibility } from "../rooms";
import { StatusMessage } from "./StatusMessage";
import { WindowBar } from "./WindowBar";

/** Ouvre la boîte native en modale quand `open` passe à vrai, la ferme sinon. */
function useModal(open: boolean): RefObject<HTMLDialogElement | null> {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return ref;
}

type GameDialogProps = {
  open: boolean;
  titleId: string;
  title: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
};

function GameDialog({ open, titleId, title, onSubmit, children }: GameDialogProps) {
  const { closeDialog } = useGame();
  const ref = useModal(open);
  return (
    <dialog ref={ref} className="mdlg" aria-labelledby={titleId} onClose={closeDialog}>
      <form noValidate onSubmit={onSubmit}>
        <WindowBar titleId={titleId} title={title} onClose={closeDialog} />
        <div className="wbody">{children}</div>
      </form>
    </dialog>
  );
}

const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string }[] = [
  { value: "public", label: "Public", description: "Visible dans la liste, entrée libre." },
  { value: "semi", label: "Semi-privé", description: "Avec le code ; tu acceptes chaque demande." },
  { value: "private", label: "Privé", description: "Avec le code et un mot de passe." },
];

/** Champs du formulaire « Créer un salon », remis à zéro à chaque ouverture (monté à neuf). */
function CreateRoomFields({ defaultName }: { defaultName: string }) {
  const [visibility, setVisibility] = useState<Visibility>("public");
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => nameRef.current?.select(), []);

  return (
    <>
      <div className="field flex flex-col gap-1">
        <label htmlFor="roomName" style={{ fontSize: 20 }}>
          Nom du salon :
        </label>
        <input ref={nameRef} id="roomName" name="roomName" maxLength={28} autoComplete="off" defaultValue={defaultName} />
      </div>
      <fieldset className="vis">
        <legend style={{ fontSize: 20 }}>Qui peut entrer ?</legend>
        {VISIBILITY_OPTIONS.map((option) => (
          <label key={option.value} className="vopt">
            <input
              type="radio"
              name="visibility"
              value={option.value}
              checked={visibility === option.value}
              onChange={() => setVisibility(option.value)}
            />
            <span>
              <b>{option.label}</b> {option.description}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="field flex flex-col gap-1" hidden={visibility !== "private"}>
        <label htmlFor="roomPass" style={{ fontSize: 20 }}>
          Mot de passe (4 caractères min.) :
        </label>
        <input id="roomPass" name="roomPassword" type="password" maxLength={24} autoComplete="new-password" />
      </div>
      <div className="field flex items-center gap-2.5">
        <label htmlFor="roomMax" style={{ fontSize: 20 }}>
          Places :
        </label>
        <select id="roomMax" name="maxPlayers" className="input sel" defaultValue={DEFAULT_MAX_PLAYERS}>
          {MAX_PLAYER_OPTIONS.map((count) => (
            <option key={count}>{count}</option>
          ))}
        </select>
      </div>
    </>
  );
}

export function CreateRoomDialog() {
  const { dialog, playerName, submitNewRoom, closeDialog } = useGame();
  const open = dialog?.kind === "create";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const created = submitNewRoom({
      name: String(data.get("roomName") ?? ""),
      visibility: String(data.get("visibility")) as Visibility,
      password: String(data.get("roomPassword") ?? ""),
      maxPlayers: Number(data.get("maxPlayers")),
    });
    if (!created) form.querySelector<HTMLInputElement>("[aria-invalid], #roomName")?.focus();
  }

  return (
    <GameDialog open={open} titleId="tCreate" title="Créer un salon" onSubmit={submit}>
      {open && <CreateRoomFields defaultName={`Salon de ${playerName}`} />}
      <StatusMessage area="create" role="alert" />
      <div className="wfoot">
        <button className="mini" type="button" onClick={closeDialog}>
          ANNULER
        </button>
        <button className="submit main small" type="submit">
          CRÉER
        </button>
      </div>
    </GameDialog>
  );
}

export function RoomPasswordDialog() {
  const { dialog, rooms, submitRoomPassword, closeDialog } = useGame();
  const room = dialog?.kind === "password" ? findRoomByCode(rooms, dialog.code) : undefined;
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = inputRef.current;
    if (input && !submitRoomPassword(input.value)) input.select();
  }

  return (
    <GameDialog open={!!room} titleId="tPass" title="Salon privé" onSubmit={submit}>
      <p className="m-0" style={{ fontSize: 20 }}>
        Mot de passe pour <b>« {room?.name} »</b> :
      </p>
      <div className="field">
        <input ref={inputRef} key={room?.code} type="password" autoComplete="off" aria-label="Mot de passe" />
      </div>
      <StatusMessage area="password" role="alert" />
      <div className="wfoot">
        <button className="mini" type="button" onClick={closeDialog}>
          ANNULER
        </button>
        <button className="submit main small" type="submit">
          ENTRER
        </button>
      </div>
    </GameDialog>
  );
}
