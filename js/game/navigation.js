/**
 * Route a player through the tile grid and smooth the route into walkable
 * straight segments. Used by terrain clicks, building clicks, and NPC clicks.
 */
import { TILE, COLS, ROWS, WORLD_WIDTH, WORLD_HEIGHT } from './config.js';
import { canWalkAt, clamp, stepToward } from './logic.js';
import { buildings } from '../data/content.js';
import { npcPosition } from './npcCharacters.js';

const tileCenter = (x, y) => ({ x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 });
const cellIndex = (x, y) => y * COLS + x;

function toTile(position) {
  return {
    x: clamp(Math.floor(position.x / TILE), 0, COLS - 1),
    y: clamp(Math.floor(position.y / TILE), 0, ROWS - 1),
  };
}

function segmentIsClear(from, to, pond) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(length / 3));

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const x = from.x + (to.x - from.x) * fraction;
    const y = from.y + (to.y - from.y) * fraction;
    if (!canWalkAt(x, y, pond)) return false;
  }

  return true;
}

function nearestWalkablePosition(position, pond) {
  if (canWalkAt(position.x, position.y, pond)) return position;

  const tile = toTile(position);
  for (let radius = 0; radius < Math.max(COLS, ROWS); radius++) {
    let closest = null;
    let bestDistance = Infinity;

    for (let y = Math.max(0, tile.y - radius); y <= Math.min(ROWS - 1, tile.y + radius); y++) {
      for (let x = Math.max(0, tile.x - radius); x <= Math.min(COLS - 1, tile.x + radius); x++) {
        if (Math.max(Math.abs(x - tile.x), Math.abs(y - tile.y)) !== radius) continue;
        const candidate = tileCenter(x, y);
        const distance = Math.hypot(candidate.x - position.x, candidate.y - position.y);
        if (distance < bestDistance && canWalkAt(candidate.x, candidate.y, pond)) {
          closest = candidate;
          bestDistance = distance;
        }
      }
    }

    if (closest) return closest;
  }

  return null;
}

function findGridPath(from, to, pond) {
  const start = toTile(from);
  const end = toTile(to);
  const source = cellIndex(start.x, start.y);
  const destination = cellIndex(end.x, end.y);
  const parents = new Int32Array(COLS * ROWS).fill(-1);
  const queue = new Int32Array(COLS * ROWS);

  let head = 0;
  let tail = 0;
  queue[tail++] = source;
  parents[source] = source;

  while (head < tail && parents[destination] === -1) {
    const index = queue[head++];
    const x = index % COLS;
    const y = Math.floor(index / COLS);

    for (const [nextX, nextY] of [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]]) {
      if (nextX < 0 || nextY < 0 || nextX >= COLS || nextY >= ROWS) continue;

      const next = cellIndex(nextX, nextY);
      if (parents[next] !== -1) continue;
      const center = tileCenter(nextX, nextY);
      if (!canWalkAt(center.x, center.y, pond)) continue;

      parents[next] = index;
      queue[tail++] = next;
    }
  }

  if (parents[destination] === -1) return null;

  const path = [];
  for (let index = destination; index !== source; index = parents[index]) {
    path.push(tileCenter(index % COLS, Math.floor(index / COLS)));
  }

  return path.reverse();
}

function smoothPath(start, points, pond) {
  const result = [];
  let origin = start;
  let index = 0;

  while (index < points.length) {
    let furthest = index;
    for (let candidate = points.length - 1; candidate >= index; candidate--) {
      if (segmentIsClear(origin, points[candidate], pond)) {
        furthest = candidate;
        break;
      }
    }

    origin = points[furthest];
    result.push(origin);
    index = furthest + 1;
  }

  return result;
}

export function hitBuilding(x, y) {
  return buildings.find((building) => (
    x >= building.x * TILE && x < (building.x + building.w) * TILE &&
    y >= building.y * TILE && y < (building.y + building.h) * TILE
  )) || null;
}

/**
 * onReachedBuilding(buildingId) and onReachedNPC(npc) are game callbacks.
 * This module knows nothing about the popup/dialogue UI.
 */
export function createClickNavigation(player, pond, onReachedBuilding, onReachedNPC) {
  let waypoints = [];
  let destination = null;
  let action = null;

  function reset() {
    waypoints = [];
    destination = null;
    action = null;
    player.walking = false;
  }

  function followRoute(target, nextAction = null) {
    if (Math.hypot(player.x - target.x, player.y - target.y) < 4) {
      reset();
      completeAction(nextAction);
      return true;
    }

    const grid = findGridPath(player, target, pond);
    if (!grid) return false;

    // End at the actual clicked spot where possible, not just a tile center.
    const lastTile = grid.at(-1) || player;
    if (segmentIsClear(lastTile, target, pond)) grid.push(target);
    else if (segmentIsClear(player, target, pond)) grid.splice(0, grid.length, target);

    waypoints = smoothPath(player, grid, pond);
    destination = target;
    action = nextAction;
    return true;
  }

  function completeAction(completedAction) {
    if (completedAction?.type === 'building') onReachedBuilding(completedAction.id);
    if (completedAction?.type === 'npc') onReachedNPC(completedAction.npc);
  }

  function navigateTo(x, y, building = null) {
    reset();
    const desired = building
      ? { x: building.doorX * TILE + TILE / 2, y: building.doorY * TILE + TILE / 2 + 13 }
      : { x: clamp(x, 12, WORLD_WIDTH - 12), y: clamp(y, 24, WORLD_HEIGHT - 12) };
    const target = nearestWalkablePosition(desired, pond);
    if (!target) return false;

    return followRoute(target, building ? { type: 'building', id: building.id } : null);
  }

  function navigateToNPC(npc) {
    reset();
    const { x, y } = npcPosition(npc);
    const distance = Math.hypot(player.x - x, player.y - y);

    if (distance <= TILE * 2.5) {
      onReachedNPC(npc);
      return true;
    }

    // Try standing one to two tiles away, at accessible positions around the NPC.
    const offsets = [
      [0, 39], [39, 0], [-39, 0], [0, -39],
      [34, 34], [-34, 34], [34, -34], [-34, -34],
    ];
    const candidates = offsets
      .map(([dx, dy]) => ({ x: x + dx, y: y + dy }))
      .filter((point) => canWalkAt(point.x, point.y, pond))
      .sort((a, b) => Math.hypot(player.x - a.x, player.y - a.y) - Math.hypot(player.x - b.x, player.y - b.y));

    for (const candidate of candidates) {
      if (followRoute(candidate, { type: 'npc', npc })) return true;
    }

    return false;
  }

  function tick(dt) {
    if (!waypoints.length) return;

    if (stepToward(player, waypoints[0], dt, pond)) {
      waypoints.shift();
    } else if (!player.walking) {
      reset();
      return;
    }

    if (waypoints.length === 0) {
      const completedAction = action;
      reset();
      completeAction(completedAction);
    }
  }

  return {
    reset,
    navigateTo,
    navigateToNPC,
    tick,
    hasRoute: () => waypoints.length > 0,
    getDestination: () => destination,
  };
}
