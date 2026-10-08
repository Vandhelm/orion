"use client";

import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { useGame } from "../GameProvider";
import { ROOM_CODE_LENGTH, normalizeRoomCode } from "../rooms";

const CHARS_PER_PANEL = 2;
const PANEL_COUNT = ROOM_CODE_LENGTH / CHARS_PER_PANEL;
const PLACEHOLDERS = ["そ", "ば"];
const EMPTY = Array.from({ length: PANEL_COUNT }, () => "");

/** Répartit une suite de caractères dans les pans, à partir du pan `from`. */
function spread(panels: string[], from: number, text: string): string[] {
  const next = [...panels];
  let rest = normalizeRoomCode(text);
  for (let i = from; rest && i < PANEL_COUNT; i++) {
    next[i] = rest.slice(0, CHARS_PER_PANEL);
    rest = rest.slice(CHARS_PER_PANEL);
  }
  return next;
}

/**
 * Code d'un salon tapé dans les pans du noren, 2 caractères par pan.
 * Le curseur avance tout seul, Retour arrière recule, un code collé se répartit ;
 * le code complet est envoyé aussitôt.
 */
export function NorenCodeForm() {
  const { joinWithCode, hush } = useGame();
  const [panels, setPanels] = useState(EMPTY);
  const [incomplete, setIncomplete] = useState(false);
  const [rejected, setRejected] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusPanel = (index: number) => inputs.current[index]?.focus();
  const firstUnfilled = (values: string[]) => values.findIndex((value) => value.length < CHARS_PER_PANEL);

  async function submit(values: string[]) {
    const code = values.join("");
    if (code.length < ROOM_CODE_LENGTH) {
      setIncomplete(true);
      focusPanel(firstUnfilled(values));
      return;
    }
    if (!(await joinWithCode(code, "rooms"))) {
      setRejected(true);
      focusPanel(0);
    }
  }

  function update(values: string[], focusFrom: number) {
    setPanels(values);
    setIncomplete(false);
    setRejected(false);
    hush("rooms");
    const next = firstUnfilled(values);
    if (next === -1) void submit(values);
    else if (values[focusFrom].length === CHARS_PER_PANEL) focusPanel(next);
  }

  function onInput(index: number, raw: string) {
    const value = normalizeRoomCode(raw);
    if (value.length > CHARS_PER_PANEL) return update(spread(panels, index, value), index);
    update(panels.map((panel, i) => (i === index ? value : panel)), index);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    if (event.key === "Backspace" && input.value === "" && index > 0) {
      event.preventDefault();
      setPanels(panels.map((panel, i) => (i === index - 1 ? panel.slice(0, 1) : panel)));
      focusPanel(index - 1);
    } else if (event.key === "ArrowLeft" && input.selectionStart === 0 && index > 0) {
      focusPanel(index - 1);
    } else if (event.key === "ArrowRight" && input.selectionStart === input.value.length && index < PANEL_COUNT - 1) {
      focusPanel(index + 1);
    }
  }

  function onPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    update(spread(panels, index, event.clipboardData.getData("text")), index);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(panels);
  }

  const complete = firstUnfilled(panels) === -1;

  return (
    <>
      <p className="yatai__codehint" id="noren-hint" role="status">
        {incomplete ? (
          <>
            <span lang="ja">すみません</span> · Code incomplet : {ROOM_CODE_LENGTH} caractères
          </>
        ) : (
          <>
            <span lang="ja">入場コード</span> · Tu as un code ?
          </>
        )}
      </p>
      <form
        className={`yatai__noren${complete && !rejected ? " is-ok" : ""}`}
        autoComplete="off"
        noValidate
        aria-describedby="noren-hint"
        onSubmit={onSubmit}
      >
        {panels.map((value, index) => (
          <span key={index} className="contents">
            <label className="sr" htmlFor={`noren-${index}`}>
              Code du salon, caractères {index * CHARS_PER_PANEL + 1} et {(index + 1) * CHARS_PER_PANEL}
            </label>
            <input
              ref={(element) => {
                inputs.current[index] = element;
              }}
              id={`noren-${index}`}
              className="noren__in"
              value={value}
              maxLength={ROOM_CODE_LENGTH}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              placeholder={PLACEHOLDERS[index]}
              aria-invalid={(incomplete && value.length < CHARS_PER_PANEL) || rejected || undefined}
              onChange={(event) => onInput(index, event.target.value)}
              onKeyDown={(event) => onKeyDown(index, event)}
              onPaste={(event) => onPaste(index, event)}
            />
          </span>
        ))}
        <button type="submit" className="sr">
          Entrer
        </button>
      </form>
    </>
  );
}
