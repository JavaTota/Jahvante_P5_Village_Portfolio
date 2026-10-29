/**
 * Shared village map layout.
 *
 * Responsibilities:
 * - Define the village street network
 * - Define the central town square
 * - Identify road and plaza tiles
 * - Provide movement costs for pathfinding
 *
 * Used by:
 * - scenery.js    → draws roads and the plaza
 * - navigation.js → calculates routes
 *
 * Coordinates are expressed in MAP TILES,
 * not pixels.
 *
 * To change the roads in the future,
 * edit this file instead of multiple files.
 */

/* =========================================
   MOVEMENT COSTS
   ========================================= */

/**
 * Lower movement costs are preferred
 * by the A* pathfinding algorithm.
 *
 * The character can walk on both
 * streets and grass.
 */
export const ROAD_COST = 1;

export const GRASS_COST = 3;

/* =========================================
   VILLAGE STREETS
   ========================================= */

/**
 * Each street is a rectangular area.
 *
 * x1, y1 → First tile
 * x2, y2 → Last tile (inclusive)
 *
 * All streets connect without running
 * through the six buildings.
 */
export const ROAD_AREAS = [
  // ======================================
  // MAIN STREET
  // ======================================

  {
    id: "main-street",
    name: "Main Street",

    x1: 6,
    y1: 19,

    x2: 57,
    y2: 22,
  },

  // ======================================
  // NORTH SIDE
  // ======================================

  // Road to Project Lab.
  {
    id: "projects-road",
    name: "Project Lab Road",

    x1: 11,
    y1: 12,

    x2: 13,
    y2: 21,
  },

  // Road to Guild Hall.
  {
    id: "experience-road",
    name: "Guild Hall Road",

    x1: 31,
    y1: 11,

    x2: 33,
    y2: 21,
  },

  // Road to Skill Shop.
  {
    id: "skills-road",
    name: "Skill Shop Road",

    x1: 50,
    y1: 12,

    x2: 52,
    y2: 21,
  },

  // ======================================
  // NORTH-SOUTH CONNECTIONS
  // ======================================

  // Western connecting street.
  {
    id: "west-connection",
    name: "West Connection",

    x1: 23,
    y1: 21,

    x2: 25,
    y2: 37,
  },

  // Eastern connecting street.
  {
    id: "east-connection",
    name: "East Connection",

    x1: 39,
    y1: 21,

    x2: 41,
    y2: 37,
  },

  // ======================================
  // SOUTH SIDE
  // ======================================

  // Connects My Home, Trophy Hall,
  // and the Post Office.
  {
    id: "south-street",
    name: "South Street",

    x1: 11,
    y1: 35,

    x2: 53,
    y2: 37,
  },
];

/* =========================================
   TOWN SQUARE
   ========================================= */

/**
 * Open paved plaza near the center
 * of the village.
 *
 * This area is fully walkable.
 */
export const PLAZA_AREA = {
  id: "town-square",
  name: "Town Square",

  x1: 29,
  y1: 23,

  x2: 36,
  y2: 26,
};

/* =========================================
   MAP AREA UTILITIES
   ========================================= */

/**
 * Check whether a tile is inside
 * a rectangular area.
 *
 * Both boundaries are inclusive.
 *
 * @param {number} x - Tile column
 * @param {number} y - Tile row
 * @param {Object} area - Rectangular area
 *
 * @returns {boolean}
 */
export function isTileInsideArea(x, y, area) {
  return x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2;
}

/* =========================================
   ROAD DETECTION
   ========================================= */

/**
 * Check whether a tile belongs to
 * any of the village streets.
 *
 * @returns {boolean}
 */
export function isRoadTile(x, y) {
  return ROAD_AREAS.some((road) => {
    return isTileInsideArea(x, y, road);
  });
}

/* =========================================
   PLAZA DETECTION
   ========================================= */

/**
 * Check whether a tile belongs
 * to the central town square.
 *
 * @returns {boolean}
 */
export function isPlazaTile(x, y) {
  return isTileInsideArea(x, y, PLAZA_AREA);
}

/* =========================================
   WALKWAY DETECTION
   ========================================= */

/**
 * Check whether a tile is part of
 * the village's preferred walking network.
 *
 * A walkway is either:
 * - A street
 * - The town square
 *
 * Note:
 * Grass is still walkable according
 * to logic.js.
 *
 * @returns {boolean}
 */
export function isWalkwayTile(x, y) {
  return isRoadTile(x, y) || isPlazaTile(x, y);
}

/* =========================================
   MOVEMENT COSTS
   ========================================= */

/**
 * Return the movement cost for a tile.
 *
 * Roads and the plaza are cheaper
 * than walking across grass.
 *
 * This encourages A* pathfinding
 * to follow the street network.
 *
 * @param {number} x - Tile column
 * @param {number} y - Tile row
 *
 * @returns {number}
 */
export function movementCostForTile(x, y) {
  if (isWalkwayTile(x, y)) {
    return ROAD_COST;
  }

  return GRASS_COST;
}
