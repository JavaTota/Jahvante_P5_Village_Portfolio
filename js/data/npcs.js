/**
 * Villagers and conversation facts.
 *
 * Coordinates are in MAP TILES, not pixels. To add another villager,
 * add one entry to `villagers`. To add a fact, add one entry to `curiosities`.
 * No changes to the game loop are necessary.
 */
export const villagers = [
  {
    id: "mira",
    name: "Mira",
    title: "The adventurer",
    x: 30,
    y: 54,
    coat: "#e89c72",
    hair: "#544a50",
  },
  {
    id: "leo",
    name: "Leo",
    title: "The gamer",
    x: 39,
    y: 25,
    coat: "#7097d5",
    hair: "#364c63",
  },
  {
    id: "nina",
    name: "Nina",
    title: "The teammate",
    x: 22,
    y: 20,
    coat: "#bc86bc",
    hair: "#523b45",
  },
  {
    id: "max",
    name: "Max",
    title: "The storyteller",
    x: 42,
    y: 21,
    coat: "#70a77e",
    hair: "#564538",
  },
];

// Each fact appears once per full conversation cycle, across ALL villagers.
export const curiosities = [
  {
    id: "fantasy",
    text: "Jahvantè loves fantasy games and getting lost in big fictional worlds.",
  },
  {
    id: "league",
    text: "He plays League of Legends and has reached Gold rank.",
  },
  {
    id: "aphelios",
    text: "His Aphelios mastery in League of Legends has passed one million points.",
  },
  {
    id: "rugby",
    text: "Before software development, Jahvantè used to play rugby.",
  },
  {
    id: "regional",
    text: "He once placed fourth in a regional competition in Genoa.",
  },
  { id: "genoa", text: "He lived in Genoa, Italy, for 16 years." },
  { id: "acting", text: "He studied acting for film and television." },
];
