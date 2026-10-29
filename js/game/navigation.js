/**
 * Click-to-move navigation for Jahvantè Town.
 *
 * Responsibilities:
 * - Find routes through the village
 * - Prefer streets over grass
 * - Avoid buildings, water and NPCs
 * - Navigate to building entrances
 * - Approach villagers for conversations
 * - Move the player along a calculated route
 *
 * Movement and collision rules live in logic.js.
 */

import { TILE, COLS, ROWS, WORLD_WIDTH, WORLD_HEIGHT } from "./config.js";

import { canWalkAt, clamp, stepToward } from "./logic.js";

import { buildings } from "../data/content.js";

import { npcPosition } from "./npcCharacters.js";

/* =========================================
   NAVIGATION SETTINGS
   ========================================= */

const ROAD_COST = 1;
const GRASS_COST = 3;

const ARRIVAL_DISTANCE = 4;

const NPC_TALK_DISTANCE = TILE * 2.5;

const DIRECTIONS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/* =========================================
   STREET LOCATIONS
   ========================================= */

/**
 * These rectangles match the streets
 * drawn in scenery.js in Step 12.
 *
 * Coordinates are in tiles:
 * [left, top, right, bottom]
 *
 * In a future refactor, these definitions
 * should be shared by scenery and navigation
 * rather than maintained in two files.
 */
const ROAD_AREAS = [
  // Main east-west street.
  [6, 19, 57, 22],

  // Northern entrance paths.
  [11, 12, 13, 21],
  [31, 11, 33, 21],
  [50, 12, 52, 21],

  // Connecting streets.
  [23, 21, 25, 37],
  [39, 21, 41, 37],

  // Southern east-west street.
  [11, 35, 53, 37],

  // Town square.
  [29, 23, 36, 26],
];

/**
 * Check whether a tile is part of a road.
 */
function isRoadTile(x, y) {
  return ROAD_AREAS.some(([left, top, right, bottom]) => {
    return x >= left && x <= right && y >= top && y <= bottom;
  });
}

/**
 * Roads are preferred.
 * Grass remains walkable.
 */
function movementCost(x, y) {
  return isRoadTile(x, y) ? ROAD_COST : GRASS_COST;
}

/* =========================================
   GRID UTILITIES
   ========================================= */

/**
 * Convert tile coordinates to the
 * center of a tile in world pixels.
 */
function tileCenter(x, y) {
  return {
    x: x * TILE + TILE / 2,
    y: y * TILE + TILE / 2,
  };
}

/**
 * Convert world coordinates to
 * tile coordinates.
 */
function toTile(position) {
  return {
    x: clamp(Math.floor(position.x / TILE), 0, COLS - 1),

    y: clamp(Math.floor(position.y / TILE), 0, ROWS - 1),
  };
}

/**
 * Convert a tile to a unique array index.
 */
function cellIndex(x, y) {
  return y * COLS + x;
}

/**
 * Convert an array index back to a tile.
 */
function indexToTile(index) {
  return {
    x: index % COLS,
    y: Math.floor(index / COLS),
  };
}

/**
 * Check whether a tile coordinate is valid.
 */
function isInsideGrid(x, y) {
  return x >= 0 && y >= 0 && x < COLS && y < ROWS;
}

/* =========================================
   LINE-OF-SIGHT CHECK
   ========================================= */

/**
 * Check whether the player can travel
 * in a straight line between two points.
 *
 * Used to safely connect world positions
 * to the pathfinding grid.
 */
function segmentIsClear(from, to, pond) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);

  const steps = Math.max(1, Math.ceil(distance / 3));

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;

    const x = from.x + (to.x - from.x) * fraction;

    const y = from.y + (to.y - from.y) * fraction;

    if (!canWalkAt(x, y, pond)) {
      return false;
    }
  }

  return true;
}

/* =========================================
   FIND A WALKABLE POSITION
   ========================================= */

/**
 * Find the closest available tile center
 * when the requested destination is blocked.
 *
 * For example, clicking water should not
 * make the character walk into the pond.
 */
