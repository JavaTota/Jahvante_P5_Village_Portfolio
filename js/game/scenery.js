/**
 * Village scenery and street layout.
 *
 * Responsibilities:
 * - Draw grass and dirt streets
 * - Connect streets to building entrances
 * - Draw trees, flowers and decorations
 * - Draw the pond and town square
 * - Draw all six buildings
 *
 * Building positions are defined in:
 * js/data/content.js
 */

import { TILE, COLS, ROWS, WIDTH, HEIGHT, COLORS as C } from "./config.js";

import { buildings } from "../data/content.js";

/* =========================================
   POND
   ========================================= */

export const pond = {
  x: 55 * TILE,
  y: 29 * TILE,
  w: 7 * TILE,
  h: 5 * TILE,
};

/* =========================================
   VILLAGE STREET NETWORK
   ========================================= */

/**
 * Street coordinates use map tiles.
 *
 * Each rectangle includes both its starting
 * and ending tile.
 *
 * Every building entrance connects to this
 * network without crossing another building.
 */

const streets = [
  // Main east-west street.
  {
    x1: 6,
    y1: 19,
    x2: 57,
    y2: 22,
  },

  // Northern building entrances.
  {
    x1: 11,
    y1: 12,
    x2: 13,
    y2: 21,
  },

  {
    x1: 31,
    y1: 11,
    x2: 33,
    y2: 21,
  },

  {
    x1: 50,
    y1: 12,
    x2: 52,
    y2: 21,
  },

  // Connecting streets between buildings.
  // These pass through the open spaces
  // between the southern houses.
  {
    x1: 23,
    y1: 21,
    x2: 25,
    y2: 37,
  },

  {
    x1: 39,
    y1: 21,
    x2: 41,
    y2: 37,
  },

  // Southern east-west street.
  // All three southern entrances face it.
  {
    x1: 11,
    y1: 35,
    x2: 53,
    y2: 37,
  },
];

/**
 * Return a repeatable pseudo-random value
 * between 0 and 1 for a given tile.
 *
 * This keeps scenery visually consistent
 * between frames.
 */
