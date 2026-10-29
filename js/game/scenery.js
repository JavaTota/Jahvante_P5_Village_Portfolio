/**
 * Village scenery and environment rendering.
 *
 * Responsibilities:
 * - Draw grass and roads
 * - Draw the town square
 * - Draw buildings and entrances
 * - Draw trees, flowers and signs
 * - Draw the pond and fountain
 *
 * Village roads and plaza:
 * ./mapLayout.js
 *
 * Building definitions:
 * ../data/content.js
 *
 * NPC positions:
 * ../data/npcs.js
 *
 * Collectible positions:
 * ./collectable.js
 */

import { TILE, COLS, ROWS, WIDTH, HEIGHT, COLORS as C } from "./config.js";

import { isRoadTile, isPlazaTile, isWalkwayTile } from "./mapLayout.js";

import { buildings } from "../data/content.js";
import { villagers } from "../data/npcs.js";

import { initialCollectables } from "./collectable.js";

/* =========================================
   POND
   ========================================= */

/**
 * Pond coordinates are expressed in pixels.
 *
 * The pond is an obstacle used by
 * both scenery and movement collision.
 */
export const pond = {
  x: 55 * TILE,
  y: 29 * TILE,
  w: 7 * TILE,
  h: 5 * TILE,
};

/* =========================================
   GENERAL UTILITIES
   ========================================= */

/**
 * Generate a repeatable value between 0 and 1.
 *
 * This makes decorative patterns consistent
 * across frames without Math.random().
 */
