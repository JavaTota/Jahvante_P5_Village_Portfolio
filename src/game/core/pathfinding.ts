import { COLS, ROWS, TILE, distance, tileCenter } from './geometry';
import { collides, roadCost } from './maps';
import type { GameMode, Point } from './types';

/** Four-direction A* pathfinder; lower tile weights make village roads preferable. */
export function findPath(start: Point, goal: Point, mode: GameMode): Point[] {
  const toId = (x: number, y: number): number => y * COLS + x;
  const fromId = (id: number): [number, number] => [id % COLS, Math.floor(id / COLS)];
  const getTile = (point: Point): [number, number] => [Math.floor(point.x / TILE), Math.floor(point.y / TILE)];
  const [sx, sy] = getTile(start), [gx, gy] = getTile(goal);
  if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS || collides(goal, mode)) return [];
  const startId = toId(sx, sy), targetId = toId(gx, gy);
  const cost = new Float64Array(COLS * ROWS).fill(Infinity);
  const previous = new Int32Array(COLS * ROWS).fill(-1);
  const done = new Uint8Array(COLS * ROWS);
  const frontier: { id: number; score: number }[] = [{ id: startId, score: 0 }];
  cost[startId] = 0;
  while (frontier.length) {
    frontier.sort((a, b) => b.score - a.score);
    const next = frontier.pop()!;
    if (done[next.id]) continue;
    if (next.id === targetId) break;
    done[next.id] = 1;
    const [x, y] = fromId(next.id);
    for (const [dx, dy] of [[0,1],[1,0],[-1,0],[0,-1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      const point = tileCenter(nx, ny), id = toId(nx, ny);
      if (done[id] || collides(point, mode)) continue;
      const nextCost = cost[next.id] + (mode === 'village' ? roadCost(nx, ny) : 1);
      if (nextCost >= cost[id]) continue;
      cost[id] = nextCost;
      previous[id] = next.id;
      frontier.push({ id, score: nextCost + Math.abs(nx - gx) + Math.abs(ny - gy) });
    }
  }
  if (startId !== targetId && previous[targetId] === -1) return [];
  const points: Point[] = [];
  for (let id = targetId; id !== startId; id = previous[id]) {
    if (id < 0) return [];
    const [x, y] = fromId(id);
    points.push(tileCenter(x, y));
  }
  points.reverse();
  if (!collides(goal, mode) && (!points.length || distance(points.at(-1)!, goal) > 5)) points.push(goal);
  return points;
}