function nearestWalkablePosition(position, pond) {
  if (canWalkAt(position.x, position.y, pond)) {
    return position;
  }

  const origin = toTile(position);

  const maxRadius = Math.max(COLS, ROWS);

  for (let radius = 0; radius < maxRadius; radius++) {
    let nearest = null;
    let nearestDistance = Infinity;

    for (
      let y = Math.max(0, origin.y - radius);
      y <= Math.min(ROWS - 1, origin.y + radius);
      y++
    ) {
      for (
        let x = Math.max(0, origin.x - radius);
        x <= Math.min(COLS - 1, origin.x + radius);
        x++
      ) {
        const ringDistance = Math.max(
          Math.abs(x - origin.x),
          Math.abs(y - origin.y),
        );

        if (ringDistance !== radius) {
          continue;
        }

        const candidate = tileCenter(x, y);

        if (!canWalkAt(candidate.x, candidate.y, pond)) {
          continue;
        }

        const distance = Math.hypot(
          candidate.x - position.x,
          candidate.y - position.y,
        );

        if (distance < nearestDistance) {
          nearest = candidate;
          nearestDistance = distance;
        }
      }
    }

    if (nearest) {
      return nearest;
    }
  }

  return null;
}

/**
 * Find a walkable grid tile that can
 * be reached directly from a position.
 *
 * This prevents the first or last movement
 * segment from cutting through an obstacle.
 */
function findGridAnchor(position, pond) {
  const origin = toTile(position);

  const maxRadius = Math.max(COLS, ROWS);

  for (let radius = 0; radius < maxRadius; radius++) {
    let nearest = null;
    let nearestDistance = Infinity;

    for (
      let y = Math.max(0, origin.y - radius);
      y <= Math.min(ROWS - 1, origin.y + radius);
      y++
    ) {
      for (
        let x = Math.max(0, origin.x - radius);
        x <= Math.min(COLS - 1, origin.x + radius);
        x++
      ) {
        const ringDistance = Math.max(
          Math.abs(x - origin.x),
          Math.abs(y - origin.y),
        );

        if (ringDistance !== radius) {
          continue;
        }

        const candidate = tileCenter(x, y);

        if (!canWalkAt(candidate.x, candidate.y, pond)) {
          continue;
        }

        if (!segmentIsClear(position, candidate, pond)) {
          continue;
        }

        const distance = Math.hypot(
          candidate.x - position.x,
          candidate.y - position.y,
        );

        if (distance < nearestDistance) {
          nearest = { x, y };
          nearestDistance = distance;
        }
      }
    }

    if (nearest) {
      return nearest;
    }
  }

  return null;
}

/* =========================================
   A* PRIORITY QUEUE
   ========================================= */

/**
 * Add a node to the priority queue.
 *
 * Lower priority numbers are processed first.
 */
function pushFrontier(heap, node) {
  heap.push(node);

  let index = heap.length - 1;

  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);

    if (heap[parent].priority <= heap[index].priority) {
      break;
    }

    [heap[parent], heap[index]] = [heap[index], heap[parent]];

    index = parent;
  }
}

/**
 * Remove the lowest-cost node.
 */
function popFrontier(heap) {
  if (heap.length === 0) {
    return null;
  }

  const first = heap[0];
  const last = heap.pop();

  if (heap.length === 0) {
    return first;
  }

  heap[0] = last;

  let index = 0;

  while (true) {
    const left = index * 2 + 1;
    const right = left + 1;

    let smallest = index;

    if (left < heap.length && heap[left].priority < heap[smallest].priority) {
      smallest = left;
    }

    if (right < heap.length && heap[right].priority < heap[smallest].priority) {
      smallest = right;
    }

    if (smallest === index) {
      break;
    }

    [heap[index], heap[smallest]] = [heap[smallest], heap[index]];

    index = smallest;
  }

  return first;
}

/* =========================================
   A* PATHFINDING
   ========================================= */

/**
 * Estimate the remaining distance
 * between two tiles.
 *
 * Uses Manhattan distance because
 * the navigation grid has four directions.
 */
function heuristic(x, y, targetX, targetY) {
  return (Math.abs(targetX - x) + Math.abs(targetY - y)) * ROAD_COST;
}

