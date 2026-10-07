"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  createRoomAction,
  getRoomAction,
  joinRoomAction,
  leaveRoomAction,
  listRoomsAction,
  quickPlayAction,
} from "./actions";
import { AVATARS, type Avatar } from "./creatures";
import {
  MIN_PLAYERS_TO_START,
  isFull,
  validateJoinCode,
  validateNewRoom,
  validateNickname,
  type NewRoomInput,
  type Room,
} from "./rooms";
import { playEnterAnimation, setTransitionName, withViewTransition } from "./view-transition";

export type Mode = "anon" | "auth";
export type GameWindowName = "home" | "lobby";
export type StatusArea = "home" | "auth" | "lobby" | "rooms" | "create" | "password";
export type Status = { message: string; error: boolean };
export type PlayerAccount = { name: string };

type Lobby = { room: Room; host: boolean; started: boolean };
type Dialog = { kind: "create"; area: StatusArea } | { kind: "password"; room: Room; area: StatusArea } | null;
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const DEFAULT_NICKNAME = "Corail_418";
/** Petite attente volontaire de la maquette : « Recherche d'un salon… » reste lisible. */
const QUICK_PLAY_DELAY_MS = 900;
/** L'accord de l'hôte d'un salon semi-privé est simulé (pas encore de système de demandes). */
const SEMI_PRIVATE_DELAY_MS = 1600;
/** Rafraîchit les places de la salle d'attente : les autres pilotes arrivent en vrai. */
const LOBBY_POLL_INTERVAL_MS = 2500;
const SCROLL_DELAY_WITH_TRANSITION_MS = 380;
const SCROLL_DELAY_MS = 30;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type GameRefs = {
  nicknameRef: RefObject<HTMLInputElement | null>;
  emailRef: RefObject<HTMLInputElement | null>;
  homeWindowRef: RefObject<HTMLElement | null>;
  lobbyWindowRef: RefObject<HTMLElement | null>;
  roomsPageRef: RefObject<HTMLElement | null>;
  roomsGridRef: RefObject<HTMLDivElement | null>;
  roomsButtonRef: RefObject<HTMLButtonElement | null>;
  playButtonRef: RefObject<HTMLButtonElement | null>;
};

/** Éléments du DOM pilotés par le jeu (focus, View Transitions), nommés *Ref pour les règles React. */
type GameContextValue = GameRefs & {
  mode: Mode;
  chooseMode: (mode: Mode) => void;
  account: PlayerAccount | null;
  setAccount: (account: PlayerAccount | null) => void;
  nickname: string;
  changeNickname: (value: string) => void;
  nicknameInvalid: boolean;
  avatar: Avatar;
  nextAvatar: () => void;
  playerName: string;
  activeWindow: GameWindowName;
  homeRevealed: boolean;
  roomsOpen: boolean;
  publicRooms: Room[];
  lobby: Lobby | null;
  statuses: Partial<Record<StatusArea, Status>>;
  say: (area: StatusArea, message: string, error?: boolean) => void;
  hush: (area: StatusArea) => void;
  busy: boolean;
  dialog: Dialog;
  closeDialog: () => void;
  roomsQuery: string;
  setRoomsQuery: (query: string) => void;
  roomsPageIndex: number;
  setRoomsPageIndex: (page: number) => void;
  selectedRoomId: string | null;
  setSelectedRoomId: (id: string | null) => void;
  quickPlay: () => void;
  joinWithCode: (rawCode: string) => Promise<boolean>;
  joinRoom: (room: Room, area: StatusArea) => void;
  submitRoomPassword: (password: string) => Promise<boolean>;
  openCreateRoom: (area: StatusArea) => void;
  submitNewRoom: (input: NewRoomInput) => Promise<boolean>;
  leaveLobby: () => void;
  startRace: () => void;
  copyLobbyCode: () => void;
  openRooms: () => void;
  closeRooms: () => void;
  refreshRooms: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame doit être utilisé à l'intérieur d'un GameProvider");
  return context;
}

/** Focalise un élément une fois la mise à jour appliquée (après la View Transition s'il y en a une). */
function focusAfter(transition: ViewTransition | null, target: HTMLElement | null | undefined) {
  const focus = () => target?.focus({ preventScroll: true });
  if (transition) transition.updateCallbackDone.then(focus, focus);
  else focus();
}

