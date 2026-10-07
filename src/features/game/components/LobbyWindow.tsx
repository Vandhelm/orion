"use client";

import { useState } from "react";
import { useGame } from "../GameProvider";
import { CreatureSvg } from "../creatures";
import { MIN_PLAYERS_TO_START, VISIBILITY_LABEL, type Room } from "../rooms";
import { SharePanel } from "./SharePanel";
import { StatusMessage } from "./StatusMessage";
import { WindowBar } from "./WindowBar";

type SeatsProps = { room: Room; host: boolean };

/** Places du salon : prises en noir, la sienne en couleur, les nouvelles arrivées « sautent ». */
function Seats({ room, host }: SeatsProps) {
  // Places déjà affichées avant le dernier changement : seules les nouvelles s'animent.
  const [seen, setSeen] = useState({ players: room.players, previous: 0 });
  if (seen.players !== room.players) setSeen({ players: room.players, previous: seen.players });
  const { previous } = seen;

  return (
    <div className="seats" aria-hidden="true">
      {Array.from({ length: room.maxPlayers }, (_, seat) => {
        const taken = seat < room.players;
        const mine = host ? seat === 0 : seat === room.players - 1;
        const classes = [taken && "on", taken && mine && "me", taken && seat >= previous && "pop"].filter(Boolean);
        return <i key={seat} className={classes.join(" ") || undefined} />;
      })}
    </div>
  );
}

/** Salle d'attente : code à partager, places, départ donné par l'hôte. */
export function LobbyWindow() {
  const { activeWindow, lobby, avatar, playerName, leaveLobby, startRace, copyLobbyCode, lobbyWindowRef } = useGame();
  const room = lobby?.room;
  const host = !!lobby?.host;
  const tooFewPlayers = !room || room.players < MIN_PLAYERS_TO_START;

  return (
    <section ref={lobbyWindowRef} className="login" id="winLobby" hidden={activeWindow !== "lobby"} aria-labelledby="tLobby">
      <WindowBar titleId="tLobby" title="Salle d'attente" onClose={leaveLobby} />
      <div className="wbody">
        <div className="lhead">
          <div>
            <div className="lname">{room?.name}</div>
            <div className="lvis">
              {room && `${VISIBILITY_LABEL[room.visibility]} · ${room.mode}${host ? " · tu es l'hôte" : ""}`}
            </div>
          </div>
          {room && room.visibility !== "private" && (
            <div className="lcode">
              <span>CODE</span>
              <b>{room.id}</b>
              <button className="mini" type="button" onClick={copyLobbyCode}>
                COPIER
              </button>
            </div>
          )}
        </div>
        <div className="field">
          <span style={{ fontSize: 20 }}>Places :</span>{" "}
          <span style={{ fontSize: 20 }}>{room && `${room.players} / ${room.maxPlayers} prises`}</span>
        </div>
        {room && <Seats key={`seats-${room.id}`} room={room} host={host} />}
        {room && <SharePanel key={`share-${room.id}`} room={room} />}
        <p className="lnote">Les autres pilotes restent anonymes : seul le nombre de places prises est affiché.</p>
        <div className="me">
          <span className="meav">
            <CreatureSvg avatar={avatar} />
          </span>
          <span>
            Toi : <b>{playerName}</b>
          </span>
        </div>
        <StatusMessage area="lobby" />
        <div className="acts">
          <button
            className="submit main"
            type="button"
            hidden={!host}
            disabled={tooFewPlayers || lobby?.started}
            title={tooFewPlayers ? "Il faut au moins 2 pilotes" : undefined}
            onClick={startRace}
          >
            DONNER LE DÉPART
          </button>
          <button className="submit" type="button" onClick={leaveLobby}>
            QUITTER LE SALON
          </button>
        </div>
      </div>
    </section>
  );
}
