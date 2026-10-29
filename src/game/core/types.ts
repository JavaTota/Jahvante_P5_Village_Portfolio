/** Shared types keep p5, the simulation and React independent. */
export type Facing = 'up' | 'down' | 'left' | 'right';
export type CharacterId = 'jahvante' | 'wife' | 'nea' | 'knight';
export type PortfolioId = 'projects' | 'experience' | 'skills' | 'about' | 'credentials' | 'contact';
export type GameMode = 'village' | 'volcano';
export type Direction = Facing;
export interface Point { x: number; y: number }
export interface Rect extends Point { w: number; h: number }
export interface Player extends Point {
  face: Facing;
  health: number;
  maxHealth: number;
  walking: boolean;
  frame: number;
  lastAttack: number;
  invulnerableUntil: number;
  checkpoint: Point;
}
export interface Enemy extends Point {
  id: string;
  health: number;
  maxHealth: number;
  lastHit: number;
  lastAttack: number;
  isBoss: boolean;
  windup: number;
  nextSpecial: number;
}
export type GameEvent =
  | { type: 'section'; section: PortfolioId }
  | { type: 'ending' }
  | { type: 'npc'; message: string }
  | { type: 'toast'; message: string };
export interface GameStats {
  health: number;
  maxHealth: number;
  progress: number;
  boss: boolean;
  enemyHealth: number;
  enemyMaxHealth: number;
  objective: string;
  mode: GameMode;
}
/** Only the p5 calls we use. Vendored p5 v1.4.2 supplies these at runtime. */
export interface P5 {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  deltaTime: number;
  frameCount: number;
  mouseX: number;
  mouseY: number;
  key: string;
  keyCode: number;
  LEFT: string | number;
  CENTER: string | number;
  TOP: string | number;
  BOLD: string | number;
  setup?: () => void;
  draw?: () => void;
  mousePressed?: () => boolean | void;
  createCanvas(w: number, h: number): { parent(el: HTMLElement): void };
  pixelDensity(n: number): void;
  noSmooth(): void;
  frameRate(n: number): void;
  textFont(font: string): void;
  textStyle(style: string | number): void;
  push(): void;
  pop(): void;
  translate(x: number, y: number): void;
  background(color: string | number): void;
  noStroke(): void;
  stroke(color: string): void;
  noFill(): void;
  strokeWeight(n: number): void;
  fill(color: string | number, g?: number, b?: number, a?: number): void;
  rect(x: number, y: number, w: number, h: number, ...extra: number[]): void;
  ellipse(x: number, y: number, w: number, h: number): void;
  circle(x: number, y: number, d: number): void;
  triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  textSize(n: number): void;
  textAlign(a: string | number, b?: string | number): void;
  text(s: string, x: number, y: number): void;
  millis(): number;
}
export type P5Constructor = new (sketch: (p: P5) => void, element?: HTMLElement) => { remove(): void };
declare global { interface Window { p5?: P5Constructor } }
