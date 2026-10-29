import { buildings } from '../../data/content';
import { COLS, ROWS, TILE, WORLD_HEIGHT, WORLD_WIDTH, intersectsCircleRect } from './geometry';
import type { GameMode, Point, Rect } from './types';

export const villagePond: Rect = { x: 55 * TILE, y: 29 * TILE, w: 7 * TILE, h: 5 * TILE };
/** Streets deliberately match the door coordinates and avoid footprints. */
export const roads = [
  [6, 19, 57, 22], [11, 14, 13, 22], [31, 12, 33, 22],
  [50, 14, 52, 22], [23, 21, 25, 37], [39, 21, 41, 37], [11, 35, 53, 37],
] as const;
export const plaza = [29, 23, 36, 26] as const;
export function inArea(x: number, y: number, rect: readonly [number, number, number, number]): boolean {
  return x >= rect[0] && y >= rect[1] && x <= rect[2] && y <= rect[3];
}
export const isRoad = (x: number, y: number): boolean => roads.some(r => inArea(x, y, r));
export const isPlaza = (x: number, y: number): boolean => inArea(x, y, plaza);
export const roadCost = (x: number, y: number): number => isRoad(x, y) || isPlaza(x, y) ? 1 : 3;

// Lava gaps form safe stone bridges through each river at the central latitude.
const lavaRivers = [[17, 19], [35, 37], [50, 52]] as const;
export function isLava(point: Point): boolean {
  const tx = Math.floor(point.x / TILE), ty = Math.floor(point.y / TILE);
  const inRiver = lavaRivers.some(([start, end]) => tx >= start && tx <= end && (ty < 18 || ty > 24));
  const pools = (tx >= 24 && tx <= 30 && ty >= 7 && ty <= 14) || (tx >= 41 && tx <= 46 && ty >= 28 && ty <= 35);
  return inRiver || pools;
}
export function isVolcanoRock(point: Point): boolean {
  const tx = Math.floor(point.x / TILE), ty = Math.floor(point.y / TILE);
  // Rocks frame the arena without enclosing the main walkway.
  return ((tx >= 26 && tx <= 28) && (ty >= 26 && ty <= 29)) ||
    (tx >= 6 && tx <= 9 && ty >= 8 && ty <= 11) ||
    (tx >= 43 && tx <= 46 && ty >= 9 && ty <= 12);
}
export function isInsideWorld(point: Point, radius = 8): boolean {
  return point.x >= radius && point.y >= radius && point.x < WORLD_WIDTH - radius && point.y < WORLD_HEIGHT - radius;
}
export function collides(point: Point, mode: GameMode, radius = 9): boolean {
  if (!isInsideWorld(point, radius)) return true;
  if (mode === 'village') {
    if (intersectsCircleRect(point, radius, villagePond)) return true;
    return buildings.some(b => intersectsCircleRect(point, radius, { x: b.x * TILE, y: b.y * TILE, w: b.w * TILE, h: b.h * TILE }));
  }
  return isVolcanoRock(point);
}
export function moveWithCollisions(point: Point, delta: Point, mode: GameMode): Point {
  let x = point.x, y = point.y;
  if (!collides({ x: x + delta.x, y }, mode)) x += delta.x;
  if (!collides({ x, y: y + delta.y }, mode)) y += delta.y;
  return { x, y };
}
export function validateMap(): boolean {
  return roads.flatMap(r => [[r[0], r[1]], [r[2], r[3]]]).every(([x,y]) => x >= 0 && x < COLS && y >= 0 && y < ROWS);
}
