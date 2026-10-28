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
import { WIDTH, HEIGHT, TILE, COLS, ROWS } from './config.js';
import { makePlayer, updatePlayer, nearbyBuilding, cameraFor, teleportSquare, teleportToDoor } from './logic.js';
import { drawGround, drawDecorations, drawBuildings, pond } from './scenery.js';
import { drawAlienCharacter } from './character.js';
import { drawVillagers, findNearbyVillager, hitVillager } from './npcCharacters.js';
import { createCuriosityDeck } from './curiosityDeck.js';
import { initialCollectables, drawCollectables, collectOnTouch } from './collectable.js';
import { buildings } from '../data/content.js';
import { createClickNavigation, hitBuilding } from './navigation.js';
import { openPanel, isPanelOpen, onPanelChange } from '../ui/panels.js';
import { createNPCDialogue } from '../ui/npcDialogue.js';
import { buildDirectory, updateGuide, bindEnter, bindTalk, bindMovement, createSoundControls, showToast } from '../ui/controls.js';

const directionKeys = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', a: 'left', s: 'down', d: 'right',
  W: 'up', A: 'left', S: 'down', D: 'right',
};

function directionFromKey(p) {
  const mapped = directionKeys[p.key];
  if (mapped) return mapped;

  const codes = { 38: 'up', 40: 'down', 37: 'left', 39: 'right' };
  return codes[p.keyCode] || null;
}

