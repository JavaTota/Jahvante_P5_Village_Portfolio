# Jahvantè Town — A Portfolio You Can Play

**React + TypeScript + Vite + p5.js**. A two-world interactive developer portfolio, migrated from the supplied `Jahvante_P5_Village_Portfolio.zip`.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. Open this folder in VS Code.
3. Run `npm install`.
4. Run `npm run dev` and open the URL displayed by Vite.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

> **Environment note:** npm registry access was unavailable in the artifact creation environment; node dependencies were not installed there. TypeScript source and assets are included, but no `node_modules` or generated `dist` has been bundled. Run the commands above on a machine with npm access.

## Modes

- **Peaceful Village:** Choose Jahvantè, the Adventurer, or Nea. Move with WASD/arrows, click walkable terrain or a house, and press E at a door or villager. Find technology tokens. All six portfolio sections are available in the directory.
- **Black Knight:** Choose the knight for the lava map. Move with WASD/arrows, attack with Space, click, or the touch ATTACK button. Hostile enemies pursue you. Each defeat pauses the simulation and opens a portfolio section. Six wins lead to the larger résumé guardian, followed by the reunion with the wife and Nea. Lava deals damage and returns the character to a checkpoint.
- **Direct access:** All portfolio sections and the résumé are reachable from buttons regardless of game progression.

## Architecture

```text
src/
  App.tsx                      React app shell, state, routing between modes
  components/
    CharacterSelect.tsx        Character choice and pixel portraits
    GameCanvas.tsx             p5 lifecycle, keyboard input
    PortfolioPanel.tsx         Accessible portfolio dialogs
  data/
    characters.ts              Playable character metadata
    content.ts                 Portfolio data migrated from original source
  game/
    core/
      types.ts                 Typed game contracts and p5 surface
      geometry.ts              Math utilities and dimensions
      maps.ts                  Walkability, streets, lava, rocks
      pathfinding.ts           Road-weighted A* navigation
      engine.ts                One p5 instance, game state and events
    worlds/
      village.ts               Village rendering, NPCs and tokens
      volcano.ts               Lava environment and rescue scenery
    characters/sprites.ts     Pixel art sprites
    combat/combat.ts           Enemy AI and sword mechanics
    progression/progression.ts Unlock order and boss gate
  tests/game.test.ts           Core deterministic tests
public/assets/                All original résumé, credentials and sound assets
```

## Notes

- The code avoids claiming fabricated project results. Professional entries, projects, credentials, and URLs are carried over from the submitted archive.
- Portraits and world art are original SVG / p5 primitives and can be replaced with sprites later.
- The Black Knight mode is a **playable first implementation**, not a feature-complete indie game: the rescue cinematic is simplified, combat AI is intentionally lightweight, and sound design is not wired into the new engine yet.
- The original ZIP represents an earlier stage than the updated village and character-selection code discussed previously. This project reinstates character choice, separated village paths, sparsed NPCs and navigable house entrances in new TypeScript modules.
- To deploy to Vercel, choose framework **Vite**, build command `npm run build`, output directory `dist`.
