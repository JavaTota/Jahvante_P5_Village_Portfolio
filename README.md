# Jahvantè Town — Interactive p5.js Portfolio

A playable pixel-art village. Explore buildings to learn about Jahvantè's software projects, work experience, and credentials. Talk to interactive villagers for personal trivia.

## Run locally

No `npm install` and no frameworks required.

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/ in a browser.

To deploy the folder to Vercel, choose **Other** as the framework, leave the build command empty and select the project root as the output directory. A `vercel.json` is included. Don't deploy private PDFs or letters that you don't want to share publicly.

## Controls

- Click/tap **ground** to walk there automatically.
- Click/tap a **house** to walk to its entrance and open it.
- Click/tap an **NPC** to walk next to the villager and start a conversation.
- **WASD / arrow keys** move manually and cancel automatic movement.
- Near a villager: press **E / Enter / Space**, or click **TALK**.
- Near a house: press **E / Enter / Space**, or click **ENTER**.
- In the conversation popup: **ANOTHER FACT** gives a different fact; **BYE** or **Escape** closes it.
- The building directory on the right is an accessible shortcut to each room.

Each NPC draws facts from the same shuffled deck of seven different curiosities. No fact is repeated until the deck is exhausted, including between NPCs. Each new cycle also avoids repeating the immediately previous fact.

## Project layout

```text
index.html                  Web page layout & accessible conversation markup
styles.css                  All responsive visual styles
vercel.json                 Static hosting configuration
assets/                     Local p5 runtime, badges, certificates, sounds
js/
  main.js                   Bootstraps the p5 village
  data/
    content.js              Portfolio work, projects, buildings and badges
    npcs.js                 Villager definitions + seven personal facts
  game/
    config.js               Map dimensions and appearance
    character.js            Player sprite
    npcCharacters.js        Villager sprites and hit detection
    curiosityDeck.js        Non-repeating random fact logic
    logic.js                Physics, movement, collision, proximity
    navigation.js           Click-to-move routing and paths to NPCs
    scenery.js              Grass, paths, trees, buildings, pond
    collectable.js          Tech collectibles
    sketch.js               Main p5 setup/draw/input loop
  ui/
    controls.js             Buttons, village guide and sound
    npcDialogue.js          Accessible conversation popup
    panels.js               Portfolio building content panels
  tests/
    curiosityDeck.test.mjs  Tests unique and non-repeating facts
    npcNavigation.test.mjs   Checks paths to each villager
  tools/
    build_standalone.py     Creates a single, offline playable HTML
```

## Customize villagers

Open **`js/data/npcs.js`**. Change names, coordinates, clothing colors, or entries in the `curiosities` array. You do not need to change the rendering or dialogue modules.

## Generate an offline playable file

```bash
python3 tools/build_standalone.py
```

The generated `playable-npc-village.html` embeds its assets. This standalone file is intended for local sharing; deploy the structured source files to Vercel instead.

## Privacy

The public project contains basic contact links, portfolio information, selected certificates and specialist badges. Full letters of recommendation and sensitive source certificates with birth dates are not shipped.
