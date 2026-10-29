/**
 * Village layout and navigation tests.
 *
 * Checks:
 * - World boundaries
 * - Connected streets and town square
 * - Road and plaza movement costs
 * - Building placement and entrances
 * - Player spawn and teleporting
 * - NPC placement and navigation
 * - Collectible placement and navigation
 *
 * Run:
 * npm test
 */

import test from "node:test";
import assert from "node:assert/strict";

import { TILE, COLS, ROWS } from "../game/config.js";

import {
  makePlayer,
  canWalkAt,
  nearbyBuilding,
  teleportSquare,
  teleportToDoor,
} from "../game/logic.js";

import { createClickNavigation, hitBuilding } from "../game/navigation.js";

import {
  ROAD_AREAS,
  PLAZA_AREA,
  ROAD_COST,
  GRASS_COST,
  isRoadTile,
  isPlazaTile,
  isWalkwayTile,
  movementCostForTile,
} from "../game/mapLayout.js";

import { pond } from "../game/scenery.js";

import { initialCollectables, collectOnTouch } from "../game/collectable.js";

import { buildings } from "../data/content.js";
import { villagers } from "../data/npcs.js";
import { npcPosition } from "../game/npcCharacters.js";

/* =========================================
   TEST HELPERS
   ========================================= */

/**
 * Convert tile coordinates to pixels.
 */
function tileCenter(x, y) {
  return {
    x: x * TILE + TILE / 2,
    y: y * TILE + TILE / 2,
  };
}

/**
 * Generate every tile contained in an area.
 */
function* tilesInArea(area) {
  for (let y = area.y1; y <= area.y2; y++) {
    for (let x = area.x1; x <= area.x2; x++) {
      yield { x, y };
    }
  }
}

/**
 * Determine if a tile is inside a building.
 */
function buildingContainsTile(building, x, y) {
  return (
    x >= building.x &&
    x < building.x + building.w &&
    y >= building.y &&
    y < building.y + building.h
  );
}

/**
 * Create a unique identifier for a tile.
 */
function tileKey(x, y) {
  return `${x},${y}`;
}

/**
 * Simulate movement until an action completes.
 *
 * The simulation stops if the route ends
 * without completing the expected action.
 */
function runNavigation(
  navigation,
  isComplete,
  description,
  onFrame = () => {},
) {
  const maximumFrames = 2500;

  for (let frame = 0; frame < maximumFrames; frame++) {
    onFrame();

    if (isComplete()) {
      return;
    }

    if (!navigation.hasRoute()) {
      break;
    }

    navigation.tick(1);
  }

  assert.ok(isComplete(), `${description}: navigation did not complete.`);
}

/* =========================================
   WORLD AND PLAYER TESTS
   ========================================= */

test("The player starts on walkable ground", () => {
  const player = makePlayer();

  assert.ok(
    canWalkAt(player.x, player.y, pond),
    "Player starting position is blocked.",
  );

  assert.ok(
    isPlazaTile(Math.floor(player.x / TILE), Math.floor(player.y / TILE)),
    "The player should start in the town square.",
  );
});

test("Teleporting preserves the selected character", () => {
  const player = makePlayer();

  player.character = {
    id: "nea",
    sprite: "nea",
  };

  teleportSquare(player);

  assert.equal(player.character.id, "nea");

  assert.ok(canWalkAt(player.x, player.y, pond));
});

/* =========================================
   SHARED STREET LAYOUT TESTS
   ========================================= */

test("All roads and the plaza fit inside the map", () => {
  const areas = [...ROAD_AREAS, PLAZA_AREA];

  for (const area of areas) {
    assert.ok(
      area.x1 >= 0 &&
        area.y1 >= 0 &&
        area.x1 <= area.x2 &&
        area.y1 <= area.y2 &&
        area.x2 < COLS &&
        area.y2 < ROWS,
      `${area.name} is outside the world.`,
    );
  }
});

test("Road and plaza detection use the shared layout", () => {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const road = isRoadTile(x, y);
      const plaza = isPlazaTile(x, y);

      assert.equal(
        isWalkwayTile(x, y),
        road || plaza,
        `Incorrect walkway detection at (${x}, ${y}).`,
      );

      assert.equal(
        movementCostForTile(x, y),
        road || plaza ? ROAD_COST : GRASS_COST,
        `Incorrect movement cost at (${x}, ${y}).`,
      );
    }
  }

  assert.ok(ROAD_COST < GRASS_COST, "Roads should be preferred over grass.");
});

