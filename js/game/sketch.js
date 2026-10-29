/**
 * Main p5.js game loop.
 *
 * Game responsibilities remain separate:
 * - logic.js         → walking and collisions
 * - navigation.js    → click-to-move / pathfinding
 * - npcCharacters.js → drawing and proximity of villagers
 * - curiosityDeck.js → non-repeating facts
 * - npcDialogue.js   → accessible NPC conversation UI
 * - scenery.js       → ground, trees, buildings and pond
 */

import { defaultCharacterId, getCharacterById } from "../data/characters.js";

import { WIDTH, HEIGHT, TILE, COLS, ROWS } from "./config.js";

import {
  makePlayer,
  updatePlayer,
  nearbyBuilding,
  cameraFor,
  teleportSquare,
  teleportToDoor,
} from "./logic.js";

import { drawGround, drawDecorations, drawBuildings, pond } from "./scenery.js";

import { drawAlienCharacter } from "./character.js";

import {
  drawVillagers,
  findNearbyVillager,
  hitVillager,
} from "./npcCharacters.js";

import { createCuriosityDeck } from "./curiosityDeck.js";

import {
  initialCollectables,
  drawCollectables,
  collectOnTouch,
} from "./collectable.js";

import { buildings } from "../data/content.js";

import { createClickNavigation, hitBuilding } from "./navigation.js";

import { openPanel, isPanelOpen, onPanelChange } from "../ui/panels.js";

import { createNPCDialogue } from "../ui/npcDialogue.js";

import {
  buildDirectory,
  updateGuide,
  bindEnter,
  bindTalk,
  bindMovement,
  createSoundControls,
  showToast,
} from "../ui/controls.js";

/* =========================================
   KEYBOARD CONTROLS
   ========================================= */

const directionKeys = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",

  w: "up",
  a: "left",
  s: "down",
  d: "right",

  W: "up",
  A: "left",
  S: "down",
  D: "right",
};

/**
 * Convert a keyboard key into a movement direction.
 */
function directionFromKey(p) {
  const mapped = directionKeys[p.key];

  if (mapped) {
    return mapped;
  }

  const codes = {
    38: "up",
    40: "down",
    37: "left",
    39: "right",
  };

  return codes[p.keyCode] || null;
}

/* =========================================
   MAIN GAME INITIALIZATION
   ========================================= */

/**
 * Start the portfolio game.
 *
 * @param {Object} selectedCharacter
 * Character chosen in the selection screen.
 */
