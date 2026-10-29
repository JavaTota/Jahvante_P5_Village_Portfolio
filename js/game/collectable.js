/**
 * Technology collectibles for Jahvantè Town.
 *
 * Responsibilities:
 * - Define collectible tokens
 * - Draw tokens in the village
 * - Animate floating tokens
 * - Detect when a player collects a token
 *
 * Token positions use tile coordinates.
 *
 * To add a token, edit initialCollectables.
 */

/* =========================================
   COLLECTIBLE DEFINITIONS
   ========================================= */

/**
 * Five collectible tokens distributed
 * across the village streets.
 *
 * Keep tokens outside buildings, water,
 * and other obstacles.
 */
export const initialCollectables = [
  {
    x: 19,
    y: 20,
    label: "React",
  },

  {
    x: 45,
    y: 20,
    label: "Python",
  },

  {
    x: 24,
    y: 28,
    label: "APIs",
  },

  {
    x: 40,
    y: 30,
    label: "TypeScript",
  },

  {
    x: 32,
    y: 37,
    label: "Teamwork",
  },
].map((item, index) => ({
  ...item,
  id: index,
  found: false,
}));

/* =========================================
   DRAW COLLECTIBLES
   ========================================= */

/**
 * Draw all uncollected tokens.
 *
 * @param {p5} p - p5.js instance
 * @param {Array} items - Collectible tokens
 * @param {number} tile - Tile size in pixels
 * @param {number} time - Elapsed game time
 */
export function drawCollectables(p, items, tile, time) {
  for (const item of items) {
    // Skip already collected tokens.
    if (item.found) {
      continue;
    }

    // Convert tile coordinates into
    // the center of the map tile.
    const x = item.x * tile + tile / 2;

    // Floating animation.
    const floatingOffset = Math.sin(time * 0.003 + item.id) * 2;

    const y = item.y * tile + tile / 2 + floatingOffset;

    p.push();
    p.noStroke();

    // Dark outline.
    p.fill("#2b6756");

    p.rect(x - 7, y - 7, 14, 14);

    // Gold token.
    p.fill("#ffe27b");

    p.rect(x - 5, y - 5, 10, 10);

    // Shiny center.
    p.fill("#fff5b4");

    p.rect(x - 2, y - 2, 4, 4);

    p.pop();
  }
}

/* =========================================
   COLLECTIBLE COLLISION
   ========================================= */

/**
 * Detect whether the player is touching
 * an uncollected token.
 *
 * @param {Object} player - Current player
 * @param {Array} items - Collectible tokens
 * @param {number} tile - Tile size in pixels
 *
 * @returns {Object|null}
 * The collected token, or null.
 */
export function collectOnTouch(player, items, tile) {
  const collectionRadius = 18;

  const collectedToken = items.find((item) => {
    // Ignore previously collected tokens.
    if (item.found) {
      return false;
    }

    // Find the token center.
    const tokenX = item.x * tile + tile / 2;

    const tokenY = item.y * tile + tile / 2;

    // Calculate the distance between
    // the player and the token.
    const distance = Math.hypot(player.x - tokenX, player.y - tokenY);

    // Collect when the player is close enough.
    return distance < collectionRadius;
  });

  // No token collected.
  if (!collectedToken) {
    return null;
  }

  // Mark the token as collected.
  collectedToken.found = true;

  // Return the token to the game loop.
  return collectedToken;
}