/**
 * Find a collision-free route using A*.
 *
 * Road tiles are cheaper than grass tiles,
 * encouraging the character to follow
 * the village streets.
 *
 * Returns world-pixel waypoints or null.
 */
function findGridPath(from, to, pond) {
  const start = findGridAnchor(from, pond);
  const end = findGridAnchor(to, pond);

  if (!start || !end) {
    return null;
  }

  const source = cellIndex(start.x, start.y);

  const destination = cellIndex(end.x, end.y);

  const totalCells = COLS * ROWS;

  const costs = new Float64Array(totalCells);
  costs.fill(Infinity);

  const parents = new Int32Array(totalCells);
  parents.fill(-1);

  const visited = new Uint8Array(totalCells);

  const frontier = [];

  costs[source] = 0;
  parents[source] = source;

  pushFrontier(frontier, {
    index: source,
    priority: heuristic(start.x, start.y, end.x, end.y),
  });

  /* =====================================
     SEARCH FOR THE DESTINATION
     ===================================== */

  while (frontier.length > 0) {
    const current = popFrontier(frontier);

    const currentIndex = current.index;

    if (visited[currentIndex]) {
      continue;
    }

    if (currentIndex === destination) {
      break;
    }

    visited[currentIndex] = 1;

    const { x, y } = indexToTile(currentIndex);

    for (const [dx, dy] of DIRECTIONS) {
      const nextX = x + dx;
      const nextY = y + dy;

      if (!isInsideGrid(nextX, nextY)) {
        continue;
      }

      const nextIndex = cellIndex(nextX, nextY);

      if (visited[nextIndex]) {
        continue;
      }

      const nextPosition = tileCenter(nextX, nextY);

      if (!canWalkAt(nextPosition.x, nextPosition.y, pond)) {
        continue;
      }

      const newCost = costs[currentIndex] + movementCost(nextX, nextY);

      if (newCost >= costs[nextIndex]) {
        continue;
      }

      costs[nextIndex] = newCost;

      parents[nextIndex] = currentIndex;

      const priority = newCost + heuristic(nextX, nextY, end.x, end.y);

      pushFrontier(frontier, {
        index: nextIndex,
        priority,
      });
    }
  }

  /* =====================================
     NO ROUTE FOUND
     ===================================== */

  if (parents[destination] === -1) {
    return null;
  }

  /* =====================================
     RECONSTRUCT THE ROUTE
     ===================================== */

  const route = [];

  let current = destination;

  while (current !== source) {
    const { x, y } = indexToTile(current);

    route.push(tileCenter(x, y));

    current = parents[current];
  }

  route.push(tileCenter(start.x, start.y));

  route.reverse();

  return route;
}

/* =========================================
   BUILDING CLICK DETECTION
   ========================================= */

/**
 * Return the building clicked by the player.
 *
 * Uses the building footprints defined
 * in content.js.
 */
export function hitBuilding(x, y) {
  return (
    buildings.find((building) => {
      return (
        x >= building.x * TILE &&
        x < (building.x + building.w) * TILE &&
        y >= building.y * TILE &&
        y < (building.y + building.h) * TILE
      );
    }) || null
  );
}

/* =========================================
   CLICK NAVIGATION CONTROLLER
   ========================================= */

/**
 * Create the navigation controller.
 *
 * @param {Object} player
 * @param {Object} pond
 * @param {Function} onReachedBuilding
 * @param {Function} onReachedNPC
 */
