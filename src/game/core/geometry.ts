import type { Point, Rect } from './types';

export const TILE = 24;
export const COLS = 64;
export const ROWS = 42;
export const WIDTH = 960;
export const HEIGHT = 576;
export const WORLD_WIDTH = COLS * TILE;
export const WORLD_HEIGHT = ROWS * TILE;
export const clamp = (value: number, low: number, high: number): number => Math.max(low, Math.min(high, value));
export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
export const tileCenter = (x: number, y: number): Point => ({ x: (x + .5) * TILE, y: (y + .5) * TILE });
export function intersectsCircleRect(point: Point, radius: number, r: Rect): boolean {
  const cx = clamp(point.x, r.x, r.x + r.w);
  const cy = clamp(point.y, r.y, r.y + r.h);
  return Math.hypot(point.x - cx, point.y - cy) < radius;
}
