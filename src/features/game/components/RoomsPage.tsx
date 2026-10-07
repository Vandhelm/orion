"use client";

import type { CSSProperties } from "react";
import { useGame } from "../GameProvider";
import { RoomPictogram, SOUND_EFFECTS, pictogramFor } from "../pictograms";
import { isFull, layoutRoomGrid, listOpenPublicRooms, paginateRooms, raceInfo, type GridArea, type Room } from "../rooms";
import { setTransitionName, withViewTransition, playEnterAnimation } from "../view-transition";
import { StatusMessage } from "./StatusMessage";

const CELL_STAGGER_MS = 35;
const SMALL_SCREEN = "(max-width:860px)";

function Pips({ room, className }: { room: Room; className: string }) {
  return (
    <span className={className} aria-hidden="true">
      {Array.from({ length: room.maxPlayers }, (_, seat) => (
        <i key={seat} className={seat < room.players ? "on" : undefined} />
      ))}
    </span>
  );
}

type RoomCellProps = {
  room: Room;
  number: number;
  index: number;
  area: GridArea;
  selected: boolean;
  onSelect: (cell: HTMLButtonElement) => void;
  onJoin: () => void;
};

function RoomCell({ room, number, index, area, selected, onSelect, onJoin }: RoomCellProps) {
  const pictogram = pictogramFor(room);
  const style: CSSProperties & { "--d": string } = { ...area, "--d": `${index * CELL_STAGGER_MS}ms` };
  return (
    <button
      type="button"
      className="cell cellIn"
      style={style}
      aria-pressed={selected}
      aria-label={`${room.name}, ${room.players} pilotes sur ${room.maxPlayers}, ${room.mode}`}
      onClick={(event) => onSelect(event.currentTarget)}
      onDoubleClick={onJoin}
    >
      <span className="num">{String(number).padStart(2, "0")}</span>
      <span className="sfx2">{SOUND_EFFECTS[pictogram]}</span>
      <span className="pic">
        <RoomPictogram pictogram={pictogram} />
      </span>
      <span className="cn">{room.name}</span>
      <span className="cm">
        {room.players}/{room.maxPlayers} · {room.mode}
      </span>
      <Pips room={room} className="pips" />
    </button>
  );
}

function RoomDetail({ room, searching, onJoin }: { room: Room | undefined; searching: boolean; onJoin: () => void }) {
  if (!room) {
    return (
      <p className="rd-empty">
        {searching ? "Aucun salon public ne correspond à ta recherche." : "Aucun salon public n'a de place pour l'instant."}
        <br />
        Crée le tien avec « + CRÉER UN SALON ».
      </p>
    );
  }
  const pictogram = pictogramFor(room);
  const { laps, currentLap } = raceInfo(room);
  const full = isFull(room);
  return (
    <>
      <div className="rd-pic">
        <RoomPictogram pictogram={pictogram} />
        <span className="rd-bubble">{SOUND_EFFECTS[pictogram]}!</span>
      </div>
      <div>
        <h3 className="rd-name">{room.name}</h3>
        <span className="rd-tag">Salon public</span>
        <ul className="rd-list">
          <li>
            <span>Pilotes</span>
            <b>
              {room.players} / {room.maxPlayers}
            </b>
          </li>
          <li>
            <span>Mode</span>
            <b>{room.mode}</b>
          </li>
          <li>
            <span>Tours</span>
            <b>{laps}</b>
          </li>
          <li>
            <span>Statut</span>
            <b>{currentLap ? `Tour ${currentLap} / ${laps}` : "Sur la grille"}</b>
          </li>
        </ul>
        <Pips room={room} className="rd-seats" />
        <p className="rd-note">Les pilotes restent anonymes : seul le nombre de places prises est affiché.</p>
        <button className="rd-join" type="button" disabled={full} onClick={onJoin}>
          {full ? "SALON PLEIN" : "REJOINDRE"}
        </button>
      </div>
    </>
  );
}

