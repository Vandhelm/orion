import { describe, expect, test } from "bun:test";
import {
  layoutRoomGrid,
  listOpenPublicRooms,
  normalizeRoomCode,
  paginateRooms,
  pickQuickPlayRoom,
  randomRoomCode,
  validateJoinCode,
  validateNewRoom,
  validateNickname,
  type Room,
} from "./rooms";

const room = (overrides: Partial<Room>): Room => ({
  id: "A1B2",
  name: "Test",
  visibility: "public",
  players: 1,
  maxPlayers: 8,
  mode: "Grand Prix",
  language: "fr",
  bots: false,
  ...overrides,
});

describe("validateNickname", () => {
  test("accepte un surnom simple", () => expect(validateNickname("Corail_418")).toBeNull());
  test("refuse un surnom trop court", () => expect(validateNickname(" a ")).toContain("au moins 2"));
  test("refuse un surnom trop long", () => expect(validateNickname("x".repeat(19))).toContain("au plus"));
  test("refuse les caractères spéciaux", () => expect(validateNickname("<script>")).toContain("ne peut contenir"));
});

describe("codes de salon", () => {
  test("normalizeRoomCode garde majuscules et chiffres", () => expect(normalizeRoomCode("k7-q2 ")).toBe("K7Q2"));

  test("validateJoinCode accepte et normalise un code", () => expect(validateJoinCode(" k7q2 ")).toEqual({ code: "K7Q2" }));

  test("validateJoinCode explique chaque erreur", () => {
    expect(validateJoinCode("")).toEqual({ error: "Entre le code du salon." });
    expect(validateJoinCode("K7")).toMatchObject({ error: expect.stringContaining("4 caractères") });
  });

  test("randomRoomCode suit le format lettre-chiffre-lettre-chiffre", () => {
    expect(randomRoomCode(() => 0)).toBe("A0A0");
    expect(randomRoomCode()).toMatch(/^[A-Z]\d[A-Z]\d$/);
  });
});

describe("validateNewRoom", () => {
  const input = { name: "Mon salon", visibility: "private" as const, maxPlayers: 6, language: "fr" as const, bots: true };

  test("accepte un salon valide", () => {
    expect(validateNewRoom(input)).toBeNull();
    expect(validateNewRoom({ ...input, visibility: "semi-public" })).toBeNull();
  });

  test("refuse un nom trop court ou trop long", () => {
    expect(validateNewRoom({ ...input, name: "x" })).toContain("nom");
    expect(validateNewRoom({ ...input, name: "x".repeat(29) })).toContain("au plus");
  });

  test("refuse une visibilité, un nombre de places, une langue ou des bots inventés", () => {
    expect(validateNewRoom({ ...input, visibility: "secret" as never })).toContain("qui peut entrer");
    expect(validateNewRoom({ ...input, maxPlayers: 99 })).toContain("places");
    expect(validateNewRoom({ ...input, language: "xx" as never })).toContain("langue");
    expect(validateNewRoom({ ...input, bots: "oui" as never })).toContain("bots");
  });
});

describe("pickQuickPlayRoom", () => {
  test("choisit le salon public ouvert le plus rempli", () => {
    const rooms = [
      room({ id: "A", players: 2, maxPlayers: 8 }),
      room({ id: "B", players: 5, maxPlayers: 6 }),
      room({ id: "C", players: 4, maxPlayers: 4 }), // complet
      room({ id: "D", players: 7, maxPlayers: 8, visibility: "semi-public" }),
    ];
    expect(pickQuickPlayRoom(rooms)?.id).toBe("B");
  });

  test("renvoie null s'il n'y a aucun salon public ouvert", () => {
    expect(pickQuickPlayRoom([room({ players: 8 })])).toBeNull();
  });
});

describe("listOpenPublicRooms", () => {
  test("filtre les salons publics non complets selon la recherche", () => {
    const rooms = [
      room({ id: "A", name: "Soft cream" }),
      room({ id: "B", name: "Sorbet", players: 8 }),
      room({ id: "C", name: "Soupe", visibility: "private" }),
    ];
    expect(listOpenPublicRooms(rooms, "SO").map((r) => r.id)).toEqual(["A"]);
  });
});

describe("grille des salons", () => {
  test("paginateRooms garde 16 cases sur une seule page", () => {
    const list = Array.from({ length: 16 }, (_, i) => room({ id: String(i) }));
    expect(paginateRooms(list, 0)).toMatchObject({ pageCount: 1, perPage: 16 });
  });

  test("paginateRooms réserve une case « suite » au-delà de 16", () => {
    const list = Array.from({ length: 20 }, (_, i) => room({ id: String(i) }));
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
