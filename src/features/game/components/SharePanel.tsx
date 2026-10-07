"use client";

import { useState } from "react";
import { useGame } from "../GameProvider";
import { roomLink, type Room } from "../rooms";
import { QrCode } from "./QrCode";

type Shared = { link: string; label: string };

/** Lien (et QR code) à partager : celui du salon, ou une invitation à usage unique pour un salon privé. */
export function SharePanel({ room }: { room: Room }) {
  const { say, busy, createInvitationLink } = useGame();
  const [shared, setShared] = useState<Shared | null>(null);
  const [showQr, setShowQr] = useState(false);
  const isPrivate = room.visibility === "private";

  function copy(text: string, done: string) {
    const fallback = () => say("lobby", "Copie impossible ici : sélectionne le lien et copie-le à la main.");
    if (!navigator.clipboard?.writeText) return fallback();
    navigator.clipboard.writeText(text).then(() => say("lobby", done), fallback);
  }

  function shareRoomLink() {
    const link = roomLink(window.location.origin, room.id);
    setShared({ link, label: `QR code du salon ${room.name}` });
    copy(link, "Lien du salon copié. Envoie-le à tes amis.");
  }

  async function invite() {
    const link = await createInvitationLink();
    if (!link) return;
    setShared({ link, label: `QR code d'invitation au salon ${room.name}` });
    copy(link, "Invitation copiée : elle ne servira qu'une seule fois.");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2.5">
        {isPrivate ? (
          <button className="mini" type="button" disabled={busy} onClick={invite}>
            {shared ? "NOUVELLE INVITATION" : "INVITER"}
          </button>
        ) : (
          <button className="mini" type="button" onClick={shareRoomLink}>
            COPIER LE LIEN
          </button>
        )}
        {shared && (
          <button className="mini" type="button" aria-expanded={showQr} onClick={() => setShowQr((shown) => !shown)}>
            {showQr ? "MASQUER LE QR" : "QR CODE"}
          </button>
        )}
      </div>
      {shared && (
        <div className="field">
          <input readOnly value={shared.link} aria-label="Lien à partager" onFocus={(event) => event.currentTarget.select()} />
        </div>
      )}
      {shared && showQr && <QrCode value={shared.link} label={shared.label} />}
      <p className="lnote">
        {isPrivate
          ? "Salon privé : chaque invitation ne sert qu'une fois, puis le lien disparaît."
          : "Partage le code, le lien ou le QR code pour inviter des pilotes."}
      </p>
    </div>
  );
}
