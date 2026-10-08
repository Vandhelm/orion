"use client";

import { useGame } from "../GameProvider";
import { listOpenPublicRooms, paginateRooms } from "../rooms";
import { NorenCodeForm } from "./NorenCodeForm";
import { RoomPouch } from "./RoomPouch";
import { StatusMessage } from "./StatusMessage";
import { Yatai } from "./Yatai";
import "./kiosk.css";

/** Grains de poussière de la pellicule, en pourcentage de la scène. */
const DUST = [
  { left: "7%", top: "70%", width: 6, height: 3 },
  { left: "93%", top: "64%", width: 5, height: 5 },
  { left: "18%", top: "24%", width: 3, height: 3 },
];

function countLabel(count: number, searching: boolean): string {
  if (count) return `${count} ${count > 1 ? "salons publics ouverts" : "salon public ouvert"}`;
  return searching ? "Aucun résultat" : "Aucun salon ouvert";
}

/** Page Salons : le kiosque, une pochette par salon public ouvert, le code d'un salon tapé dans le noren. */
export function RoomsKiosk() {
  const game = useGame();
  const { publicRooms, roomsOpen, roomsQuery, roomsPageIndex, roomsPageRef, roomsGridRef } = game;

  const searching = !!roomsQuery.trim();
  const list = listOpenPublicRooms(publicRooms, roomsQuery);
  const { shown, page, pageCount } = paginateRooms(list, roomsPageIndex);

  return (
    <section ref={roomsPageRef} className="kiosk" id="winRooms" hidden={!roomsOpen} aria-labelledby="tRooms">
      <h2 id="tRooms" className="sr" tabIndex={-1}>
        Salons publics
      </h2>
      <button type="button" className="k-sign" onClick={game.closeRooms}>
        <span className="k-sign__jp" lang="ja">
          戻る
        </span>
        <span>← Accueil</span>
      </button>

      <div className="k-band">
        {/* remonté à chaque ouverture : le noren repart vide */}
        <Yatai ref={roomsGridRef} noren={<NorenCodeForm key={String(roomsOpen)} />}>
          <div className="k-board">
            <p className="k-board__count">
              <span lang="ja" aria-hidden="true">
                屋台
              </span>
              {countLabel(list.length, searching)}
            </p>
            <div className="k-board__tools">
              <label className="sr" htmlFor="q">
                Chercher un salon
              </label>
              <input
                id="q"
                className="k-input"
                placeholder="Chercher…"
                autoComplete="off"
                value={roomsQuery}
                onChange={(event) => game.setRoomsQuery(event.target.value)}
              />
              <button className="k-btn" type="button" aria-label="Actualiser la liste" onClick={game.refreshRooms}>
                ↻
              </button>
              <button className="k-btn k-btn--stamp" type="button" onClick={() => game.openCreateRoom("rooms")}>
                + Créer un salon
              </button>
            </div>
          </div>
          <StatusMessage area="rooms" />

          {shown.length ? (
            <ul className="poch-grid">
              {shown.map((room) => (
                <RoomPouch key={room.id} room={room} onJoin={() => game.joinRoom(room, "rooms")} />
              ))}
            </ul>
          ) : (
            <p className="k-empty">
              <span lang="ja">すみません</span>
              {searching ? "Aucun salon public ne correspond à ta recherche." : "Aucun salon public n'a de place pour l'instant."}
              <br />
              Crée le tien avec « + Créer un salon », ou tape un code sur le noren.
            </p>
          )}

          {pageCount > 1 && (
            <nav className="k-pages" aria-label="Pages de salons">
              <button className="k-btn" type="button" aria-label="Page précédente" disabled={page === 0} onClick={() => game.setRoomsPageIndex(page - 1)}>
                ←
              </button>
              <span>
                Page {page + 1} / {pageCount}
              </span>
              <button
                className="k-btn"
                type="button"
                aria-label="Page suivante"
                disabled={page === pageCount - 1}
                onClick={() => game.setRoomsPageIndex(page + 1)}
              >
                →
              </button>
            </nav>
          )}
        </Yatai>

        {DUST.map((dust) => (
          <i key={dust.left} className="k-dust" aria-hidden="true" style={dust} />
        ))}
        <div className="k-floor" aria-hidden="true" />
      </div>
    </section>
  );
}
