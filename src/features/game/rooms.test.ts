import { describe, expect, test } from "bun:test";
import {
  createRoom,
  createSeedRooms,
  generateRoomCode,
  layoutRoomGrid,
  leaveRoom,
  listOpenPublicRooms,
  normalizeRoomCode,
  paginateRooms,
  pickQuickPlayRoom,
  refreshOccupancy,
  resolveJoinCode,
  validateNewRoom,
  validateNickname,
  type Room,
} from "./rooms";

const room = (overrides: Partial<Room>): Room => ({
  code: "A1B2",
  name: "Test",
  visibility: "public",
  players: 1,
  maxPlayers: 8,
  mode: "Grand Prix",
  ...overrides,
});

/** Source aléatoire qui rejoue une suite de valeurs. */
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe("validateNickname", () => {
  test("accepte un surnom simple", () => expect(validateNickname("Corail_418")).toBeNull());
  test("refuse un surnom trop court", () => expect(validateNickname(" a ")).toContain("au moins 2"));
  test("refuse les caractères spéciaux", () => expect(validateNickname("<script>")).toContain("ne peut contenir"));
});

describe("codes de salon", () => {
  test("normalizeRoomCode garde majuscules et chiffres", () => expect(normalizeRoomCode("k7-q2 ")).toBe("K7Q2"));

  test("resolveJoinCode trouve le salon", () => {
    const rooms = createSeedRooms();
    expect(resolveJoinCode(rooms, " s100 ")).toEqual({ room: rooms[0] });
  });

  test("resolveJoinCode explique chaque erreur", () => {
    const rooms = createSeedRooms();
    expect(resolveJoinCode(rooms, "")).toEqual({ error: "Entre le code du salon." });
    expect(resolveJoinCode(rooms, "K7")).toMatchObject({ error: expect.stringContaining("4 caractères") });
    expect(resolveJoinCode(rooms, "ZZ99")).toMatchObject({ error: expect.stringContaining("ZZ99") });
  });

  test("generateRoomCode évite un code déjà pris", () => {
    // Premier tirage : A0A0 (déjà pris), second : B1B1.
    const random = sequence(0, 0, 0, 0, 1 / 24, 0.1, 1 / 24, 0.1);
    expect(generateRoomCode([room({ code: "A0A0" })], random)).toBe("B1B1");
  });
});

describe("création de salon", () => {
  const input = { name: "Mon salon", visibility: "private" as const, password: "abcd", maxPlayers: 6 };

  test("validateNewRoom exige un nom et un mot de passe pour un salon privé", () => {
    expect(validateNewRoom(input)).toBeNull();
    expect(validateNewRoom({ ...input, name: "x" })).toContain("nom");
    expect(validateNewRoom({ ...input, password: "abc" })).toContain("mot de passe");
    expect(validateNewRoom({ ...input, visibility: "public", password: "" })).toBeNull();
  });

  test("createRoom crée un salon à soi avec une place prise", () => {
    const created = createRoom([], input, sequence(0.5));
    expect(created).toMatchObject({ name: "Mon salon", players: 1, maxPlayers: 6, mine: true, password: "abcd" });
    expect(created.code).toMatch(/^[A-Z]\d[A-Z]\d$/);
  });

  test("un salon public ne garde pas de mot de passe", () => {
    expect(createRoom([], { ...input, visibility: "public" }).password).toBeUndefined();
  });
});

describe("pickQuickPlayRoom", () => {
  test("choisit le salon public ouvert le plus rempli", () => {
    const rooms = [
      room({ code: "A", players: 2, maxPlayers: 8 }),
      room({ code: "B", players: 5, maxPlayers: 6 }),
      room({ code: "C", players: 4, maxPlayers: 4 }), // complet
      room({ code: "D", players: 7, maxPlayers: 8, visibility: "semi" }),
    ];
    expect(pickQuickPlayRoom(rooms)?.code).toBe("B");
  });

  test("renvoie null s'il n'y a aucun salon public ouvert", () => {
    expect(pickQuickPlayRoom([room({ players: 8 })])).toBeNull();
  });
});

describe("listOpenPublicRooms", () => {
  test("filtre les salons publics non complets selon la recherche", () => {
    const names = listOpenPublicRooms(createSeedRooms(), "SO").map((r) => r.name);
    expect(names).toEqual(["Soft cream"]);
  });
});

describe("leaveRoom et refreshOccupancy", () => {
  test("quitter son propre salon vide le supprime", () => {
    expect(leaveRoom([room({ code: "M", mine: true, players: 1 })], "M")).toEqual([]);
  });

  test("quitter le salon d'un autre libère une place", () => {
    expect(leaveRoom([room({ code: "X", players: 3 })], "X")[0].players).toBe(2);
  });

  test("actualiser reste entre 1 et le maximum et ne touche pas à ses salons", () => {
    const rooms = [room({ players: 8 }), room({ players: 1 }), room({ players: 3, mine: true })];
    const refreshed = refreshOccupancy(rooms, sequence(1, 0, 1));
    expect(refreshed.map((r) => r.players)).toEqual([8, 1, 3]);
  });
});

describe("grille des salons", () => {
  test("paginateRooms garde 16 cases sur une seule page", () => {
    const list = Array.from({ length: 16 }, (_, i) => room({ code: String(i) }));
    expect(paginateRooms(list, 0)).toMatchObject({ pageCount: 1, perPage: 16 });
  });

  test("paginateRooms réserve une case « suite » au-delà de 16", () => {
    const list = Array.from({ length: 20 }, (_, i) => room({ code: String(i) }));
    const second = paginateRooms(list, 1);
    expect(second).toMatchObject({ pageCount: 2, perPage: 15, page: 1 });
    expect(second.shown).toHaveLength(5);
    expect(paginateRooms(list, 5).page).toBe(0);
  });

  test("layoutRoomGrid place les cases autour du centre, dans le sens horaire", () => {
    const layout = layoutRoomGrid(4);
    expect(layout.slots).toEqual([
      { gridRow: "1 / 2", gridColumn: "1 / 13" },
      { gridRow: "2 / 14", gridColumn: "10 / 13" },
      { gridRow: "14 / 15", gridColumn: "1 / 13" },
      { gridRow: "2 / 14", gridColumn: "1 / 4" },
    ]);
    expect(layout.center).toEqual({ gridRow: "2 / 14", gridColumn: "4 / 10" });
  });

  test("layoutRoomGrid sans case du haut commence le centre à la ligne 1", () => {
    expect(layoutRoomGrid(0).center).toEqual({ gridRow: "1 / 13", gridColumn: "1 / 13" });
  });
});
