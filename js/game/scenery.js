// A top-down village built entirely with p5 drawing primitives.
// The supplied project's scenery/ modules inspired the separation of concerns here.
import { TILE, COLS, ROWS, COLORS as C } from './config.js';
import { buildings } from '../data/content.js';
export const pond = { x: 55 * TILE, y: 29 * TILE, w: 7 * TILE, h: 5 * TILE };
const hash = (x, y) => Math.abs(Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1;
function pathAt(x, y) {
    const mainHorizontal = y >= 20 && y <= 22 && x >= 7 && x <= 56;
    const lowerHorizontal = y >= 35 && y <= 37 && x >= 14 && x <= 49;
    const mainVertical = x >= 30 && x <= 33 && y >= 11 && y <= 37;
    const topBranches = (x >= 11 && x <= 13 && y >= 13 && y <= 21) || (x >= 50 && x <= 52 && y >= 13 && y <= 21);
    const lowerBranches = (x >= 15 && x <= 17 && y >= 22 && y <= 37) || (x >= 46 && x <= 48 && y >= 22 && y <= 37);
    return mainHorizontal || lowerHorizontal || mainVertical || topBranches || lowerBranches;
}
function grassTile(p, x, y) {
    const px = x * TILE, py = y * TILE;
    const v = hash(x, y);
    p.fill(v > .65 ? C.grassLight : v < .2 ? C.grassShade : C.grass);
    p.rect(px, py, TILE, TILE);
    if (v > .63) {
        p.fill('#5ba85d');
        p.rect(px + 5, py + 7, 3, 6);
        p.rect(px + 9, py + 10, 3, 4);
    }
    if (v < .13) {
        p.fill('#f9e18b');
        p.rect(px + 6, py + 7, 3, 3);
        p.fill('#f4a6ae');
        p.rect(px + 12, py + 12, 4, 4);
    }
}
function pathTile(p, x, y) {
    const px = x * TILE, py = y * TILE;
    p.fill((x + y) % 4 === 0 ? C.pathHighlight : C.dirt);
    p.rect(px, py, TILE, TILE);
    p.fill(C.dirtShadow);
    if (hash(x, y) > .65)
        p.rect(px + 5, py + 15, 10, 3);
    else
        p.rect(px + 16, py + 5, 4, 3);
    if (hash(y, x) > .78) {
        p.fill('#f8e7bb');
        p.rect(px + 8, py + 5, 7, 3);
    }
}
function drawTree(p, x, y) {
    const px = x * TILE, py = y * TILE;
    p.fill('#3f8357');
    p.rect(px - 9, py - 4, 18, 24);
    p.fill('#4d8b47');
    p.rect(px - 18, py - 26, 36, 30);
    p.fill('#285e4d');
    p.rect(px - 18, py - 29, 36, 8);
    p.fill('#72bc68');
    p.rect(px - 12, py - 21, 24, 17);
    p.rect(px - 18, py - 13, 7, 10);
    p.fill('#9bd478');
    p.rect(px - 9, py - 18, 8, 6);
    p.rect(px + 4, py - 10, 6, 6);
}
export function drawGround(p, camera) {
    p.noStroke();
    p.background('#7fca75');
    const xStart = Math.max(0, Math.floor(camera.x / TILE) - 1), xEnd = Math.min(COLS, Math.ceil((camera.x + 960) / TILE) + 1);
    const yStart = Math.max(0, Math.floor(camera.y / TILE) - 1), yEnd = Math.min(ROWS, Math.ceil((camera.y + 576) / TILE) + 1);
    for (let y = yStart; y < yEnd; y++)
        for (let x = xStart; x < xEnd; x++) {
            if (pathAt(x, y))
                pathTile(p, x, y);
            else
                grassTile(p, x, y);
        }
    // Town square: a stone circle at the crossroads, and its bright central fountain.
    p.fill('#c5d5b6');
    p.rect(30 * TILE, 19 * TILE, 4 * TILE, 5 * TILE);
    p.fill('#9fb0a3');
    p.rect(30 * TILE + 5, 19 * TILE + 4, 4 * TILE - 10, 5 * TILE - 8);
    p.fill('#cde6cf');
    p.rect(30 * TILE + 11, 19 * TILE + 14, 4 * TILE - 22, 5 * TILE - 28);
    p.fill('#4a8790');
    p.ellipse(32 * TILE, 21 * TILE, 53, 48);
    p.fill('#6ed7df');
    p.ellipse(32 * TILE, 21 * TILE - 3, 38, 30);
    p.fill('#ddf5dc');
    p.rect(32 * TILE - 3, 21 * TILE - 22, 6, 15);
}
export function drawDecorations(p) {
    p.noStroke();
    // Pond on the eastern edge of town.
    p.fill('#408e82');
    p.rect(pond.x - 8, pond.y - 8, pond.w + 16, pond.h + 16);
    p.fill('#6dcbd1');
    p.rect(pond.x, pond.y, pond.w, pond.h);
    p.fill('#3fa1b7');
    p.rect(pond.x + 10, pond.y + 12, pond.w - 20, pond.h - 22);
    p.fill('#ade3d7');
    for (let i = 0; i < 5; i++)
        p.rect(pond.x + 19 + i * 25, pond.y + 15 + (i % 2) * 22, 13, 3);
    p.fill('#e3bca8');
    p.rect(pond.x + 20, pond.y + pond.h - 9, 37, 5);
    // Deterministic decorative trees, away from buildings, paths, and the pond.
    for (let x = 2; x < COLS - 1; x += 3)
        for (let y = 2; y < ROWS - 1; y += 4) {
            const nearBuilding = buildings.some(b => x > b.x - 3 && x < b.x + b.w + 2 && y > b.y - 3 && y < b.y + b.h + 2);
            if (pathAt(x, y) || nearBuilding || (x > 53 && y > 27 && y < 37) || hash(x, y) < .61)
                continue;
            drawTree(p, x * TILE, y * TILE);
        }
    // Park flower patches, decorative benches and a little welcome sign.
    for (const [x, y] of [[25, 18], [36, 18], [38, 25], [24, 26], [4, 23], [58, 19]]) {
        p.fill('#377f5f');
        p.rect(x * TILE, y * TILE, 6, 11);
        p.fill('#f7d377');
        p.rect(x * TILE - 2, y * TILE - 3, 9, 6);
        p.fill('#ee88a3');
        p.rect(x * TILE + 11, y * TILE + 6, 6, 6);
    }
    drawSign(p, 22 * TILE, 18 * TILE, 'HELLO!');
    drawSign(p, 42 * TILE, 18 * TILE, 'EXPLORE');
    // A couple of edge picket fences.
    for (let x = 21; x <= 25; x++)
        drawFence(p, x * TILE, 28 * TILE);
    for (let x = 38; x <= 42; x++)
        drawFence(p, x * TILE, 28 * TILE);
}
function drawFence(p, x, y) { p.fill('#f5e9bd'); p.rect(x + 1, y + 3, 6, 17); p.rect(x, y + 8, TILE, 4); p.rect(x, y + 16, TILE, 4); }
function drawSign(p, x, y, label) {
    p.fill('#5e4937');
    p.rect(x - 2, y + 10, 6, 23);
    p.rect(x - 20, y - 8, 44, 24);
    p.fill('#f5d389');
    p.rect(x - 17, y - 5, 38, 18);
    p.fill('#2c4645');
    p.textFont('monospace');
    p.textSize(7);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(label, x + 2, y + 3);
}
function drawHouse(p, b, near) {
    const x = b.x * TILE, y = b.y * TILE, w = b.w * TILE, h = b.h * TILE;
    p.noStroke();
    // Shadow and walls.
    p.fill('#416753');
    p.rect(x + 10, y + h - 10, w - 4, 17);
    p.fill('#304a52');
    p.rect(x, y + 45, w, h - 42);
    p.fill('#faf0c9');
    p.rect(x + 6, y + 50, w - 12, h - 54);
    p.fill('#d8d6ac');
    p.rect(x + 8, y + h - 22, w - 16, 8);
    // Roof silhouette, crisp pixel steps and tiles.
    p.fill('#243944');
    p.rect(x - 8, y + 10, w + 16, 43);
    p.fill(b.color);
    p.rect(x - 4, y + 10, w + 8, 37);
    p.rect(x + 5, y + 1, w - 10, 14);
    p.fill('#ffffff44');
    p.rect(x + 15, y + 11, w - 30, 5);
    p.fill('#233f4a');
    for (let i = 0; i < 4; i++)
        p.rect(x + 18 + i * 43, y + 34, 25, 4);
    p.fill('#2c414a');
    p.rect(x + w - 50, y - 7, 22, 15);
    p.fill('#e6d9b2');
    p.rect(x + w - 47, y - 7, 16, 7);
    // Windows on either side of the centered front door.
    p.fill('#354f52');
    p.rect(x + 18, y + 72, 36, 33);
    p.rect(x + w - 54, y + 72, 36, 33);
    p.fill('#96d6d2');
    p.rect(x + 22, y + 76, 28, 25);
    p.rect(x + w - 50, y + 76, 28, 25);
    p.fill('#fff3ba');
    p.rect(x + 33, y + 76, 5, 25);
    p.rect(x + w - 39, y + 76, 5, 25);
    p.fill('#354f52');
    p.rect(x + 20, y + 88, 33, 4);
    p.rect(x + w - 52, y + 88, 33, 4);
    // Door and a small step. The door is a solid building boundary; interaction is from outside.
    const dx = (b.doorX * TILE) - (x);
    p.fill('#29474f');
    p.rect(x + dx - 4, y + h - 62, 32, 64);
    p.fill('#a85f49');
    p.rect(x + dx, y + h - 58, 24, 57);
    p.fill('#efc575');
    p.rect(x + dx + 17, y + h - 28, 4, 4);
    p.fill('#d6b08a');
    p.rect(x + dx - 9, y + h - 3, 42, 9);
    // Sign banner: built into the roof so map navigation is unambiguous.
    const bannerWidth = Math.max(142, Math.min(w - 22, b.name.length * 12 + 31));
    p.fill(near ? '#f9dc80' : '#173b45');
    p.rect(x + (w - bannerWidth) / 2, y + 43, bannerWidth, 27);
    p.fill(near ? '#1a353b' : '#ffedd1');
    p.textFont('monospace');
    p.textStyle(p.BOLD);
    p.textSize(13);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(b.name, x + w / 2, y + 56);
    p.textStyle(p.NORMAL);
    // Highlight the entrance at close range.
    if (near) {
        p.fill('#fbe181');
        p.rect(b.doorX * TILE + 7, (b.doorY + .2) * TILE + 5, 10, 5);
    }
}
export function drawBuildings(p, nearby) { for (const b of buildings)
    drawHouse(p, b, nearby?.id === b.id); }