function hash(x, y) {
  return Math.abs(Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1;
}

/* =========================================
   ROAD DETECTION
   ========================================= */

/**
 * Check whether a tile belongs to a street.
 */
function isStreetTile(x, y) {
  return streets.some((street) => {
    return x >= street.x1 && x <= street.x2 && y >= street.y1 && y <= street.y2;
  });
}

/**
 * Check whether a tile falls inside
 * a building footprint.
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

/**
 * A street must never overlap a building.
 */
function pathAt(x, y) {
  return isStreetTile(x, y) && !isBuildingTile(x, y);
}

/**
 * Keep trees away from streets.
 *
 * The extra tile of clearance prevents
 * tree canopies from covering the road.
 */
function isNearStreet(x, y) {
  for (let offsetY = -1; offsetY <= 1; offsetY++) {
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      if (pathAt(x + offsetX, y + offsetY)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Keep trees away from houses.
 */
function isNearBuilding(x, y) {
  return buildings.some((building) => {
    return (
      x >= building.x - 2 &&
      x < building.x + building.w + 2 &&
      y >= building.y - 2 &&
      y < building.y + building.h + 2
    );
  });
}

/**
 * Keep decorations away from the pond.
 */
function isNearPond(x, y) {
  const pondLeft = pond.x / TILE;
  const pondTop = pond.y / TILE;
  const pondRight = (pond.x + pond.w) / TILE;
  const pondBottom = (pond.y + pond.h) / TILE;

  return (
    x >= pondLeft - 2 &&
    x <= pondRight + 1 &&
    y >= pondTop - 2 &&
    y <= pondBottom + 1
  );
}

/* =========================================
   GROUND TILES
   ========================================= */

/**
 * Draw one grass tile.
 */
function grassTile(p, x, y) {
  const px = x * TILE;
  const py = y * TILE;

  const variation = hash(x, y);

  const color =
    variation > 0.65 ? C.grassLight : variation < 0.2 ? C.grassShade : C.grass;

  p.fill(color);
  p.rect(px, py, TILE, TILE);

  // Small grass details.
  if (variation > 0.63) {
    p.fill("#5ba85d");

    p.rect(px + 5, py + 7, 3, 6);
    p.rect(px + 9, py + 10, 3, 4);
  }

  // Occasional flowers.
  if (variation < 0.13) {
    p.fill("#f9e18b");
    p.rect(px + 6, py + 7, 3, 3);

    p.fill("#f4a6ae");
    p.rect(px + 12, py + 12, 4, 4);
  }
}

/**
 * Draw one dirt street tile.
 */
function pathTile(p, x, y) {
  const px = x * TILE;
  const py = y * TILE;

  p.fill((x + y) % 4 === 0 ? C.pathHighlight : C.dirt);

  p.rect(px, py, TILE, TILE);

  // Small patches of darker dirt.
  p.fill(C.dirtShadow);

  if (hash(x, y) > 0.65) {
    p.rect(px + 5, py + 15, 10, 3);
  } else {
    p.rect(px + 16, py + 5, 4, 3);
  }

  // Occasional light stones.
  if (hash(y, x) > 0.78) {
    p.fill("#f8e7bb");
    p.rect(px + 8, py + 5, 7, 3);
  }
}

/* =========================================
   TOWN SQUARE
   ========================================= */

/**
 * Draw a small paved square beside the
 * central road.
 *
 * The fountain is positioned away from
 * the main street and the connecting roads.
 */
function drawTownSquare(p) {
  const x = 29 * TILE;
  const y = 23 * TILE;

  const width = 8 * TILE;
  const height = 4 * TILE;

  // Stone square.
  p.fill("#c5d5b6");

  p.rect(x, y, width, height);

  p.fill("#9fb0a3");

  p.rect(x + 5, y + 5, width - 10, height - 10);

  // Lighter paving.
  p.fill("#cde6cf");

  p.rect(x + 12, y + 12, width - 24, height - 24);

  // Decorative fountain, offset to one side.
  // It does not cover the main streets.
  const fountainX = 35 * TILE;
  const fountainY = 25 * TILE;

  p.fill("#4a8790");
  p.ellipse(fountainX, fountainY, 44, 38);

  p.fill("#6ed7df");

  p.ellipse(fountainX, fountainY - 2, 30, 24);

  p.fill("#ddf5dc");

  p.rect(fountainX - 3, fountainY - 18, 6, 13);
}

/* =========================================
   DRAW THE GROUND
   ========================================= */

/**
 * Draw only tiles visible to the camera.
 *
 * This keeps the game efficient even when
 * the village is larger than the screen.
 */
export function drawGround(p, camera) {
  p.noStroke();
  p.background(C.grass);

  const xStart = Math.max(0, Math.floor(camera.x / TILE) - 1);

  const xEnd = Math.min(COLS, Math.ceil((camera.x + WIDTH) / TILE) + 1);

  const yStart = Math.max(0, Math.floor(camera.y / TILE) - 1);

  const yEnd = Math.min(ROWS, Math.ceil((camera.y + HEIGHT) / TILE) + 1);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      if (pathAt(x, y)) {
        pathTile(p, x, y);
      } else {
        grassTile(p, x, y);
      }
    }
  }

  drawTownSquare(p);
}

/* =========================================
   TREES
   ========================================= */

/**
 * Draw one pixel-art tree.
 */
function drawTree(p, x, y) {
  p.fill("#3f8357");

  // Trunk.
  p.rect(x - 9, y - 4, 18, 24);

  // Main canopy.
  p.fill("#4d8b47");

  p.rect(x - 18, y - 26, 36, 30);

  // Dark upper edge.
  p.fill("#285e4d");

  p.rect(x - 18, y - 29, 36, 8);

  // Leaf highlights.
  p.fill("#72bc68");

  p.rect(x - 12, y - 21, 24, 17);
  p.rect(x - 18, y - 13, 7, 10);

  p.fill("#9bd478");

  p.rect(x - 9, y - 18, 8, 6);
  p.rect(x + 4, y - 10, 6, 6);
}

/* =========================================
   FLOWERS
   ========================================= */

/**
 * Draw a small decorative flower patch.
 */
function drawFlowers(p, x, y) {
  const px = x * TILE;
  const py = y * TILE;

  // Stems.
  p.fill("#377f5f");

  p.rect(px, py, 6, 11);

  // Yellow flower.
  p.fill("#f7d377");

  p.rect(px - 2, py - 3, 9, 6);

  // Pink flower.
  p.fill("#ee88a3");

  p.rect(px + 11, py + 6, 6, 6);
}

/* =========================================
   SIGNS
   ========================================= */

/**
 * Draw a wooden village sign.
 */
function drawSign(p, x, y, label) {
  // Wooden post.
  p.fill("#5e4937");

  p.rect(x - 2, y + 10, 6, 23);

  // Sign outline.
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
   POND
   ========================================= */

/**
 * Draw the pond on the eastern side of town.
 */
function drawPond(p) {
  // Outer bank.
  p.fill("#408e82");

  p.rect(pond.x - 8, pond.y - 8, pond.w + 16, pond.h + 16);

  // Water.
  p.fill("#6dcbd1");

  p.rect(pond.x, pond.y, pond.w, pond.h);

  // Deeper water.
  p.fill("#3fa1b7");

  p.rect(pond.x + 10, pond.y + 12, pond.w - 20, pond.h - 22);

  // Water highlights.
  p.fill("#ade3d7");

  for (let i = 0; i < 5; i++) {
    p.rect(pond.x + 19 + i * 25, pond.y + 15 + (i % 2) * 22, 13, 3);
  }
}

/* =========================================
   DECORATIONS
   ========================================= */

/**
 * Draw village decorations.
 *
 * Trees are kept away from:
 * - Streets
 * - Buildings
 * - The pond
 */
export function drawDecorations(p) {
  p.noStroke();

  drawPond(p);

  // Decorative trees.
  for (let x = 2; x < COLS - 1; x += 3) {
    for (let y = 2; y < ROWS - 1; y += 4) {
      if (
        isNearStreet(x, y) ||
        isNearBuilding(x, y) ||
        isNearPond(x, y) ||
        hash(x, y) < 0.61
      ) {
        continue;
      }

      drawTree(p, x * TILE, y * TILE);
    }
  }

  // Flower patches away from streets.
  const flowerPositions = [
    [4, 7],
    [22, 8],
    [43, 8],
    [59, 9],
    [5, 28],
    [26, 30],
    [38, 30],
    [57, 40],
  ];

  for (const [x, y] of flowerPositions) {
    if (!isStreetTile(x, y) && !isBuildingTile(x, y) && !isNearPond(x, y)) {
      drawFlowers(p, x, y);
    }
  }

  // Welcome signs positioned off the streets.
  drawSign(p, 22 * TILE, 16 * TILE, "HELLO!");

  drawSign(p, 44 * TILE, 16 * TILE, "EXPLORE");
}

/* =========================================
   BUILDINGS
   ========================================= */

/**
 * Draw one village building.
 */
function drawHouse(p, building, near) {
  const x = building.x * TILE;
  const y = building.y * TILE;

  const width = building.w * TILE;
  const height = building.h * TILE;

  p.noStroke();

  // Building shadow.
  p.fill("#416753");

  p.rect(x + 10, y + height - 10, width - 4, 17);

  // Outer walls.
  p.fill("#304a52");

  p.rect(x, y + 45, width, height - 42);

  // Main walls.
  p.fill("#faf0c9");

  p.rect(x + 6, y + 50, width - 12, height - 54);

  // Foundation.
  p.fill("#d8d6ac");

  p.rect(x + 8, y + height - 22, width - 16, 8);

  /* =====================================
     ROOF
     ===================================== */

  p.fill("#243944");

  p.rect(x - 8, y + 10, width + 16, 43);

  p.fill(building.color);

  p.rect(x - 4, y + 10, width + 8, 37);

  p.rect(x + 5, y + 1, width - 10, 14);

  // Roof highlight.
  p.fill("#ffffff44");

  p.rect(x + 15, y + 11, width - 30, 5);

  // Roof tiles.
  p.fill("#233f4a");

  for (let i = 0; i < 4; i++) {
    p.rect(x + 18 + i * 43, y + 34, 25, 4);
  }

  /* =====================================
     WINDOWS
     ===================================== */

  p.fill("#354f52");

  p.rect(x + 18, y + 72, 36, 33);

  p.rect(x + width - 54, y + 72, 36, 33);

  p.fill("#96d6d2");

  p.rect(x + 22, y + 76, 28, 25);

  p.rect(x + width - 50, y + 76, 28, 25);

  // Window reflections.
  p.fill("#fff3ba");

  p.rect(x + 33, y + 76, 5, 25);

  p.rect(x + width - 39, y + 76, 5, 25);

  /* =====================================
     ENTRANCE
     ===================================== */

  // Door position comes from content.js.
  const doorOffset = building.doorX * TILE - x;

  p.fill("#29474f");

  p.rect(x + doorOffset - 4, y + height - 62, 32, 64);

  p.fill("#a85f49");

  p.rect(x + doorOffset, y + height - 58, 24, 57);

  // Door handle.
  p.fill("#efc575");

  p.rect(x + doorOffset + 17, y + height - 28, 4, 4);

  // Front step.
  p.fill("#d6b08a");

  p.rect(x + doorOffset - 9, y + height - 3, 42, 9);

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

    p.rect(building.doorX * TILE + 7, (building.doorY + 0.2) * TILE + 5, 10, 5);
  }
}

/**
 * Draw every village building.
 */
export function drawBuildings(p, nearby) {
  for (const building of buildings) {
    const isNearby = nearby?.id === building.id;

    drawHouse(p, building, isNearby);
  }
}