type GameProviderProps = {
  initialAccount: PlayerAccount | null;
  /** Retour d'une connexion Discord / GitHub qui a échoué : on rouvre l'onglet Authentification avec un message. */
  socialSignInFailed?: boolean;
  children: ReactNode;
};

/**
 * État de la page de jeu : mode de connexion, pilote, salons, salle d'attente, fenêtres et
 * boîtes de dialogue. Les salons vivent en base (Server Actions de `actions.ts`) ; les règles
 * pures dans `rooms.ts`. Ici, on orchestre l'interface.
 */
export function GameProvider({ initialAccount, socialSignInFailed = false, children }: GameProviderProps) {
  const nicknameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const homeWindowRef = useRef<HTMLElement>(null);
  const lobbyWindowRef = useRef<HTMLElement>(null);
  const roomsPageRef = useRef<HTMLElement>(null);
  const roomsGridRef = useRef<HTMLDivElement>(null);
  const roomsButtonRef = useRef<HTMLButtonElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);

  const [mode, setMode] = useState<Mode>(initialAccount || socialSignInFailed ? "auth" : "anon");
  const [account, setAccount] = useState<PlayerAccount | null>(initialAccount);
  const [nickname, setNickname] = useState(DEFAULT_NICKNAME);
  const [nicknameInvalid, setNicknameInvalid] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [activeWindow, setActiveWindow] = useState<GameWindowName>("home");
  const [homeRevealed, setHomeRevealed] = useState(true);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [statuses, setStatuses] = useState<Partial<Record<StatusArea, Status>>>(() =>
    socialSignInFailed ? { auth: { message: "La connexion a échoué. Réessaie.", error: true } } : {},
  );
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [roomsQuery, setRoomsQuery] = useState("");
  const [roomsPageIndex, setRoomsPageIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const playerName = mode === "auth" && account ? account.name : nickname.trim();

  const say = useCallback((area: StatusArea, message: string, error = false) => {
    setStatuses((current) => ({ ...current, [area]: { message, error } }));
  }, []);

  const hush = useCallback((area: StatusArea) => {
    setStatuses((current) => ({ ...current, [area]: undefined }));
  }, []);

  /** Lance une action serveur en bloquant les autres boutons, et affiche son erreur dans `area`. */
  async function runAction<T>(area: StatusArea, action: Promise<ActionResult<T>>): Promise<T | null> {
    setBusy(true);
    try {
      const result = await action;
      if (result.ok) return result.data;
      say(area, result.error, true);
      return null;
    } catch {
      say(area, "Le serveur ne répond pas. Réessaie dans un instant.", true);
      return null;
    } finally {
      setBusy(false);
    }
  }

  /* ---------- Fenêtres ---------- */

  function showWindow(target: GameWindowName, focusTarget?: HTMLElement | null) {
    const backFromRooms = roomsOpen && target === "home";
    if (backFromRooms) setTransitionName(roomsGridRef.current, "salons");

    const transition = withViewTransition(() => {
      if (roomsOpen) {
        setRoomsOpen(false);
        setTransitionName(roomsGridRef.current);
      }
      setActiveWindow(target);
      setHomeRevealed(false);
      if (backFromRooms) setTransitionName(roomsButtonRef.current, "salons");
    });

    const windowElement = target === "home" ? homeWindowRef.current : lobbyWindowRef.current;
    if (transition) transition.finished.then(() => setTransitionName(roomsButtonRef.current));
    else {
      setTransitionName(roomsButtonRef.current);
      playEnterAnimation(windowElement);
    }
    if (target === "lobby" || (focusTarget && target === "home")) {
      setTimeout(
        () => windowElement?.scrollIntoView({ block: "center", behavior: "smooth" }),
        transition ? SCROLL_DELAY_WITH_TRANSITION_MS : SCROLL_DELAY_MS,
      );
    }
    focusAfter(transition, focusTarget ?? windowElement?.querySelector("h2"));
  }

  async function loadPublicRooms(): Promise<boolean> {
    try {
      setPublicRooms(await listRoomsAction());
      return true;
    } catch {
      say("rooms", "Impossible de charger les salons. Réessaie avec ↻.", true);
      return false;
    }
  }

  function openRooms() {
    hush("rooms");
    setRoomsQuery("");
    setRoomsPageIndex(0);
    void loadPublicRooms();
    setTransitionName(roomsButtonRef.current, "salons");
    const transition = withViewTransition(() => {
      setTransitionName(roomsButtonRef.current);
      setRoomsOpen(true);
      setTransitionName(roomsGridRef.current, "salons");
      if (roomsPageRef.current) roomsPageRef.current.scrollTop = 0;
    });
    if (transition) transition.finished.then(() => setTransitionName(roomsGridRef.current));
    else {
      setTransitionName(roomsGridRef.current);
      playEnterAnimation(roomsPageRef.current, "pageIn");
    }
    focusAfter(transition, roomsPageRef.current?.querySelector("h2"));
  }

  function closeRooms() {
    showWindow("home", roomsButtonRef.current);
  }

  async function refreshRooms() {
    if (await loadPublicRooms()) say("rooms", "Liste actualisée.");
  }

  /* ---------- Pilote ---------- */

  function changeNickname(value: string) {
    setNickname(value);
    setNicknameInvalid(false);
    hush("home");
  }

  /** Vérifie qu'on peut jouer : un compte connecté en mode Authentification, sinon un surnom valide. */
  function checkPlayer(area: StatusArea): boolean {
    if (mode === "auth") {
      if (account) return true;
      say(area, "Connecte-toi à ton compte, ou passe en mode Anonyme.", true);
      emailRef.current?.focus();
      return false;
    }
    const error = validateNickname(nickname);
    if (error) {
      setNicknameInvalid(true);
      say(area, error, true);
      nicknameRef.current?.focus();
      return false;
    }
    setNicknameInvalid(false);
    return true;
  }

  function chooseMode(next: Mode) {
    if (activeWindow === "lobby") leaveLobby();
    else if (roomsOpen) closeRooms();

    const transition = withViewTransition(() => setMode(next));
    if (!transition) playEnterAnimation(document.getElementById(next === "anon" ? "panelAnon" : "panelAuth"), "swap");
    hush("home");
    if (activeWindow === "home") {
      focusAfter(transition, next === "auth" && !account ? emailRef.current : nicknameRef.current);
    }
  }

  /* ---------- Salle d'attente ---------- */

  function enterLobby(room: Room, host: boolean, message?: string) {
    setLobby({ room, host, started: false });
    hush("lobby");
    showWindow("lobby");
    if (message) say("lobby", message);
    else if (!host) say("lobby", "Sur la grille : en attente que l'hôte donne le départ…");
  }

  function leaveLobby() {
    if (lobby) void leaveRoomAction(lobby.room.id);
    setLobby(null);
    showWindow("home", playButtonRef.current);
  }

  function startRace() {
    if (!lobby) return;
    if (lobby.room.players < MIN_PLAYERS_TO_START) {
      say("lobby", "Il faut au moins 2 pilotes pour donner le départ.", true);
      return;
    }
    setLobby({ ...lobby, started: true });
    say("lobby", "3… 2… 1… Partez ! (maquette : la page de course viendra ici)");
  }

  function copyLobbyCode() {
    if (!lobby) return;
    const { id } = lobby.room;
    const fallback = () => say("lobby", `Copie impossible ici : note le code ${id}.`);
    if (!navigator.clipboard?.writeText) return fallback();
    navigator.clipboard.writeText(id).then(() => say("lobby", `Code ${id} copié. Envoie-le à tes amis.`), fallback);
  }

  // Les places se mettent à jour quand d'autres pilotes arrivent ou partent, tant que la course n'a pas démarré.
  const waitingRoomId = lobby && !lobby.started ? lobby.room.id : null;
  useEffect(() => {
    if (!waitingRoomId) return;
    const timer = setInterval(async () => {
      const result = await getRoomAction(waitingRoomId).catch(() => null);
      if (!result?.ok) return;
      setLobby((current) => (current?.room.id === waitingRoomId ? { ...current, room: result.data } : current));
    }, LOBBY_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [waitingRoomId]);

  /* ---------- Rejoindre ---------- */

  /** Rejoindre depuis l'interface : vérifie d'abord le pilote. */
  function joinRoom(room: Room, area: StatusArea) {
    if (busy || !checkPlayer(area)) return;
    void tryJoin(room, area);
  }

  async function tryJoin(room: Room, area: StatusArea) {
    if (isFull(room)) return say(area, `« ${room.name} » est complet.`, true);
    if (room.visibility === "private") {
      hush("password");
      setDialog({ kind: "password", room, area });
      return;
    }
    if (room.visibility === "semi-private") {
      say(area, `Demande envoyée à l'hôte de « ${room.name} »… En attente de sa réponse.`);
      setBusy(true);
      await wait(SEMI_PRIVATE_DELAY_MS);
    }
    const joined = await runAction(area, joinRoomAction(room.id));
    if (joined) enterLobby(joined, false);
  }

  /** Renvoie false seulement si le code est refusé : le formulaire remet alors le focus sur son champ. */
  async function joinWithCode(rawCode: string): Promise<boolean> {
    if (busy || !checkPlayer("home")) return true;
    const check = validateJoinCode(rawCode);
    if ("error" in check) {
      say("home", check.error, true);
      return false;
    }
    const room = await runAction("home", getRoomAction(check.code));
    if (!room) return false;
    await tryJoin(room, "home");
    return true;
  }

  async function submitRoomPassword(password: string): Promise<boolean> {
    if (dialog?.kind !== "password") return false;
    if (!password) {
      say("password", "Entre le mot de passe.", true);
      return false;
    }
    const joined = await runAction("password", joinRoomAction(dialog.room.id, password));
    if (!joined) return false;
    setDialog(null);
    enterLobby(joined, false);
    return true;
  }

  /* ---------- JOUER : partie rapide ---------- */

  async function quickPlay() {
    if (busy || !checkPlayer("home")) return;
    say("home", "Recherche d'un salon public…");
    const [seat] = await Promise.all([runAction("home", quickPlayAction(playerName)), wait(QUICK_PLAY_DELAY_MS)]);
    if (seat) enterLobby(seat.room, seat.host);
  }

  /* ---------- Créer un salon ---------- */

  function openCreateRoom(area: StatusArea) {
    if (!checkPlayer(area)) return;
    hush("create");
    setDialog({ kind: "create", area });
  }

  async function submitNewRoom(input: NewRoomInput): Promise<boolean> {
    const error = validateNewRoom(input);
    if (error) {
      say("create", error, true);
      return false;
    }
    const room = await runAction("create", createRoomAction(input));
    if (!room) return false;
    setDialog(null);
    const shareHint = room.visibility === "private" ? " et le mot de passe." : ".";
    enterLobby(
      room,
      true,
      room.visibility === "public"
        ? "Salon créé : il apparaît dans la liste des salons publics."
        : `Salon créé. Il n'apparaît pas dans la liste : partage le code ${room.id}${shareHint}`,
    );
    return true;
  }

  const value: GameContextValue = {
    nicknameRef,
    emailRef,
    homeWindowRef,
    lobbyWindowRef,
    roomsPageRef,
    roomsGridRef,
    roomsButtonRef,
    playButtonRef,
    mode,
    chooseMode,
    account,
    setAccount,
    nickname,
    changeNickname,
    nicknameInvalid,
    avatar: AVATARS[avatarIndex],
    nextAvatar: () => setAvatarIndex((index) => (index + 1) % AVATARS.length),
    playerName,
    activeWindow,
    homeRevealed,
    roomsOpen,
    publicRooms,
    lobby,
    statuses,
    say,
    hush,
    busy,
    dialog,
    closeDialog: () => setDialog(null),
    roomsQuery,
    setRoomsQuery,
    roomsPageIndex,
    setRoomsPageIndex,
    selectedRoomId,
    setSelectedRoomId,
    quickPlay,
    joinWithCode,
    joinRoom,
    submitRoomPassword,
    openCreateRoom,
    submitNewRoom,
    leaveLobby,
    startRace,
    copyLobbyCode,
    openRooms,
    closeRooms,
    refreshRooms,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/** Racine `.orion` de la page : suit l'ouverture de la page Salons (classe, défilement, Échap). */
export function GameShell({ children }: { children: ReactNode }) {
  const { roomsOpen, dialog, closeRooms } = useGame();
  const closeRoomsRef = useRef(closeRooms);
  useEffect(() => {
    closeRoomsRef.current = closeRooms;
  });

  useEffect(() => {
    if (!roomsOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [roomsOpen]);

  useEffect(() => {
    if (!roomsOpen || dialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRoomsRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [roomsOpen, dialog]);

  const className = useMemo(() => `orion${roomsOpen ? " rooms-open" : ""}`, [roomsOpen]);
  return <div className={className}>{children}</div>;
}
