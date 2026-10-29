/**
 * Click-to-move navigation for Jahvantè Town.
 *
 * Responsibilities:
 * - Calculate routes using A* pathfinding
 * - Prefer streets over grass
 * - Avoid buildings, the pond, and villagers
 * - Navigate to building entrances
 * - Approach villagers for dialogue
 * - Move the player along calculated routes
 *
 * Map layout:
 * ./mapLayout.js
 *
 * Player movement and collisions:
 * ./logic.js
 *
 * Character rendering is handled separately.
 */

import { TILE, COLS, ROWS, WORLD_WIDTH, WORLD_HEIGHT } from "./config.js";

import { canWalkAt, clamp, stepToward } from "./logic.js";

import { movementCostForTile } from "./mapLayout.js";

import { buildings } from "../data/content.js";

import { npcPosition } from "./npcCharacters.js";

/* =========================================
   NAVIGATION SETTINGS
   ========================================= */

const ARRIVAL_DISTANCE = 4;

const NPC_TALK_DISTANCE = TILE * 2.5;

// The player moves between adjacent tiles.
// Diagonal paths are intentionally excluded.
const DIRECTIONS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/* =========================================
   COORDINATE UTILITIES
   ========================================= */

/**
 * Convert tile coordinates into world pixels.
 *
 * Returns the center of the tile.
 */
function tileCenter(x, y) {
  return {
    x: x * TILE + TILE / 2,
    y: y * TILE + TILE / 2,
  };
}

/**
 * Convert a world position into a tile.
 */
function toTile(position) {
  return {
    x: clamp(Math.floor(position.x / TILE), 0, COLS - 1),

    y: clamp(Math.floor(position.y / TILE), 0, ROWS - 1),
  };
}

/**
 * Check that a tile exists in the map.
 */
function isInsideGrid(x, y) {
  return x >= 0 && x < COLS && y >= 0 && y < ROWS;
}

/**
 * Convert a tile coordinate into
 * a unique number.
 */
function tileIndex(x, y) {
  return y * COLS + x;
}

/**
 * Convert an index back into
 * tile coordinates.
 */
function indexToTile(index) {
  return {
    x: index % COLS,
    y: Math.floor(index / COLS),
  };
}

/**
 * Calculate distance between two points.
 */
function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/* =========================================
   COLLISION-FREE SEGMENTS
   ========================================= */

/**
 * Verify that a straight movement segment
 * does not cross an obstacle.
 *
 * Check multiple points along the segment,
 * rather than only its endpoints.
 */
function isSegmentClear(from, to, pond) {
  const distance = distanceBetween(from, to);

  const steps = Math.max(1, Math.ceil(distance / 3));

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;

    const x = from.x + (to.x - from.x) * progress;

    const y = from.y + (to.y - from.y) * progress;

    if (!canWalkAt(x, y, pond)) {
      return false;
    }
  }

  return true;
}

/* =========================================
   NEAREST WALKABLE DESTINATION
   ========================================= */

/**
 * Find the nearest available position.
 *
 * If the requested position is already
 * walkable, return it unchanged.
 *
 * Otherwise, search nearby tile centers.
 */
function nearestWalkablePosition(position, pond) {
  if (canWalkAt(position.x, position.y, pond)) {
    return position;
  }

  const origin = toTile(position);

  const maxRadius = Math.max(COLS, ROWS);

  for (let radius = 0; radius < maxRadius; radius++) {
    let best = null;
    let bestDistance = Infinity;

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
        const ring = Math.max(Math.abs(x - origin.x), Math.abs(y - origin.y));

        if (ring !== radius) {
          continue;
        }

        const candidate = tileCenter(x, y);

        if (!canWalkAt(candidate.x, candidate.y, pond)) {
          continue;
        }

        const distance = distanceBetween(candidate, position);

        if (distance < bestDistance) {
          best = candidate;
          bestDistance = distance;
        }
      }
    }

    if (best) {
      return best;
    }
  }

  return null;
}

/* =========================================
   GRID ANCHOR
   ========================================= */