export function createClickNavigation(
  player,
  pond,
  onReachedBuilding,
  onReachedNPC,
) {
  let waypoints = [];

  let destination = null;

  let action = null;

  /**
   * Stop the current route.
   */
  function reset() {
    waypoints = [];
    destination = null;
    action = null;

    player.walking = false;
  }

  /**
   * Perform an action after reaching
   * the destination.
   */
  function completeAction(completedAction) {
    if (!completedAction) {
      return;
    }

    if (completedAction.type === "building") {
      onReachedBuilding(completedAction.id);
    }

    if (completedAction.type === "npc") {
      onReachedNPC(completedAction.npc);
    }
  }

  /**
   * Calculate a route and prepare
   * the player to follow it.
   */
  function followRoute(target, nextAction = null) {
    const distance = Math.hypot(player.x - target.x, player.y - target.y);

    // Already at the destination.
    if (distance < ARRIVAL_DISTANCE) {
      reset();
      completeAction(nextAction);
      return true;
    }

    const route = findGridPath(player, target, pond);

    if (!route) {
      return false;
    }

    // Keep the tile-center route intact.
    //
    // This is intentional: smoothing straight
    // across the map could bypass the roads.

    waypoints = route.filter((point, index) => {
      if (index > 0) {
        return true;
      }

      return Math.hypot(player.x - point.x, player.y - point.y) > 1;
    });

    const last = waypoints.at(-1) ?? player;

    // Finish at the actual destination,
    // not only the center of its grid tile.
    if (Math.hypot(last.x - target.x, last.y - target.y) > 1) {
      waypoints.push(target);
    }

    destination = target;
    action = nextAction;

    return true;
  }

  /* =====================================
     NAVIGATE TO TERRAIN OR A BUILDING
     ===================================== */

  /**
   * Navigate to a clicked destination.
   *
   * If a building was clicked, navigate
   * to its entrance instead of its walls.
   */
  function navigateTo(x, y, building = null) {
    reset();

    let desired;

    if (building) {
      desired = {
        x: building.doorX * TILE + TILE / 2,

        y: building.doorY * TILE + TILE / 2 + 13,
      };
    } else {
      desired = {
        x: clamp(x, 12, WORLD_WIDTH - 12),

        y: clamp(y, 24, WORLD_HEIGHT - 12),
      };
    }

    const target = nearestWalkablePosition(desired, pond);

    if (!target) {
      return false;
    }

    const nextAction = building
      ? {
          type: "building",
          id: building.id,
        }
      : null;

    return followRoute(target, nextAction);
  }

  /* =====================================
     NAVIGATE TO NPC
     ===================================== */

  /**
   * Approach a villager without walking
   * through the villager's collision area.
   *
   * Stop close enough to start dialogue.
   */
  function navigateToNPC(npc) {
    reset();

    const position = npcPosition(npc);

    const distance = Math.hypot(player.x - position.x, player.y - position.y);

    // Talk immediately if already nearby.
    if (distance <= NPC_TALK_DISTANCE) {
      onReachedNPC(npc);
      return true;
    }

    // Possible standing positions around NPC.
    const offsets = [
      [0, 39],
      [39, 0],
      [-39, 0],
      [0, -39],

      [34, 34],
      [-34, 34],
      [34, -34],
      [-34, -34],
    ];

    const candidates = offsets
      .map(([dx, dy]) => {
        return {
          x: position.x + dx,
          y: position.y + dy,
        };
      })

      .filter((candidate) => {
        return canWalkAt(candidate.x, candidate.y, pond);
      })

      .sort((a, b) => {
        const distanceA = Math.hypot(player.x - a.x, player.y - a.y);

        const distanceB = Math.hypot(player.x - b.x, player.y - b.y);

        return distanceA - distanceB;
      });

    // Try each possible approach position.
    for (const candidate of candidates) {
      const found = followRoute(candidate, {
        type: "npc",
        npc,
      });

      if (found) {
        return true;
      }
    }

    return false;
  }

  /* =====================================
     UPDATE MOVEMENT
     ===================================== */

  /**
   * Follow the calculated route.
   *
   * Called once per frame by sketch.js.
   */
  function tick(dt) {
    if (waypoints.length === 0) {
      return;
    }

    const target = waypoints[0];

    const arrived = stepToward(player, target, dt, pond);

    if (arrived) {
      waypoints.shift();
    } else if (!player.walking) {
      // An obstacle prevented movement.
      reset();
      return;
    }

    // Complete the route.
    if (waypoints.length === 0) {
      const completedAction = action;

      reset();

      completeAction(completedAction);
    }
  }

  /* =====================================
     PUBLIC CONTROLLER METHODS
     ===================================== */

  return {
    reset,

    navigateTo,

    navigateToNPC,

    tick,

    hasRoute: () => waypoints.length > 0,

    getDestination: () => destination,
  };
}
