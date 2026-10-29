export const characters = [
  {
    id: "jahvante",
    name: "Jahvantè",
    title: "The Developer",
    description: "Explore the village as its creator.",
    portrait: "./assets/characters/jahvante.svg",
    sprite: "jahvante",
  },

  {
    id: "wife",
    name: "My Wife",
    title: "The Adventurer",
    description: "Explore the village as Jahvantè’s companion.",
    portrait: "./assets/characters/wife.svg",
    sprite: "wife",
  },

  {
    id: "nea",
    name: "Nea",
    title: "The Cat",
    description: "Explore the village on four paws.",
    portrait: "./assets/characters/nea.svg",
    sprite: "nea",
  },
];

export const defaultCharacterId = "jahvante";

/**
 * Find a character by its ID.
 * If the ID doesn't exist, return Jahvantè.
 */
export function getCharacterById(id) {
  return characters.find((character) => character.id === id) ?? characters[0];
}