test("Every street and plaza tile is walkable", () => {
  const areas = [...ROAD_AREAS, PLAZA_AREA];

  for (const area of areas) {
    for (const { x, y } of tilesInArea(area)) {
      const position = tileCenter(x, y);

      assert.ok(
        canWalkAt(position.x, position.y, pond),
        `${area.name} is blocked at tile (${x}, ${y}).`,
      );
    }
  }
});

/* =========================================
   ROAD CONNECTIVITY
   ========================================= */

/**
 * All street tiles must belong to one
 * connected walking network.
 *
 * We use a breadth-first search with
 * four-directional movement.
 */
test("All streets connect to the town square", () => {
  const start = makePlayer();

  const startTile = {
    x: Math.floor(start.x / TILE),
    y: Math.floor(start.y / TILE),
  };

  const queue = [startTile];

  const visited = new Set([tileKey(startTile.x, startTile.y)]);

  const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

  let index = 0;

  while (index < queue.length) {
    const current = queue[index++];

    for (const [dx, dy] of directions) {
      const x = current.x + dx;
      const y = current.y + dy;

      if (!isWalkwayTile(x, y)) {
        continue;
      }

      const key = tileKey(x, y);

      if (visited.has(key)) {
        continue;
      }

      visited.add(key);
      queue.push({ x, y });
    }
  }

  // Every walkway tile must be reachable.
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!isWalkwayTile(x, y)) {
        continue;
      }

      assert.ok(
        visited.has(tileKey(x, y)),
        `Street tile (${x}, ${y}) is disconnected.`,
      );
    }
  }
});

/* =========================================
   BUILDING PLACEMENT
   ========================================= */

test("All buildings fit inside the village", () => {
  for (const building of buildings) {
    assert.ok(
      building.x >= 0 &&
        building.y >= 0 &&
        building.x + building.w <= COLS &&
        building.y + building.h <= ROWS,
      `${building.name} is outside the map.`,
    );
  }
});

test("Buildings do not overlap one another", () => {
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const a = buildings[i];
      const b = buildings[j];

      const overlapping =
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y;

      assert.equal(overlapping, false, `${a.name} overlaps ${b.name}.`);
    }
  }
});

test("No building blocks a street", () => {
  for (const building of buildings) {
    for (let y = building.y; y < building.y + building.h; y++) {
      for (let x = building.x; x < building.x + building.w; x++) {
        assert.equal(
          isWalkwayTile(x, y),
          false,
          `${building.name} overlaps a road at (${x}, ${y}).`,
        );
      }
    }
  }
});

/* =========================================
   BUILDING ENTRANCES
   ========================================= */

for (const building of buildings) {
  test(`${building.name} has a valid entrance`, () => {
    const { doorX, doorY } = building;

    assert.ok(
      doorX >= building.x && doorX < building.x + building.w,
      `${building.name} entrance is not aligned with its building.`,
    );

    assert.equal(
      doorY,
      building.y + building.h,
      `${building.name} entrance should be below the building.`,
    );

    assert.ok(
      isWalkwayTile(doorX, doorY),
      `${building.name} entrance is not connected to a road.`,
    );

    assert.equal(
      buildingContainsTile(building, doorX, doorY),
      false,
      `${building.name} entrance is inside the building.`,
    );

    const entrance = tileCenter(doorX, doorY);

    assert.ok(
      canWalkAt(entrance.x, entrance.y, pond),
      `${building.name} entrance is blocked.`,
    );
  });
}

/* =========================================
   BUILDING TELEPORTATION
   ========================================= */

for (const building of buildings) {
  test(`Teleporting to ${building.name} is safe`, () => {
    const player = makePlayer();

    player.character = {
      id: "jahvante",
    };

    teleportToDoor(player, building);

    assert.ok(
      canWalkAt(player.x, player.y, pond),
      `${building.name} teleport destination is blocked.`,
    );

    assert.equal(
      player.character.id,
      "jahvante",
      "Teleporting changed the selected character.",
    );

    assert.equal(
      nearbyBuilding(player)?.id,
      building.id,
      `Player cannot interact with ${building.name}.`,
    );
  });
}

