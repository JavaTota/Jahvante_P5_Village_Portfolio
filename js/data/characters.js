/**
 * Playable characters for Jahvantè Town.
 *
 * This file contains character information only.
 *
 * The character selection UI is handled by:
 * js/ui/characterSelect.js
 *
 * The playable sprites are handled by:
 * js/game/character.js
 */

/* =========================================
   CHARACTER DEFINITIONS
   ========================================= */

export const characters = [
  {
    id: "jahvante",

    name: "Jahvantè",

    title: "The Developer",

    description:
      "A full-stack developer who loves building " +
      "software, exploring new technologies, " +
      "and playing fantasy games.",

    // Portrait displayed during character selection.
    portrait: "./assets/characters/jahvante.svg",

    // Sprite identifier used by character.js.
    sprite: "jahvante",
  },

  {
    id: "wife",

    name: "My Wife",

    title: "The Adventurer",

    description:
      "Jahvantè’s partner in life and adventure. " +
      "Ready to explore the village and discover " +
      "its secrets.",

    portrait: "./assets/characters/wife.svg",

    sprite: "wife",
  },

  {
    id: "nea",

    name: "Nea",

    title: "The Cat",

    description:
      "A curious tabby cat with green eyes. " +
      "Explore the village on four paws " +
      "and discover its hidden corners.",

    portrait: "./assets/characters/nea.svg",

    sprite: "nea",
  },
];

/* =========================================
   DEFAULT CHARACTER
   ========================================= */

/**
 * Character selected when the menu first opens.
 */
export const defaultCharacterId = "jahvante";

/* =========================================
   CHARACTER LOOKUP
   ========================================= */

/**
 * Find a playable character by its ID.
 *
 * If the character cannot be found,
 * return the default character.
 *
 * @param {string} id - Character identifier
 * @returns {Object} Character information
 */
export function getCharacterById(id) {
  const character = characters.find((entry) => entry.id === id);

  return (
    character ?? characters.find((entry) => entry.id === defaultCharacterId)
  );
}