function hash(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

/**
 * Determine whether a tile is occupied
 * by one of the village buildings.
 */
function isBuildingTile(x, y) {
  return buildings.some((building) => {
    return (
      x >= building.x &&
      x < building.x + building.w &&
      y >= building.y &&
      y < building.y + building.h
    );
  });
}

/* =========================================
   DECORATION CLEARANCE
   ========================================= */

/**
 * Check whether a tile is near a road
 * or the central town square.
 *
 * Uses the shared mapLayout.js definitions.
 */
function isNearWalkway(x, y, clearance = 2) {
  for (let offsetY = -clearance; offsetY <= clearance; offsetY++) {
    for (let offsetX = -clearance; offsetX <= clearance; offsetX++) {
      if (isWalkwayTile(x + offsetX, y + offsetY)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Keep decorations away from houses
 * and their entrances.
 */
function isNearBuilding(x, y, clearance = 2) {
  return buildings.some((building) => {
    return (
      x >= building.x - clearance &&
      x < building.x + building.w + clearance &&
      y >= building.y - clearance &&
      y < building.y + building.h + clearance
    );
  });
}

/**
 * Keep decorations away from the pond.
 */
function isNearPond(x, y, clearance = 2) {
  const left = pond.x / TILE;
  const top = pond.y / TILE;

  const right = (pond.x + pond.w) / TILE;

  const bottom = (pond.y + pond.h) / TILE;

  return (
    x >= left - clearance &&
    x < right + clearance &&
    y >= top - clearance &&
    y < bottom + clearance
  );
}

/**
 * Avoid drawing trees over villagers.
 */
function isNearVillager(x, y, clearance = 3) {
  return villagers.some((villager) => {
    return (
      Math.abs(x - villager.x) <= clearance &&
      Math.abs(y - villager.y) <= clearance
    );
  });
}

/**
 * Keep collectible tokens visible.
 */
function isNearCollectible(x, y, clearance = 2) {
  return initialCollectables.some((token) => {
    return (
      Math.abs(x - token.x) <= clearance && Math.abs(y - token.y) <= clearance
    );
  });
}

/* =========================================
   GRASS TILES
   ========================================= */

/**
 * Draw one grass tile.
 */
function drawGrassTile(p, x, y) {
  const px = x * TILE;
  const py = y * TILE;

  const variation = hash(x, y);

  const grassColor =
    variation > 0.65 ? C.grassLight : variation < 0.2 ? C.grassShade : C.grass;

  p.fill(grassColor);
  p.rect(px, py, TILE, TILE);

  // Small blades of grass.
  if (variation > 0.65) {
    p.fill("#5ba85d");

    p.rect(px + 5, py + 7, 3, 6);
    p.rect(px + 10, py + 10, 3, 4);
  }

  // Occasional lighter patches.
  if (variation < 0.12) {
    p.fill("#a0d98c");

    p.rect(px + 8, py + 7, 5, 3);
  }
}

/* =========================================
   ROAD TILES
   ========================================= */

/**
 * Draw a dirt road tile.
 *
 * The road position comes from mapLayout.js.
 */
function drawRoadTile(p, x, y) {
  const px = x * TILE;
  const py = y * TILE;

  const roadColor = (x + y) % 4 === 0 ? C.pathHighlight : C.dirt;

  p.fill(roadColor);
  p.rect(px, py, TILE, TILE);

  // Small dirt markings.
  p.fill(C.dirtShadow);

  if (hash(x, y) > 0.65) {
    p.rect(px + 5, py + 15, 10, 3);
  } else {
    p.rect(px + 15, py + 5, 5, 3);
  }
}

/* =========================================
   PLAZA TILES
   ========================================= */

/**
 * Draw one stone tile in the town square.
 *
 * Plaza coordinates also come from
 * mapLayout.js.
 */
function drawPlazaTile(p, x, y) {
  const px = x * TILE;
  const py = y * TILE;

  // Darker stone border.
  p.fill("#b7c8b2");
  p.rect(px, py, TILE, TILE);

  // Light paving.
  p.fill("#cedcc4");

  p.rect(px + 2, py + 2, TILE - 4, TILE - 4);

  // Stone joints.
  p.fill("#a1b49f");

  p.rect(px + 11, py + 2, 2, TILE - 4);

  p.rect(px + 2, py + 11, TILE - 4, 2);
}

/* =========================================
   CENTRAL PLAZA MOSAIC
   ========================================= */

/**
 * Draw a decorative compass mosaic.
 *
 * The mosaic is flat and does not
 * interfere with movement.
 */
function drawPlazaMosaic(p) {
  const x = 33 * TILE;
  const y = 25 * TILE;

  p.push();
  p.noStroke();

  // Outer mosaic.
  p.fill("#86aba0");

  p.rect(x - 14, y - 14, 28, 28);

  // Inner stone.
  p.fill("#dfe9ca");

  p.rect(x - 9, y - 9, 18, 18);

  // North-pointing accent.
  p.fill("#d3aa6e");

  p.triangle(x, y - 12, x - 5, y, x + 5, y);

  // South-pointing accent.
  p.fill("#507b7a");

  p.triangle(x, y + 12, x - 5, y, x + 5, y);

  p.pop();
}

/* =========================================
   BUILDING ENTRANCE PAVING
   ========================================= */

/**
 * Draw a flat stone step outside
 * each building entrance.
 */
function drawEntrancePaving(p) {
  p.noStroke();

  for (const building of buildings) {
    const x = building.doorX * TILE;
    const y = building.doorY * TILE;

    // Light entrance stone.
    p.fill("#e9d4a9");

    p.rect(x + 3, y + 5, TILE - 6, 14);

    // Stone edge.
    p.fill("#c7aa7e");

    p.rect(x + 5, y + 17, TILE - 10, 3);
  }
}

/* =========================================
   DRAW THE GROUND
   ========================================= */

/**
 * Draw only the tiles visible on screen.
 *
 * The camera determines which section
 * of the village should be rendered.
 *
 * IMPORTANT:
 * Road and plaza detection both use
 * the shared mapLayout.js module.
 */
export function drawGround(p, camera) {
  p.noStroke();
  p.background(C.grass);

  const startX = Math.max(0, Math.floor(camera.x / TILE) - 1);

  const endX = Math.min(COLS, Math.ceil((camera.x + WIDTH) / TILE) + 1);

  const startY = Math.max(0, Math.floor(camera.y / TILE) - 1);

  const endY = Math.min(ROWS, Math.ceil((camera.y + HEIGHT) / TILE) + 1);

  /* =====================================
     DRAW VISIBLE TILES
     ===================================== */

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      // Plaza has priority over roads.
      if (isPlazaTile(x, y)) {
        drawPlazaTile(p, x, y);
      }

      // Roads use shared map coordinates.
      else if (isRoadTile(x, y) && !isBuildingTile(x, y)) {
        drawRoadTile(p, x, y);
      }

      // Everything else is grass.
      else {
        drawGrassTile(p, x, y);
      }
    }
  }

  // Ground-level decorations.
  drawPlazaMosaic(p);
  drawEntrancePaving(p);
}

/* =========================================
   TREE DRAWING
   ========================================= */

/**
 * Draw one pixel-art tree.
 *
 * x and y are expressed in tile coordinates.
 */
function drawTree(p, x, y) {
  const px = x * TILE;
  const py = y * TILE;

  p.noStroke();

  // Trunk.
  p.fill("#74543d");

  p.rect(px - 6, py - 5, 12, 25);

  // Dark canopy outline.
  p.fill("#285e4d");

  p.rect(px - 18, py - 29, 36, 31);

  // Main leaves.
  p.fill("#4d8b47");

  p.rect(px - 16, py - 26, 32, 25);

  // Lighter leaves.
  p.fill("#72bc68");

  p.rect(px - 11, py - 22, 23, 17);

  // Highlights.
  p.fill("#9bd478");

  p.rect(px - 9, py - 18, 8, 6);

  p.rect(px + 4, py - 10, 6, 6);
}

/**
 * Check whether a tree can be placed.
 *
 * Trees must not visually obstruct:
 * - Roads
 * - The plaza
 * - Building entrances
 * - Villagers
 * - Collectibles
 * - The pond
 */
function canPlaceTree(x, y) {
  return (
    !isNearWalkway(x, y, 2) &&
    !isNearBuilding(x, y, 2) &&
    !isNearPond(x, y, 2) &&
    !isNearVillager(x, y, 3) &&
    !isNearCollectible(x, y, 2)
  );
}

/* =========================================
   FLOWERS
   ========================================= */

/**
 * Draw a small group of flowers.
 */
function drawFlowerPatch(p, x, y) {
  const px = x * TILE;
  const py = y * TILE;

  p.noStroke();

  // Flower stems.
  p.fill("#377f5f");

  p.rect(px + 5, py + 8, 3, 9);

  p.rect(px + 15, py + 10, 3, 8);

  // Yellow flower.
  p.fill("#f7d377");

  p.rect(px + 2, py + 4, 9, 7);

  // Pink flower.
  p.fill("#ee88a3");

  p.rect(px + 12, py + 7, 9, 7);

  // Flower centers.
  p.fill("#fff0c1");

  p.rect(px + 5, py + 6, 3, 3);

  p.rect(px + 15, py + 9, 3, 3);
}

/**
 * Flowers can appear on grass,
 * but not on roads or obstacles.
 */
function canPlaceFlowers(x, y) {
  return (
    !isWalkwayTile(x, y) &&
    !isBuildingTile(x, y) &&
    !isNearBuilding(x, y, 1) &&
    !isNearPond(x, y, 1) &&
    !isNearVillager(x, y, 1) &&
    !isNearCollectible(x, y, 1)
  );
}

/* =========================================
   WOODEN SIGNS
   ========================================= */

/**
 * Draw a wooden sign.
 *
 * Signs are decorative only.
 */
function drawSign(p, x, y, label) {
  p.noStroke();

  // Sign post.
  p.fill("#5e4937");

  p.rect(x - 2, y + 10, 6, 23);

  // Sign outline.
  p.fill("#30484a");

  p.rect(x - 20, y - 8, 44, 24);

  // Sign face.
  p.fill("#f5d389");

  p.rect(x - 17, y - 5, 38, 18);

  // Text.
  p.fill("#2c4645");

  p.textFont("monospace");
  p.textSize(7);

  p.textAlign(p.CENTER, p.CENTER);

  p.text(label, x + 2, y + 3);
}

/* =========================================
   POND AND FOUNTAIN
   ========================================= */

/**
 * Draw the pond on the eastern side
 * of the village.
 *
 * Unlike the previous central fountain,
 * this fountain stays inside the pond,
 * which is already blocked by collision.
 */
function drawPond(p) {
  p.noStroke();

  // Pond bank.
  p.fill("#408e82");

  p.rect(pond.x - 8, pond.y - 8, pond.w + 16, pond.h + 16);

  // Water.
  p.fill("#6dcbd1");

  p.rect(pond.x, pond.y, pond.w, pond.h);

  // Deeper water.
  p.fill("#3fa1b7");

  p.rect(pond.x + 10, pond.y + 12, pond.w - 20, pond.h - 22);

  /* =====================================
     WATER REFLECTIONS
     ===================================== */

  p.fill("#ade3d7");

  for (let i = 0; i < 5; i++) {
    p.rect(pond.x + 19 + i * 25, pond.y + 15 + (i % 2) * 22, 13, 3);
  }

  /* =====================================
     SMALL FOUNTAIN
     ===================================== */

  const fountainX = pond.x + pond.w / 2;

  const fountainY = pond.y + pond.h / 2;

  p.fill("#d7f4e9");

  p.rect(fountainX - 3, fountainY - 25, 6, 28);

  p.fill("#b8ebed");

  p.rect(fountainX - 14, fountainY - 8, 7, 5);

  p.rect(fountainX + 7, fountainY - 8, 7, 5);
}

/* =========================================
   DECORATIONS
   ========================================= */

/**
 * Draw village decorations.
 *
 * Tree positions are calculated in
 * a repeatable way, so the layout
 * does not change every frame.
 */
export function drawDecorations(p) {
  p.noStroke();

  // Water scenery.
  drawPond(p);

  /* =====================================
     TREES
     ===================================== */

  for (let x = 2; x < COLS - 1; x += 3) {
    for (let y = 3; y < ROWS - 1; y += 4) {
      if (hash(x, y) > 0.7 && canPlaceTree(x, y)) {
        drawTree(p, x, y);
      }
    }
  }

  /* =====================================
     FLOWER PATCHES
     ===================================== */

  const flowerPositions = [
    [5, 14],
    [19, 15],
    [26, 13],
    [38, 16],
    [44, 16],
    [60, 16],
    [5, 27],
    [27, 30],
    [37, 29],
    [58, 38],
    [4, 38],
  ];

  for (const [x, y] of flowerPositions) {
    if (canPlaceFlowers(x, y)) {
      drawFlowerPatch(p, x, y);
    }
  }

  /* =====================================
     VILLAGE SIGNS
     ===================================== */

  drawSign(p, 26 * TILE, 17 * TILE, "HELLO!");

  drawSign(p, 43 * TILE, 16 * TILE, "EXPLORE");
}

/* =========================================
   BUILDING RENDERING
   ========================================= */

/**
 * Draw an individual village building.
 *
 * Coordinates and colors are taken
 * directly from content.js.
 */
function drawHouse(p, building, near) {
  const x = building.x * TILE;
  const y = building.y * TILE;

  const width = building.w * TILE;
  const height = building.h * TILE;

  p.noStroke();

  /* =====================================
     BUILDING SHADOW
     ===================================== */

  p.fill("#416753");

  p.rect(x + 10, y + height - 10, width - 4, 17);

  /* =====================================
     WALLS
     ===================================== */

  // Outer walls.
  p.fill("#304a52");

  p.rect(x, y + 45, width, height - 42);

  // Main wall.
  p.fill("#faf0c9");

  p.rect(x + 6, y + 50, width - 12, height - 54);

  // Foundation.
  p.fill("#d8d6ac");

  p.rect(x + 8, y + height - 22, width - 16, 8);

  /* =====================================
     ROOF
     ===================================== */

  // Dark roof outline.
  p.fill("#243944");

  p.rect(x - 8, y + 10, width + 16, 43);

  // Main roof.
  p.fill(building.color);

  p.rect(x - 4, y + 10, width + 8, 37);

  p.rect(x + 5, y + 1, width - 10, 14);

  // Roof highlight.
  p.fill("#ffffff44");

  p.rect(x + 15, y + 11, width - 30, 5);

  // Roof tile details.
  p.fill("#233f4a");

  for (let i = 0; i < 4; i++) {
    p.rect(x + 18 + i * 43, y + 34, 25, 4);
  }

  // Chimney.
  p.fill("#2c414a");

  p.rect(x + width - 50, y - 7, 22, 15);

  p.fill("#e6d9b2");

  p.rect(x + width - 47, y - 7, 16, 7);

  /* =====================================
     WINDOWS
     ===================================== */

  // Frames.
  p.fill("#354f52");

  p.rect(x + 18, y + 72, 36, 33);

  p.rect(x + width - 54, y + 72, 36, 33);

  // Glass.
  p.fill("#96d6d2");

  p.rect(x + 22, y + 76, 28, 25);

  p.rect(x + width - 50, y + 76, 28, 25);

  // Window reflections.
  p.fill("#fff3ba");

  p.rect(x + 33, y + 76, 5, 25);

  p.rect(x + width - 39, y + 76, 5, 25);

  /* =====================================
     BUILDING ENTRANCE
     ===================================== */

  /**
   * Door location comes directly
   * from the building data.
   */
  const doorX = building.doorX * TILE;

  const doorY = y + height - 62;

  // Door outline.
  p.fill("#29474f");

  p.rect(doorX - 4, doorY, 32, 64);

  // Wooden door.
  p.fill("#a85f49");

  p.rect(doorX, doorY + 4, 24, 57);

  // Handle.
  p.fill("#efc575");

  p.rect(doorX + 17, doorY + 34, 4, 4);

  // Front doorstep.
  p.fill("#d6b08a");

  p.rect(doorX - 9, y + height - 3, 42, 9);

  /* =====================================
     BUILDING NAME
     ===================================== */

  const bannerWidth = Math.max(
    142,
    Math.min(width - 22, building.name.length * 12 + 31),
  );

  p.fill(near ? "#f9dc80" : "#173b45");

  p.rect(x + (width - bannerWidth) / 2, y + 43, bannerWidth, 27);

  p.fill(near ? "#1a353b" : "#ffedd1");

  p.textFont("monospace");
  p.textStyle(p.BOLD);
  p.textSize(13);

  p.textAlign(p.CENTER, p.CENTER);

  p.text(building.name, x + width / 2, y + 56);

  p.textStyle(p.NORMAL);

  /* =====================================
     ENTRANCE HIGHLIGHT
     ===================================== */

  if (near) {
    p.fill("#fbe181");

    p.rect(building.doorX * TILE + 7, building.doorY * TILE + 9, 10, 5);
  }
}

/* =========================================
   DRAW ALL BUILDINGS
   ========================================= */

/**
 * Draw every building in the village.
 *
 * nearby is the building currently
 * within interaction range.
 */
export function drawBuildings(p, nearby) {
  for (const building of buildings) {
    const isNearby = nearby?.id === building.id;

    drawHouse(p, building, isNearby);
  }
}