/* =========================================
   BUILDING CLICK NAVIGATION
   ========================================= */

for (const building of buildings) {
  test(`Clicking ${building.name} reaches its door`, () => {
    const player = makePlayer();

    let enteredBuilding = null;

    const navigation = createClickNavigation(
      player,
      pond,
      (id) => {
        enteredBuilding = id;
      },
      () => {},
    );

    const buildingCenter = tileCenter(
      building.x + Math.floor(building.w / 2),
      building.y + Math.floor(building.h / 2),
    );

    const clickedBuilding = hitBuilding(buildingCenter.x, buildingCenter.y);

    assert.equal(clickedBuilding?.id, building.id);

    assert.ok(
      navigation.navigateTo(
        buildingCenter.x,
        buildingCenter.y,
        clickedBuilding,
      ),
      `Could not calculate a route to ${building.name}.`,
    );

    runNavigation(
      navigation,
      () => enteredBuilding === building.id,
      building.name,
    );
  });
}

/* =========================================
   NPC PLACEMENT
   ========================================= */

test("Villagers are spread across accessible areas", () => {
  for (const npc of villagers) {
    const position = npcPosition(npc);

    assert.ok(
      npc.x >= 0 && npc.x < COLS && npc.y >= 0 && npc.y < ROWS,
      `${npc.name} is outside the map.`,
    );

    for (const building of buildings) {
      assert.equal(
        buildingContainsTile(building, npc.x, npc.y),
        false,
        `${npc.name} is inside ${building.name}.`,
      );
    }

    // NPCs should be reasonably close
    // to the connected street network.
    let nearStreet = false;

    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (isWalkwayTile(npc.x + dx, npc.y + dy)) {
          nearStreet = true;
        }
      }
    }

    assert.ok(nearStreet, `${npc.name} is too far from the streets.`);

    assert.ok(position.x >= 0 && position.y >= 0);
  }
});

/* =========================================
   NPC NAVIGATION
   ========================================= */

for (const npc of villagers) {
  test(`Player can reach and talk to ${npc.name}`, () => {
    const player = makePlayer();

    let conversationStarted = false;

    const navigation = createClickNavigation(
      player,
      pond,
      () => {},
      (villager) => {
        if (villager.id === npc.id) {
          conversationStarted = true;
        }
      },
    );

    assert.ok(
      navigation.navigateToNPC(npc),
      `Cannot calculate a route to ${npc.name}.`,
    );

    runNavigation(navigation, () => conversationStarted, npc.name);
  });
}

/* =========================================
   COLLECTIBLE PLACEMENT
   ========================================= */

test("All five collectibles are on walkable streets", () => {
  assert.equal(initialCollectables.length, 5, "Expected five collectibles.");

  const ids = initialCollectables.map((item) => item.id);

  assert.equal(
    new Set(ids).size,
    ids.length,
    "Collectible IDs are not unique.",
  );

  for (const token of initialCollectables) {
    const position = tileCenter(token.x, token.y);

    assert.ok(
      isWalkwayTile(token.x, token.y),
      `${token.label} is not on a street or plaza.`,
    );

    assert.ok(
      canWalkAt(position.x, position.y, pond),
      `${token.label} is blocked by an obstacle.`,
    );
  }
});

/* =========================================
   COLLECTIBLE NAVIGATION
   ========================================= */

for (const token of initialCollectables) {
  test(`Player can reach and collect ${token.label}`, () => {
    const player = makePlayer();

    // Use a fresh copy so tests don't
    // mutate the game's original data.
    const items = [
      {
        ...token,
        found: false,
      },
    ];

    const target = tileCenter(token.x, token.y);

    const navigation = createClickNavigation(
      player,
      pond,
      () => {},
      () => {},
    );

    assert.ok(
      navigation.navigateTo(target.x, target.y),
      `No route to ${token.label}.`,
    );

    runNavigation(
      navigation,

      () => items[0].found,

      token.label,

      () => {
        collectOnTouch(player, items, TILE);
      },
    );

    assert.equal(items[0].found, true, `${token.label} was not collected.`);
  });
}
