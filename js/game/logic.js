/**
 * Player movement and collision logic.
 *
 * Responsibilities:
 * - Create the player
 * - Handle keyboard movement
 * - Handle click-to-move steps
 * - Prevent walking through obstacles
 * - Detect nearby buildings
 * - Position the camera
 * - Teleport the player
 *
 * Building positions: ../data/content.js
 * NPC positions:      ../data/npcs.js
 * World dimensions:   ./config.js
 */

import {
  TILE,
  WIDTH,
  HEIGHT,
  SPEED,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  center,
} from "./config.js";

import { buildings } from "../data/content.js";
import { villagers } from "../data/npcs.js";
import { npcPosition } from "./npcCharacters.js";

/* =========================================
   MOVEMENT SETTINGS
   ========================================= */

const PLAYER_RADIUS = 7;

const NPC_COLLISION_DISTANCE = 19;

const BUILDING_INTERACTION_RANGE = TILE * 2.25;

const POSITION_TOLERANCE = 1.25;

/* =========================================
   GENERAL UTILITIES
   ========================================= */

/**
 * Keep a value between a minimum
 * and maximum.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* =========================================
   PLAYER CREATION
   ========================================= */

/**
 * Create the player at the town square.
 *
 * The center position is defined in
 * config.js and is currently tile
 * (31.5, 24.5).
 *
 * This location remains clear in the
 * redesigned village.
 */
export function makePlayer() {
  return {
    x: center.x,
    y: center.y,

    face: "down",

    frame: 0,

    walking: false,
  };
}

/* =========================================
   COLLISION HELPERS
   ========================================= */

/**
 * Check if the player's collision box
 * overlaps a rectangle.
 *
 * Used for buildings and the pond.
 */
function overlapsRectangle(x, y, rectangle) {
  return (
    x + PLAYER_RADIUS > rectangle.x &&
    x - PLAYER_RADIUS < rectangle.x + rectangle.w &&
    y + PLAYER_RADIUS > rectangle.y &&
    y - PLAYER_RADIUS < rectangle.y + rectangle.h
  );
}

/**
 * Check whether the position is inside
 * the playable world.
 */
function isInsideWorld(x, y) {
  return x >= 12 && x <= WORLD_WIDTH - 12 && y >= 24 && y <= WORLD_HEIGHT - 12;
}

/**
 * Check whether the player overlaps
 * any of the six village buildings.
 */
function hitsBuilding(x, y) {
  return buildings.some((building) => {
    const rectangle = {
      x: building.x * TILE,
      y: building.y * TILE,
      w: building.w * TILE,
      h: building.h * TILE,
    };

    return overlapsRectangle(x, y, rectangle);
  });
}

/**
 * Check whether the player overlaps
 * the pond.
 */
function hitsPond(x, y, pond) {
  if (!pond) {
    return false;
  }

  return overlapsRectangle(x, y, pond);
}

/**
 * Check whether the player is too close
 * to a villager.
 *
 * NPCs are solid obstacles.
 *
 * The player can approach villagers
 * closely enough to talk to them,
 * but cannot walk through them.
 */
function hitsVillager(x, y) {
  return villagers.some((villager) => {
    const position = npcPosition(villager);

    const distance = Math.hypot(x - position.x, y - position.y);

    return distance < NPC_COLLISION_DISTANCE;
  });
}

/* =========================================
   WALKABLE POSITION
   ========================================= */

/**
 * Determine whether the player can stand
 * at the specified world coordinates.
 *
 * This function is shared by:
 * - Keyboard movement
 * - Click-to-move
 * - Pathfinding
 *
 * Roads and grass are both walkable.
 * Buildings, the pond, and NPCs are not.
 */
export function canWalkAt(x, y, pond) {
  if (!isInsideWorld(x, y)) {
    return false;
  }

  if (hitsBuilding(x, y)) {
    return false;
  }

  if (hitsPond(x, y, pond)) {
    return false;
  }

  if (hitsVillager(x, y)) {
    return false;
  }

  return true;
}

/* =========================================
   KEYBOARD MOVEMENT
   ========================================= */

/**
 * Move the player using WASD
 * or arrow keys.
 *
 * Supports diagonal movement and
 * sliding alongside walls.
 */