export function mountGame(
  selectedCharacter = getCharacterById(defaultCharacterId),
) {
  // Check that p5.js is available.
  if (typeof window.p5 !== "function") {
    throw new Error("p5.js did not load. Confirm assets/p5.min.js exists.");
  }

  /* =========================================
     PLAYER INITIALIZATION
     ========================================= */

  // Create the player using existing movement logic.
  const player = makePlayer();

  // Save the character selected by the user.
  // The renderer will use this in the next step.
  player.character = getCharacterById(
    selectedCharacter?.id ?? defaultCharacterId,
  );

  /* =========================================
     GAME STATE
     ========================================= */

  const keysHeld = new Set();

  const tokens = initialCollectables.map((token) => ({ ...token }));

  const visitedBuildings = new Set();

  const factDeck = createCuriosityDeck();

  const sound = createSoundControls();

  let nearbyHouse = null;
  let nearbyNPC = null;

  let camera = {
    x: 0,
    y: 0,
  };

  /* =========================================
     NPC DIALOGUE SYSTEM
     ========================================= */

  const dialogue = createNPCDialogue(
    () => factDeck.next(),

    (open) => {
      if (open) {
        keysHeld.clear();
        navigator.reset();
      }
    },
  );

  /* =========================================
     CLICK-TO-MOVE NAVIGATION
     ========================================= */

  const navigator = createClickNavigation(
    player,
    pond,

    (buildingId) => enterBuilding(buildingId),

    (npc) => talkToVillager(npc),
  );

  /**
   * Return true when an interface panel is open.
   */
  function hasOverlay() {
    return isPanelOpen() || dialogue.isOpen();
  }

  /**
   * Detect nearby buildings and NPCs.
   */
  function updateNearby() {
    nearbyHouse = nearbyBuilding(player);

    nearbyNPC = findNearbyVillager(player);

    updateGuide(nearbyHouse, visitedBuildings.size, nearbyNPC);
  }

  /* =========================================
     BUILDING INTERACTIONS
     ========================================= */

  /**
   * Enter a building and display its content.
   */
  function enterBuilding(id) {
    const building = buildings.find((entry) => entry.id === id);

    if (!building || hasOverlay()) {
      return;
    }

    visitedBuildings.add(id);

    navigator.reset();
    keysHeld.clear();

    updateNearby();

    openPanel(id);

    sound.play("enter");
  }

  /* =========================================
     NPC INTERACTIONS
     ========================================= */

  /**
   * Start a conversation with a villager.
   */
  function talkToVillager(npc) {
    if (!npc || hasOverlay()) {
      return;
    }

    keysHeld.clear();

    navigator.reset();

    dialogue.talkTo(npc);
  }

  /* =========================================
     MOVEMENT CONTROLS
     ========================================= */

  /**
   * Handle continuous movement.
   */
  function setHeld(direction, held) {
    if (hasOverlay()) {
      return;
    }

    if (held) {
      navigator.reset();
      keysHeld.add(direction);
    } else {
      keysHeld.delete(direction);
    }
  }

  /**
   * Move the character one short step.
   */
  function nudge(direction) {
    if (hasOverlay()) {
      return;
    }

    navigator.reset();

    updatePlayer(player, new Set([direction]), 3, pond);

    updateNearby();
  }

  /* =========================================
     WEBSITE NAVIGATION
     ========================================= */

  // Allow visitors to open sections directly
  // without having to walk through the village.

  buildDirectory((building) => {
    if (hasOverlay()) {
      return;
    }

    navigator.reset();

    teleportToDoor(player, building);

    updateNearby();

    enterBuilding(building.id);
  });

  // Connect keyboard and interface interactions.
  bindEnter(() => nearbyHouse, enterBuilding);

  bindTalk(() => nearbyNPC, talkToVillager);

  bindMovement(setHeld, nudge);

  // Stop player movement when a panel opens.
  onPanelChange((open) => {
    if (open) {
      keysHeld.clear();
      navigator.reset();
    }
  });

  /* =========================================
     RETURN TO TOWN SQUARE
     ========================================= */

  const stage = document.getElementById("game-stage");

  document.getElementById("return-to-square").addEventListener("click", () => {
    if (hasOverlay()) {
      return;
    }

    navigator.reset();

    teleportSquare(player);

    keysHeld.clear();

    updateNearby();

    stage.focus({
      preventScroll: true,
    });
  });

  // Restore keyboard focus after clicking the game.
  stage.addEventListener("click", () => {
    if (!hasOverlay()) {
      stage.focus({
        preventScroll: true,
      });
    }
  });

  /* =========================================
     P5.JS SKETCH
     ========================================= */

  const sketch = (p) => {
    /* =========================================
       SETUP
       ========================================= */

    p.setup = () => {
      const canvas = p.createCanvas(WIDTH, HEIGHT);

      canvas.parent("game-canvas");

      p.pixelDensity(1);
      p.noSmooth();
      p.frameRate(60);
      p.textFont("monospace");

      camera = cameraFor(player);

      updateNearby();
    };

    /* =========================================
       MAIN DRAW LOOP
       ========================================= */

    p.draw = () => {
      const dt = Math.min(2, p.deltaTime / 16.667 || 1);

      /* =====================================
         UPDATE PLAYER
         ===================================== */

      if (!hasOverlay()) {
        // Keyboard movement takes priority.
        if (keysHeld.size) {
          updatePlayer(player, keysHeld, dt, pond);
        } else {
          navigator.tick(dt);
        }

        updateNearby();

        /* ===================================
           COLLECTABLES
           =================================== */

        const collected = collectOnTouch(player, tokens, TILE);

        if (collected) {
          showToast(`+1 TOKEN FOUND: ${collected.label.toUpperCase()}`);

          sound.play("collect");
        }
      }

      /* =====================================
         CAMERA MOVEMENT
         ===================================== */

      const cameraTarget = cameraFor(player);

      camera.x += (cameraTarget.x - camera.x) * 0.22;

      camera.y += (cameraTarget.y - camera.y) * 0.22;

      /* =====================================
         DRAW WORLD
         ===================================== */

      p.push();

      p.translate(-Math.round(camera.x), -Math.round(camera.y));

      drawGround(p, camera);

      drawDecorations(p);

      drawBuildings(p, nearbyHouse);

      drawVillagers(p, p.millis(), nearbyNPC);

      drawCollectables(p, tokens, TILE, p.millis());

      drawDestination(p, navigator.getDestination(), p.millis());

      /* =====================================
         DRAW PLAYER
         ===================================== */

      // Character choice is stored in
      // player.character.
      //
      // We'll update character.js next
      // to render the selected character.

      drawAlienCharacter(p, player);

      p.pop();

      /* =====================================
         MINIMAP
         ===================================== */

      drawMiniMap(p, player, tokens.filter((token) => token.found).length);
    };

    /* =========================================
       KEYBOARD INPUT
       ========================================= */

    p.keyPressed = () => {
      if (hasOverlay()) {
        return;
      }

      const direction = directionFromKey(p);

      if (direction) {
        navigator.reset();

        keysHeld.add(direction);

        return false;
      }

      // Interaction keys:
      // E, Enter, or Space.

      const interact =
        p.key === "e" || p.key === "E" || p.keyCode === 13 || p.keyCode === 32;

      if (interact) {
        if (nearbyNPC) {
          talkToVillager(nearbyNPC);
        } else if (nearbyHouse) {
          enterBuilding(nearbyHouse.id);
        }

        return false;
      }
    };

    p.keyReleased = () => {
      const direction = directionFromKey(p);

      if (direction) {
        keysHeld.delete(direction);

        return false;
      }
    };

    /* =========================================
       MOUSE / TOUCH NAVIGATION
       ========================================= */

    /**
     * Handle clicking or tapping the game map.
     */
    function handleMapClick(screenX, screenY) {
      if (hasOverlay()) {
        return;
      }

      // Ignore clicks outside the game canvas.
      if (screenX < 0 || screenY < 0 || screenX >= WIDTH || screenY >= HEIGHT) {
        return;
      }

      // Convert screen coordinates into
      // world coordinates.

      const x = screenX + camera.x;
      const y = screenY + camera.y;

      // Check if an NPC or building was clicked.
      const npc = hitVillager(x, y);

      const building = hitBuilding(x, y);

      // NPCs take priority over terrain clicks.
      const reached = npc
        ? navigator.navigateToNPC(npc)
        : navigator.navigateTo(x, y, building);

      if (!reached) {
        showToast("THAT SPOT IS OUT OF REACH");
      }

      if (!hasOverlay()) {
        stage.focus({
          preventScroll: true,
        });
      }
    }

    /**
     * Mouse click movement.
     */
    p.mousePressed = () => {
      handleMapClick(p.mouseX, p.mouseY);

      return false;
    };

    /**
     * Touchscreen movement.
     */
    p.touchStarted = () => {
      const touch = p.touches[0];

      handleMapClick(touch?.x ?? p.mouseX, touch?.y ?? p.mouseY);

      return false;
    };
  };

  /* =========================================
     CREATE P5.JS INSTANCE
     ========================================= */

  const game = new window.p5(sketch);

  /* =========================================
     DEEP-LINK SUPPORT
     ========================================= */

  // Allow direct navigation to a building
  // through a URL hash.

  const initialRoomId = location.hash.slice(1);

  const initialBuilding = buildings.find(
    (building) => building.id === initialRoomId,
  );

  if (initialBuilding) {
    teleportToDoor(player, initialBuilding);

    requestAnimationFrame(() => {
      updateNearby();

      enterBuilding(initialBuilding.id);
    });
  }

  /* =========================================
     CLEANUP
     ========================================= */

  return () => game.remove();
}

