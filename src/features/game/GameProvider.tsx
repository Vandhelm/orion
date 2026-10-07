"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { AVATARS, type Avatar } from "./creatures";
import {
  MIN_PLAYERS_TO_START,
  createRoom,
  createSeedRooms,
  findRoomByCode,
  isFull,
  leaveRoom,
  pickQuickPlayRoom,
  refreshOccupancy,
  resolveJoinCode,
  updatePlayers,
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

type Lobby = { code: string; host: boolean; started: boolean };
type Dialog = { kind: "create"; area: StatusArea } | { kind: "password"; code: string; area: StatusArea } | null;

const DEFAULT_NICKNAME = "Corail_418";
const QUICK_PLAY_DELAY_MS = 900;
const SEMI_PRIVATE_DELAY_MS = 1600;
const LOBBY_FILL_INTERVAL_MS = 2500;
const SCROLL_DELAY_WITH_TRANSITION_MS = 380;
const SCROLL_DELAY_MS = 30;

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
  rooms: Room[];
  lobby: Lobby | null;
  lobbyRoom: Room | undefined;
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
  selectedRoomCode: string | null;
  setSelectedRoomCode: (code: string | null) => void;
  quickPlay: () => void;
  joinWithCode: (rawCode: string) => boolean;
  joinRoom: (room: Room, area: StatusArea) => void;
  submitRoomPassword: (password: string) => boolean;
  openCreateRoom: (area: StatusArea) => void;
  submitNewRoom: (input: NewRoomInput) => boolean;
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
 * État du jeu (maquette locale) : mode de connexion, pilote, salons, salle d'attente,
 * fenêtres et boîtes de dialogue. Les règles vivent dans `rooms.ts` ; ici, on orchestre.
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
  const [rooms, setRooms] = useState<Room[]>(createSeedRooms);
  const roomsRef = useRef(rooms);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [statuses, setStatuses] = useState<Partial<Record<StatusArea, Status>>>(() =>
    socialSignInFailed ? { auth: { message: "La connexion a échoué. Réessaie.", error: true } } : {},
  );
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [roomsQuery, setRoomsQuery] = useState("");
  const [roomsPageIndex, setRoomsPageIndex] = useState(0);
  const [selectedRoomCode, setSelectedRoomCode] = useState<string | null>(null);

  const playerName = mode === "auth" && account ? account.name : nickname.trim();

  /** Les minuteries lisent toujours la liste à jour grâce à la référence. */
  const updateRooms = useCallback((update: (rooms: Room[]) => Room[]) => {
    roomsRef.current = update(roomsRef.current);
    setRooms(roomsRef.current);
  }, []);

  const say = useCallback((area: StatusArea, message: string, error = false) => {
    setStatuses((current) => ({ ...current, [area]: { message, error } }));
  }, []);

  const hush = useCallback((area: StatusArea) => {
    setStatuses((current) => ({ ...current, [area]: undefined }));
  }, []);

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

  function openRooms() {
    hush("rooms");
    setRoomsQuery("");
    setRoomsPageIndex(0);
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
    setLobby({ code: room.code, host, started: false });
    hush("lobby");
    showWindow("lobby");
    if (message) say("lobby", message);
    else if (!host) say("lobby", "Sur la grille : en attente que l'hôte donne le départ…");
  }

  function joinAndEnter(room: Room) {
    updateRooms((current) => updatePlayers(current, room.code, 1));
    enterLobby(room, false);
  }

  function leaveLobby() {
    if (lobby) updateRooms((current) => leaveRoom(current, lobby.code));
    setLobby(null);
    showWindow("home", playButtonRef.current);
  }

  const lobbyRoom = lobby ? findRoomByCode(rooms, lobby.code) : undefined;

  function startRace() {
    if (!lobby || !lobbyRoom) return;
    if (lobbyRoom.players < MIN_PLAYERS_TO_START) {
      say("lobby", "Il faut au moins 2 pilotes pour donner le départ.", true);
      return;
    }
    setLobby({ ...lobby, started: true });
    say("lobby", "3… 2… 1… Partez ! (maquette : la page de course viendra ici)");
  }

  function copyLobbyCode() {
    if (!lobby) return;
    const { code } = lobby;
    const fallback = () => say("lobby", `Copie impossible ici : note le code ${code}.`);
    if (!navigator.clipboard?.writeText) return fallback();
    navigator.clipboard.writeText(code).then(() => say("lobby", `Code ${code} copié. Envoie-le à tes amis.`), fallback);
  }

  // D'autres pilotes (anonymes) arrivent de temps en temps tant que la course n'a pas démarré.
  const fillingCode = lobby && !lobby.started ? lobby.code : null;
  useEffect(() => {
    if (!fillingCode) return;
    const timer = setInterval(() => {
      if (Math.random() < 0.5) {
        updateRooms((current) => {
          const room = findRoomByCode(current, fillingCode);
          return room && !isFull(room) ? updatePlayers(current, fillingCode, 1) : current;
        });
      }
    }, LOBBY_FILL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fillingCode, updateRooms]);

  /* ---------- Rejoindre ---------- */

  /** Rejoindre depuis l'interface : vérifie d'abord le pilote. */
  function joinRoom(room: Room, area: StatusArea) {
    if (busy || !checkPlayer(area)) return;
    tryJoin(room, area);
  }

  function tryJoin(room: Room, area: StatusArea) {
    if (isFull(room)) return say(area, `« ${room.name} » est complet.`, true);
    if (room.visibility === "private") {
      hush("password");
      setDialog({ kind: "password", code: room.code, area });
      return;
    }
    if (room.visibility === "semi") {
      say(area, `Demande envoyée à l'hôte de « ${room.name} »… En attente de sa réponse.`);
      setBusy(true);
      setTimeout(() => {
        setBusy(false);
        const latest = findRoomByCode(roomsRef.current, room.code);
        if (!latest || isFull(latest)) return say(area, `« ${room.name} » s'est rempli entre-temps.`, true);
        joinAndEnter(latest);
      }, SEMI_PRIVATE_DELAY_MS);
      return;
    }
    joinAndEnter(room);
  }

  /** Renvoie false seulement si le code est refusé : le formulaire remet alors le focus sur son champ. */
  function joinWithCode(rawCode: string): boolean {
    if (busy || !checkPlayer("home")) return true;
    const result = resolveJoinCode(roomsRef.current, rawCode);
    if ("error" in result) {
      say("home", result.error, true);
      return false;
    }
    tryJoin(result.room, "home");
    return true;
  }

  function submitRoomPassword(password: string): boolean {
    const room = dialog?.kind === "password" ? findRoomByCode(roomsRef.current, dialog.code) : undefined;
    if (!room) return false;
    if (!password) {
      say("password", "Entre le mot de passe.", true);
      return false;
    }
    if (password !== room.password) {
      say("password", "Mot de passe incorrect.", true);
      return false;
    }
    setDialog(null);
    joinAndEnter(room);
    return true;
  }

  /* ---------- JOUER : partie rapide ---------- */

  function quickPlay() {
    if (busy || !checkPlayer("home")) return;
    setBusy(true);
    say("home", "Recherche d'un salon public…");
    setTimeout(() => {
      setBusy(false);
      const room = pickQuickPlayRoom(roomsRef.current);
      if (room) return joinAndEnter(room);
      const own = createRoom(roomsRef.current, {
        name: `Salon de ${playerName}`,
        visibility: "public",
        password: "",
        maxPlayers: 8,
      });
      updateRooms((current) => [own, ...current]);
      enterLobby(own, true);
    }, QUICK_PLAY_DELAY_MS);
  }

  /* ---------- Créer un salon ---------- */

  function openCreateRoom(area: StatusArea) {
    if (!checkPlayer(area)) return;
    hush("create");
    setDialog({ kind: "create", area });
  }

  function submitNewRoom(input: NewRoomInput): boolean {
    const error = validateNewRoom(input);
    if (error) {
      say("create", error, true);
      return false;
    }
    const room = createRoom(roomsRef.current, input);
    updateRooms((current) => [room, ...current]);
    setDialog(null);
    const shareHint = room.visibility === "private" ? " et le mot de passe." : ".";
    enterLobby(
      room,
      true,
      room.visibility === "public"
        ? "Salon créé : il apparaît dans la liste des salons publics."
        : `Salon créé. Il n'apparaît pas dans la liste : partage le code ${room.code}${shareHint}`,
    );
    return true;
  }

  function refreshRooms() {
    updateRooms((current) => refreshOccupancy(current));
    say("rooms", "Liste actualisée.");
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
    rooms,
    lobby,
    lobbyRoom,
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
    selectedRoomCode,
    setSelectedRoomCode,
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