export function updatePlayer(player, pressed, dt, pond) {
  // Horizontal input.
  const dx = Number(pressed.has("right")) - Number(pressed.has("left"));

  // Vertical input.
  const dy = Number(pressed.has("down")) - Number(pressed.has("up"));

  // No movement requested.
  if (dx === 0 && dy === 0) {
    player.walking = false;
    return;
  }

  /* =====================================
     MOVEMENT SPEED
     ===================================== */

  const length = Math.hypot(dx, dy);

  const delta = Math.min(dt, 2.2);

  // Normalize diagonal movement so
  // it isn't faster than straight movement.
  const velocityX = (dx / length) * SPEED * delta;

  const velocityY = (dy / length) * SPEED * delta;

  /* =====================================
     FACING DIRECTION
     ===================================== */

  if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
    player.face = dx < 0 ? "left" : "right";
  } else {
    player.face = dy < 0 ? "up" : "down";
  }

  /* =====================================
     APPLY MOVEMENT
     ===================================== */

  let moved = false;

  // Horizontal movement.
  if (velocityX !== 0 && canWalkAt(player.x + velocityX, player.y, pond)) {
    player.x += velocityX;
    moved = true;
  }

  // Vertical movement.
  if (velocityY !== 0 && canWalkAt(player.x, player.y + velocityY, pond)) {
    player.y += velocityY;
    moved = true;
  }

  /* =====================================
     WALKING ANIMATION
     ===================================== */

  // Only animate when the character
  // actually changes position.
  player.walking = moved;

  if (moved) {
    player.frame += Math.min(dt, 3);
  }
}

/* =========================================
   CLICK-TO-MOVE MOVEMENT
   ========================================= */

/**
 * Move the player toward a waypoint.
 *
 * navigation.js calculates the route.
 * This function handles the actual movement
 * while respecting collisions.
 *
 * Returns:
 * true  → waypoint reached
 * false → not reached or movement blocked
 */
export function stepToward(player, target, dt, pond) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;

  const distance = Math.hypot(dx, dy);

  /* =====================================
     ARRIVAL CHECK
     ===================================== */

  if (distance < POSITION_TOLERANCE) {
    player.x = target.x;
    player.y = target.y;

    player.walking = false;

    return true;
  }

  /* =====================================
     MOVEMENT STEP
     ===================================== */

  const step = Math.min(distance, SPEED * Math.min(dt, 2.2));

  const velocityX = (dx / distance) * step;

  const velocityY = (dy / distance) * step;

  /* =====================================
     FACING DIRECTION
     ===================================== */

  if (Math.abs(dx) > Math.abs(dy)) {
    player.face = dx < 0 ? "left" : "right";
  } else {
    player.face = dy < 0 ? "up" : "down";
  }

  /* =====================================
     COLLISION CHECK
     ===================================== */

  const nextX = player.x + velocityX;
  const nextY = player.y + velocityY;

  if (!canWalkAt(nextX, nextY, pond)) {
    player.walking = false;

    return false;
  }

  /* =====================================
     UPDATE PLAYER POSITION
     ===================================== */

  player.x = nextX;
  player.y = nextY;

  player.walking = true;

  player.frame += Math.min(dt, 3);

  // Check whether the waypoint
  // has now been reached.
  return distance <= step + POSITION_TOLERANCE;
}

/* =========================================
   BUILDING INTERACTION
   ========================================= */

/**
 * Find a building whose entrance is
 * close enough to the player.
 *
 * Players interact with the entrance,
 * not the building's walls or roof.
 */
export function nearbyBuilding(player) {
  return (
    buildings.find((building) => {
      const entranceX = building.doorX * TILE + TILE / 2;

      const entranceY = building.doorY * TILE + TILE / 2;

      const distance = Math.hypot(player.x - entranceX, player.y - entranceY);

      return distance < BUILDING_INTERACTION_RANGE;
    }) || null
  );
}

/* =========================================
   CAMERA
   ========================================= */

/**
 * Center the camera on the player
 * without showing space beyond
 * the world boundaries.
 */
export function cameraFor(player) {
  const cameraX = clamp(player.x - WIDTH / 2, 0, WORLD_WIDTH - WIDTH);

  const cameraY = clamp(player.y - HEIGHT / 2, 0, WORLD_HEIGHT - HEIGHT);

  return {
    x: cameraX,
    y: cameraY,
  };
}

/* =========================================
   TELEPORT TO TOWN SQUARE
   ========================================= */

/**
 * Return the player to the town square.
 *
 * Important:
 * Preserve player.character so the selected
 * character doesn't change after teleporting.
 */
export function teleportSquare(player) {
  player.x = center.x;
  player.y = center.y;

  player.face = "down";

  player.frame = 0;
  player.walking = false;
}

/* =========================================
   TELEPORT TO BUILDING ENTRANCE
   ========================================= */

/**
 * Position the player on the street
 * immediately outside a building.
 *
 * The additional 13 pixels keep the
 * player away from the building wall.
 */
export function teleportToDoor(player, building) {
  player.x = building.doorX * TILE + TILE / 2;

  player.y = building.doorY * TILE + TILE / 2 + 13;

  player.face = "up";

  player.walking = false;
}