/**
 * Find a nearby walkable grid position
 * directly reachable from a world position.
 *
 * This safely connects a player or destination
 * to the tile-based navigation grid.
 */
function findGridAnchor(position, pond) {
  const origin = toTile(position);

  const maxRadius = Math.max(COLS, ROWS);

  for (let radius = 0; radius < maxRadius; radius++) {
    let best = null;
    let bestDistance = Infinity;

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
        const ring = Math.max(Math.abs(x - origin.x), Math.abs(y - origin.y));

        if (ring !== radius) {
          continue;
        }

        const candidate = tileCenter(x, y);

        if (!canWalkAt(candidate.x, candidate.y, pond)) {
          continue;
        }

        if (!isSegmentClear(position, candidate, pond)) {
          continue;
        }

        const distance = distanceBetween(position, candidate);

        if (distance < bestDistance) {
          best = { x, y };
          bestDistance = distance;
        }
      }
    }

    if (best) {
      return best;
    }
  }

  return null;
}

/* =========================================
   A* PRIORITY QUEUE
   ========================================= */

/**
 * Insert a node into a minimum-priority heap.
 *
 * Nodes with lower estimated costs
 * are processed first.
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
 * Remove the lowest-priority node.
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
   A* HEURISTIC
   ========================================= */

/**
 * Estimate the remaining travel cost.
 *
 * Manhattan distance is appropriate
 * because the grid uses four directions.
 *
 * The minimum possible movement cost is 1,
 * so this remains an admissible heuristic.
 */
function heuristic(x, y, targetX, targetY) {
  return Math.abs(targetX - x) + Math.abs(targetY - y);
}

/* =========================================
   A* PATHFINDING
   ========================================= */

/**
 * Calculate a route between two positions.
 *
 * Uses movementCostForTile() from
 * mapLayout.js instead of maintaining
 * a separate road definition.
 *
 * The algorithm prefers:
 * - Roads
 * - The town square
 *
 * Grass remains available as an alternative.
 *
 * Returns world-pixel waypoints or null.
 */
function findGridPath(from, to, pond) {
  const start = findGridAnchor(from, pond);
  const end = findGridAnchor(to, pond);

  if (!start || !end) {
    return null;
  }

  const source = tileIndex(start.x, start.y);

  const destination = tileIndex(end.x, end.y);

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
     SEARCH
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

    const currentPosition = tileCenter(x, y);

    /* ===================================
       CHECK NEIGHBORING TILES
       =================================== */

    for (const [dx, dy] of DIRECTIONS) {
      const nextX = x + dx;
      const nextY = y + dy;

      if (!isInsideGrid(nextX, nextY)) {
        continue;
      }

      const nextIndex = tileIndex(nextX, nextY);

      if (visited[nextIndex]) {
        continue;
      }

      const nextPosition = tileCenter(nextX, nextY);

      // The destination tile must be walkable.
      if (!canWalkAt(nextPosition.x, nextPosition.y, pond)) {
        continue;
      }

      // The segment between tiles must also
      // be free from obstacles.
      if (!isSegmentClear(currentPosition, nextPosition, pond)) {
        continue;
      }

      /* =================================
         SHARED MAP MOVEMENT COST
         ================================= */

      const newCost = costs[currentIndex] + movementCostForTile(nextX, nextY);

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
     RECONSTRUCT PATH
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
 * Detect whether the user clicked
 * within a building's footprint.
 *
 * Returns the building or null.
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
    }) ?? null
  );
}

/* =========================================
   NAVIGATION CONTROLLER
   ========================================= */