export function mountGame() {
  if (typeof window.p5 !== 'function') {
    throw new Error('p5.js did not load. Confirm assets/p5.min.js exists.');
  }

  const player = makePlayer();
  const keysHeld = new Set();
  const tokens = initialCollectables.map((token) => ({ ...token }));
  const visitedBuildings = new Set();
  const factDeck = createCuriosityDeck();
  const sound = createSoundControls();

  let nearbyHouse = null;
  let nearbyNPC = null;
  let camera = { x: 0, y: 0 };

  const dialogue = createNPCDialogue(() => factDeck.next(), (open) => {
    if (open) {
      keysHeld.clear();
      navigator.reset();
    }
  });

  const navigator = createClickNavigation(
    player,
    pond,
    (buildingId) => enterBuilding(buildingId),
    (npc) => talkToVillager(npc),
  );

  function hasOverlay() {
    return isPanelOpen() || dialogue.isOpen();
  }

  function updateNearby() {
    nearbyHouse = nearbyBuilding(player);
    nearbyNPC = findNearbyVillager(player);
    updateGuide(nearbyHouse, visitedBuildings.size, nearbyNPC);
  }

  function enterBuilding(id) {
    const building = buildings.find((entry) => entry.id === id);
    if (!building || hasOverlay()) return;

    visitedBuildings.add(id);
    navigator.reset();
    keysHeld.clear();
    updateNearby();
    openPanel(id);
    sound.play('enter');
  }

  function talkToVillager(npc) {
    if (!npc || hasOverlay()) return;

    keysHeld.clear();
    navigator.reset();
    dialogue.talkTo(npc);
  }

  function setHeld(direction, held) {
    if (hasOverlay()) return;
    if (held) {
      navigator.reset();
      keysHeld.add(direction);
    } else {
      keysHeld.delete(direction);
    }
  }

  function nudge(direction) {
    if (hasOverlay()) return;
    navigator.reset();
    updatePlayer(player, new Set([direction]), 3, pond);
    updateNearby();
  }

  // Building directory is a non-game navigation shortcut for recruiters.
  buildDirectory((building) => {
    if (hasOverlay()) return;
    navigator.reset();
    teleportToDoor(player, building);
    updateNearby();
    enterBuilding(building.id);
  });

  bindEnter(() => nearbyHouse, enterBuilding);
  bindTalk(() => nearbyNPC, talkToVillager);
  bindMovement(setHeld, nudge);
  onPanelChange((open) => {
    if (open) {
      keysHeld.clear();
      navigator.reset();
    }
  });

  const stage = document.getElementById('game-stage');
  document.getElementById('return-to-square').addEventListener('click', () => {
    if (hasOverlay()) return;
    navigator.reset();
    teleportSquare(player);
    keysHeld.clear();
    updateNearby();
    stage.focus({ preventScroll: true });
  });

  stage.addEventListener('click', () => {
    if (!hasOverlay()) stage.focus({ preventScroll: true });
  });

  const sketch = (p) => {
    p.setup = () => {
      const canvas = p.createCanvas(WIDTH, HEIGHT);
      canvas.parent('game-canvas');
      p.pixelDensity(1);
      p.noSmooth();
      p.frameRate(60);
      p.textFont('monospace');
      camera = cameraFor(player);
      updateNearby();
    };

    p.draw = () => {
      const dt = Math.min(2, p.deltaTime / 16.667 || 1);

      if (!hasOverlay()) {
        if (keysHeld.size) updatePlayer(player, keysHeld, dt, pond);
        else navigator.tick(dt);

        updateNearby();
        const collected = collectOnTouch(player, tokens, TILE);
        if (collected) {
          showToast(`+1 TOKEN FOUND: ${collected.label.toUpperCase()}`);
          sound.play('collect');
        }
      }

      const cameraTarget = cameraFor(player);
      camera.x += (cameraTarget.x - camera.x) * 0.22;
      camera.y += (cameraTarget.y - camera.y) * 0.22;

      p.push();
      p.translate(-Math.round(camera.x), -Math.round(camera.y));
      drawGround(p, camera);
      drawDecorations(p);
      drawBuildings(p, nearbyHouse);
      drawVillagers(p, p.millis(), nearbyNPC);
      drawCollectables(p, tokens, TILE, p.millis());
      drawDestination(p, navigator.getDestination(), p.millis());
      drawAlienCharacter(p, player);
      p.pop();

      drawMiniMap(p, player, tokens.filter((token) => token.found).length);
    };

    p.keyPressed = () => {
      if (hasOverlay()) return;

      const direction = directionFromKey(p);
      if (direction) {
        navigator.reset();
        keysHeld.add(direction);
        return false;
      }

      const interact = p.key === 'e' || p.key === 'E' || p.keyCode === 13 || p.keyCode === 32;
      if (interact) {
        if (nearbyNPC) talkToVillager(nearbyNPC);
        else if (nearbyHouse) enterBuilding(nearbyHouse.id);
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

    function handleMapClick(screenX, screenY) {
      if (hasOverlay()) return;
      if (screenX < 0 || screenY < 0 || screenX >= WIDTH || screenY >= HEIGHT) return;

      const x = screenX + camera.x;
      const y = screenY + camera.y;
      const npc = hitVillager(x, y);
      const building = hitBuilding(x, y);

      // NPC clicks are resolved before terrain clicks so the village feels alive.
      const reached = npc
        ? navigator.navigateToNPC(npc)
        : navigator.navigateTo(x, y, building);

      if (!reached) showToast('THAT SPOT IS OUT OF REACH');
      if (!hasOverlay()) stage.focus({ preventScroll: true });
    }

    p.mousePressed = () => {
      handleMapClick(p.mouseX, p.mouseY);
      return false;
    };

    p.touchStarted = () => {
      const touch = p.touches[0];
      handleMapClick(touch?.x ?? p.mouseX, touch?.y ?? p.mouseY);
      return false;
    };
  };

  const game = new window.p5(sketch);

  // Deep links to individual rooms remain supported.
  const initialRoomId = location.hash.slice(1);
  const initialBuilding = buildings.find((building) => building.id === initialRoomId);
  if (initialBuilding) {
    teleportToDoor(player, initialBuilding);
    requestAnimationFrame(() => {
      updateNearby();
      enterBuilding(initialBuilding.id);
    });
  }

  return () => game.remove();
}

function drawMiniMap(p, player, collectedCount) {
  p.noStroke();
  p.fill(14, 43, 51, 220);
  p.rect(WIDTH - 159, 58, 137, 102);
  p.fill('#e6ebd6');
  p.textAlign(p.LEFT, p.TOP);
  p.textSize(10);
  p.text('TOWN MAP', WIDTH - 147, 65);

  const mapX = WIDTH - 147;
  const mapY = 83;
  const scaleX = 113 / (COLS * TILE);
  const scaleY = 63 / (ROWS * TILE);
  p.fill('#527a62');
  p.rect(mapX, mapY, 113, 63);

  for (const building of buildings) {
    p.fill(building.color);
    p.rect(mapX + building.x * TILE * scaleX, mapY + building.y * TILE * scaleY,
      Math.max(4, building.w * TILE * scaleX),
      Math.max(4, building.h * TILE * scaleY));
  }

  p.fill('#ffe989');
  p.rect(mapX + player.x * scaleX - 2, mapY + player.y * scaleY - 2, 5, 5);
  p.fill('#e6ebd6');
  p.textSize(9);
  p.textAlign(p.LEFT, p.TOP);
  p.text(`TOKENS ${collectedCount}/5`, WIDTH - 147, 150);
}

function drawDestination(p, destination, time) {
  if (!destination) return;

  p.push();
  p.noFill();
  p.stroke('#fff1a3');
  p.strokeWeight(3);
  const pulse = 13 + Math.sin(time / 200) * 2;
  p.ellipse(destination.x, destination.y, pulse, pulse / 2);
  p.noStroke();
  p.fill('#173d43');
  p.rect(destination.x - 2, destination.y - 2, 4, 4);
  p.pop();
}