/* =========================================
   MINIMAP RENDERING
   ========================================= */

/**
 * Draw the small village map.
 */
function drawMiniMap(p, player, collectedCount) {
  p.noStroke();

  p.fill(14, 43, 51, 220);

  p.rect(WIDTH - 159, 58, 137, 102);

  // Map heading.
  p.fill("#e6ebd6");

  p.textAlign(p.LEFT, p.TOP);

  p.textSize(10);

  p.text("TOWN MAP", WIDTH - 147, 65);

  // Map position and scaling.
  const mapX = WIDTH - 147;
  const mapY = 83;

  const scaleX = 113 / (COLS * TILE);
  const scaleY = 63 / (ROWS * TILE);

  // Map background.
  p.fill("#527a62");

  p.rect(mapX, mapY, 113, 63);

  // Show village buildings.
  for (const building of buildings) {
    p.fill(building.color);

    p.rect(
      mapX + building.x * TILE * scaleX,
      mapY + building.y * TILE * scaleY,

      Math.max(4, building.w * TILE * scaleX),

      Math.max(4, building.h * TILE * scaleY),
    );
  }

  // Show player position.
  p.fill("#ffe989");

  p.rect(mapX + player.x * scaleX - 2, mapY + player.y * scaleY - 2, 5, 5);

  // Token counter.
  p.fill("#e6ebd6");

  p.textSize(9);

  p.textAlign(p.LEFT, p.TOP);

  p.text(`TOKENS ${collectedCount}/5`, WIDTH - 147, 150);
}

/* =========================================
   CLICK DESTINATION MARKER
   ========================================= */

/**
 * Draw a marker where the player clicked.
 */
function drawDestination(p, destination, time) {
  if (!destination) {
    return;
  }

  p.push();

  p.noFill();
  p.stroke("#fff1a3");
  p.strokeWeight(3);

  const pulse = 13 + Math.sin(time / 200) * 2;

  p.ellipse(destination.x, destination.y, pulse, pulse / 2);

  p.noStroke();
  p.fill("#173d43");

  p.rect(destination.x - 2, destination.y - 2, 4, 4);

  p.pop();
}