/**
 * Create a navigation controller
 * for the current player.
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

  /* =====================================
     RESET NAVIGATION
     ===================================== */

  /**
   * Stop moving and clear the route.
   */
  function reset() {
    waypoints = [];
    destination = null;
    action = null;

    player.walking = false;
  }

  /* =====================================
     COMPLETE AN ACTION
     ===================================== */

  /**
   * Execute the action associated
   * with the completed route.
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

  /* =====================================
     FOLLOW A CALCULATED ROUTE
     ===================================== */

  /**
   * Calculate a route and store
   * the waypoints for the game loop.
   */
  function followRoute(target, nextAction = null) {
    const distance = distanceBetween(player, target);

    // Already at the destination.
    if (distance < ARRIVAL_DISTANCE) {
      reset();

      completeAction(nextAction);

      return true;
    }

    // Calculate the route using shared
    // street movement costs.
    const route = findGridPath(player, target, pond);

    if (!route) {
      return false;
    }

    /* ===================================
       PREPARE WAYPOINTS
       =================================== */

    // Remove the first waypoint only
    // when the player is already there.
    waypoints = route.filter((point, index) => {
      if (index > 0) {
        return true;
      }

      return distanceBetween(player, point) > 1;
    });

    // Add the exact destination after
    // the tile-center waypoints.
    const last = waypoints.at(-1) ?? player;

    if (distanceBetween(last, target) > 1) {
      waypoints.push(target);
    }

    destination = target;
    action = nextAction;

    return true;
  }

  /* =====================================
     NAVIGATE TO A BUILDING OR TERRAIN
     ===================================== */

  /**
   * Move to a clicked map position.
   *
   * When a building is selected,
   * navigate to its entrance.
   */
  function navigateTo(x, y, building = null) {
    reset();

    let desired;

    /* ===================================
       BUILDING ENTRANCE
       =================================== */

    if (building) {
      desired = {
        x: building.doorX * TILE + TILE / 2,

        y: building.doorY * TILE + TILE / 2 + 13,
      };
    } else {

    /* ===================================
       NORMAL TERRAIN
       =================================== */
      desired = {
        x: clamp(x, 12, WORLD_WIDTH - 12),

        y: clamp(y, 24, WORLD_HEIGHT - 12),
      };
    }

    // If the destination is blocked,
    // find an accessible nearby tile.
    const target = nearestWalkablePosition(desired, pond);

    if (!target) {
      return false;
    }

    // Opening a building is only performed
    // after the route is completed.
    const nextAction = building
      ? {
          type: "building",
          id: building.id,
        }
      : null;

    return followRoute(target, nextAction);
  }

  /* =====================================
     NAVIGATE TO A VILLAGER
     ===================================== */

  /**
   * Approach a villager closely enough
   * to start their dialogue.
   *
   * Do not walk directly into the NPC.
   */
  function navigateToNPC(npc) {
    reset();

    const position = npcPosition(npc);

    const distance = distanceBetween(player, position);

    // Start dialogue immediately if nearby.
    if (distance <= NPC_TALK_DISTANCE) {
      onReachedNPC(npc);
      return true;
    }

    /* ===================================
       APPROACH POSITIONS
       =================================== */

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

    // Find suitable standing positions
    // around the villager.
    const candidates = offsets
      .map(([dx, dy]) => ({
        x: position.x + dx,
        y: position.y + dy,
      }))

      .filter((candidate) => canWalkAt(candidate.x, candidate.y, pond))

      .sort((a, b) => distanceBetween(player, a) - distanceBetween(player, b));

    // Try available positions until
    // a valid route is found.
    for (const candidate of candidates) {
      if (
        followRoute(candidate, {
          type: "npc",
          npc,
        })
      ) {
        return true;
      }
    }

    return false;
  }

  /* =====================================
     UPDATE PLAYER MOVEMENT
     ===================================== */

  /**
   * Move along the current route.
   *
   * Called every frame by sketch.js.
   */
  function tick(dt) {
    if (waypoints.length === 0) {
      return;
    }

    const target = waypoints[0];

    const arrived = stepToward(player, target, dt, pond);

    /* ===================================
       WAYPOINT COMPLETED
       =================================== */

    if (arrived) {
      waypoints.shift();
    } else if (!player.walking) {

    /* ===================================
       MOVEMENT BLOCKED
       =================================== */
      reset();
      return;
    }

    /* ===================================
       ROUTE COMPLETED
       =================================== */

    if (waypoints.length === 0) {
      const completedAction = action;

      reset();

      completeAction(completedAction);
    }
  }

  /* =====================================
     PUBLIC NAVIGATION API
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
