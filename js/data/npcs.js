/**
 * NPC definitions and personal curiosities.
 *
 * Responsibilities:
 * - Define villagers
 * - Store villager positions
 * - Store their appearances
 * - Provide interesting facts about Jahvantè
 *
 * Coordinates use MAP TILES, not pixels.
 *
 * To reposition an NPC, change its x and y.
 * To add a new fact, add an entry to curiosities.
 */

/* =========================================
   VILLAGERS
   ========================================= */

export const villagers = [
  {
    id: "mira",
    name: "Mira",
    title: "The Adventurer",

    // Northwest garden
    x: 19,
    y: 17,

    coat: "#e89c72",
    hair: "#544a50",
  },

  {
    id: "leo",
    name: "Leo",
    title: "The Gamer",

    // Northeast, near Skill Shop
    x: 58,
    y: 17,

    coat: "#7097d5",
    hair: "#364c63",
  },

  {
    id: "nina",
    name: "Nina",
    title: "The Teammate",

    // Southwest, near My Home
    x: 9,
    y: 36,

    coat: "#bc86bc",
    hair: "#523b45",
  },

  {
    id: "max",
    name: "Max",
    title: "The Storyteller",

    // Southeast, beyond the Post Office
    x: 55,
    y: 37,

    coat: "#70a77e",
    hair: "#564538",
  },
];

/* =========================================
   PERSONAL CURIOSITIES
   ========================================= */

/**
 * Interesting facts shared by villagers.
 *
 * The curiosityDeck.js module handles
 * randomizing facts and avoiding repetition.
 *
 * Each fact appears once per conversation cycle.
 */

export const curiosities = [
  {
    id: "fantasy",
    text:
      "Jahvantè loves fantasy games and getting " +
      "lost in big fictional worlds.",
  },

  {
    id: "league",
    text: "He plays League of Legends and has " + "reached Gold rank.",
  },

  {
    id: "aphelios",
    text:
      "His Aphelios mastery in League of Legends " +
      "has passed one million points.",
  },

  {
    id: "rugby",
    text: "Before software development, Jahvantè " + "used to play rugby.",
  },

  {
    id: "regional",
    text: "He once placed fourth in a regional " + "competition in Genoa.",
  },

  {
    id: "genoa",
    text: "He lived in Genoa, Italy, for 16 years.",
  },

  {
    id: "acting",
    text: "He studied acting for film and television.",
  },
];