/** Page Salons : salons publics ouverts en cases autour du détail de celui qui est choisi. */
export function RoomsPage() {
  const game = useGame();
  const { rooms, roomsOpen, roomsQuery, roomsPageIndex, selectedRoomCode, roomsPageRef, roomsGridRef } = game;

  const list = listOpenPublicRooms(rooms, roomsQuery);
  const { shown, page, pageCount, perPage } = paginateRooms(list, roomsPageIndex);
  const selected = shown.find((room) => room.code === selectedRoomCode) ?? shown[0];
  const cellCount = shown.length + (pageCount > 1 ? 1 : 0);
  const layout = layoutRoomGrid(cellCount);
  const nextPage = (page + 1) % pageCount;

  const countLabel = list.length
    ? `${list.length} ${list.length > 1 ? "salons publics ouverts" : "salon public ouvert"}`
    : roomsQuery.trim()
      ? "Aucun résultat"
      : "Aucun salon ouvert";

  function joinSelected() {
    if (selected) game.joinRoom(selected, "rooms");
  }

  /** Le pictogramme de la case glisse jusqu'au détail (View Transition), sinon simple fondu. */
  function select(room: Room, cell: HTMLButtonElement) {
    if (room.code === selected?.code) return;
    const detail = document.getElementById("rDetail");
    setTransitionName(detail?.querySelector(".rd-pic"));
    setTransitionName(cell.querySelector(".pic"), "roompic");
    const transition = withViewTransition(() => {
      setTransitionName(cell.querySelector(".pic"));
      game.setSelectedRoomCode(room.code);
      game.hush("rooms");
      setTransitionName(detail?.querySelector(".rd-pic"), "roompic");
    });
    if (transition) transition.finished.then(() => setTransitionName(detail?.querySelector(".rd-pic")));
    else playEnterAnimation(detail, "swap");
    if (window.matchMedia(SMALL_SCREEN).matches) detail?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  return (
    <section ref={roomsPageRef} className="roomsPage" id="winRooms" hidden={!roomsOpen} aria-labelledby="tRooms">
      <div className="rp-wrap">
        <div
          ref={roomsGridRef}
          className="rp-grid"
          style={{ gridTemplateColumns: "repeat(12,minmax(0,1fr))", gridTemplateRows: layout.gridTemplateRows }}
        >
          <article className="rp-center" style={layout.center}>
            <header className="rc-head">
              <div className="rc-title">
                <h2 id="tRooms" tabIndex={-1}>
                  Salons
                  <br />
                  publics
                </h2>
                <span className="rc-kat" aria-hidden="true">
                  屋台
                </span>
              </div>
              <div className="rc-side">
                <p className="rc-count">{countLabel}</p>
                <div className="rtools">
                  <label className="sr" htmlFor="q">
                    Chercher un salon
                  </label>
                  <input
                    id="q"
                    className="input"
                    placeholder="Chercher…"
                    autoComplete="off"
                    value={roomsQuery}
                    onChange={(event) => game.setRoomsQuery(event.target.value)}
                  />
                  <button className="mini" type="button" aria-label="Actualiser la liste" onClick={game.refreshRooms}>
                    ↻
                  </button>
                </div>
              </div>
            </header>
            <div className="rc-detail" id="rDetail" aria-live="polite">
              <RoomDetail room={selected} searching={!!roomsQuery.trim()} onJoin={joinSelected} />
            </div>
            <div className="rc-foot">
              <StatusMessage area="rooms" />
              <div className="rc-btns">
                <button className="mini" type="button" onClick={game.closeRooms}>
                  ← ACCUEIL
                </button>
                <button className="mini" type="button" onClick={() => game.openCreateRoom("rooms")}>
                  + CRÉER UN SALON
                </button>
              </div>
            </div>
          </article>

          {shown.map((room, index) => (
            <RoomCell
              key={room.code}
              room={room}
              number={page * perPage + index + 1}
              index={index}
              area={layout.slots[index]}
              selected={room.code === selected?.code}
              onSelect={(cell) => select(room, cell)}
              onJoin={() => game.joinRoom(room, "rooms")}
            />
          ))}
          {pageCount > 1 && (
            <button
              type="button"
              className="cell more"
              style={layout.slots[cellCount - 1]}
              onClick={() => {
                game.setRoomsPageIndex(nextPage);
                game.setSelectedRoomCode(null);
              }}
            >
              <span className="plus">→</span>
              <span className="cn">
                Salons {nextPage * perPage + 1} et suivants
                <br />
                page {nextPage + 1} / {pageCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
