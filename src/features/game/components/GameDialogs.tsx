"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { useGame } from "../GameProvider";
import {
  DEFAULT_MAX_PLAYERS,
  DEFAULT_ROOM_LANGUAGE,
  LANGUAGE_LABEL,
  MAX_PLAYER_OPTIONS,
  ROOM_LANGUAGES,
  ROOM_NAME_MAX_LENGTH,
  type RoomLanguage,
  type Visibility,
} from "../rooms";
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
  { value: "public", label: "Public", description: "Affiché dans la liste, n'importe qui peut entrer." },
  { value: "semi-public", label: "Semi-public", description: "Hors de la liste : on entre avec le code, le lien ou le QR code." },
  { value: "private", label: "Privé", description: "Sur invitation : chaque lien ne sert qu'une fois." },
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
        <input ref={nameRef} id="roomName" name="roomName" maxLength={ROOM_NAME_MAX_LENGTH} autoComplete="off" defaultValue={defaultName} />
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
      <div className="field flex items-center gap-2.5">
        <label htmlFor="roomLanguage" style={{ fontSize: 20 }}>
          Langue :
        </label>
        <select id="roomLanguage" name="language" className="input sel" defaultValue={DEFAULT_ROOM_LANGUAGE}>
          {ROOM_LANGUAGES.map((code) => (
            <option key={code} value={code}>
              {LANGUAGE_LABEL[code]}
            </option>
          ))}
        </select>
      </div>
      <label className="vopt">
        <input type="checkbox" name="bots" />
        <span>
          <b>Bots</b> Des bots complètent la grille s&apos;il manque des pilotes.
        </span>
      </label>
    </>
  );
}

export function CreateRoomDialog() {
  const { dialog, playerName, submitNewRoom, closeDialog } = useGame();
  const open = dialog?.kind === "create";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const created = await submitNewRoom({
      name: String(data.get("roomName") ?? ""),
      visibility: String(data.get("visibility")) as Visibility,
      maxPlayers: Number(data.get("maxPlayers")),
      language: String(data.get("language")) as RoomLanguage,
      bots: data.get("bots") === "on",
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
