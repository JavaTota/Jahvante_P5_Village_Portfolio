/**
 * Playable character rendering.
 *
 * Each character has its own drawing function.
 *
 * Responsibilities:
 * - Draw Jahvantè
 * - Draw his wife
 * - Draw Nea the cat
 * - Animate walking
 * - Handle facing directions
 *
 * Character selection is stored in player.character.
 *
 * All coordinates are relative to the player's
 * position, which represents their feet.
 */

/* =========================================
   COLOR PALETTES
   ========================================= */

const COLORS = {
  outline: "#24313A",
  shadow: "#355A46",

  jahvante: {
    skin: "#B87D56",
    hair: "#242024",
    hairHighlight: "#403036",
    outfit: "#303943",
    outfitHighlight: "#526370",
    pants: "#263449",
    shoes: "#171F27",
  },

  wife: {
    skin: "#E7B28F",
    hair: "#51332D",
    hairHighlight: "#765044",
    outfit: "#315E95",
    outfitHighlight: "#547FB5",
    pants: "#263E60",
    shoes: "#243044",
  },

  nea: {
    fur: "#8B806D",
    furDark: "#514B43",
    furLight: "#B4A58D",
    white: "#F2EDE2",
    eyes: "#83C65D",
    nose: "#B87978",
  },
};

/* =========================================
   DRAWING UTILITIES
   ========================================= */

/**
 * Draw one solid pixel-art rectangle.
 */
function pixel(p, color, x, y, width, height) {
  p.fill(color);
  p.rect(x, y, width, height);
}

/**
 * Draw a shadow under a character.
 */
function drawShadow(p, width = 28) {
  p.push();

  p.noStroke();

  pixel(p, "rgba(36, 65, 47, 0.25)", -width / 2, -3, width, 6);

  p.pop();
}

/**
 * Calculate a simple walking animation.
 *
 * Returns values used for stepping and
 * slightly moving the character vertically.
 */
function getWalkingAnimation(player) {
  if (!player.walking) {
    return {
      step: 0,
      bob: 0,
    };
  }

  const movement = Math.sin(player.frame * 0.8);

  return {
    step: movement >= 0 ? 3 : -3,
    bob: Math.round(Math.abs(movement) * 2),
  };
}

/* =========================================
   HUMAN CHARACTER COMPONENTS
   ========================================= */

/**
 * Draw the legs and shoes.
 */
function drawHumanLegs(p, colors, animation) {
  const { step } = animation;

  // Left leg.
  pixel(p, colors.pants, -9, -12, 8, 10 + step);

  // Right leg.
  pixel(p, colors.pants, 2, -12, 8, 10 - step);

  // Shoes.
  pixel(p, colors.shoes, -10, -4 + step, 9, 5);
  pixel(p, colors.shoes, 2, -4 - step, 9, 5);
}

/**
 * Draw the torso, arms, and hands.
 */
function drawHumanBody(p, colors, animation) {
  const { step } = animation;

  // Body outline.
  pixel(p, COLORS.outline, -12, -32, 24, 23);

  // Main outfit.
  pixel(p, colors.outfit, -10, -30, 20, 19);

  // Clothing highlight.
  pixel(p, colors.outfitHighlight, -7, -29, 4, 15);

  // Left arm.
  pixel(p, colors.outfit, -16, -28 + step, 5, 15);

  // Right arm.
  pixel(p, colors.outfit, 11, -28 - step, 5, 15);

  // Hands.
  pixel(p, colors.skin, -16, -13 + step, 5, 4);
  pixel(p, colors.skin, 11, -13 - step, 5, 4);
}

/**
 * Draw the basic human face.
 */
function drawHumanFace(p, colors, direction) {
  // Head outline.
  pixel(p, COLORS.outline, -14, -48, 28, 24);

  // Face.
  pixel(p, colors.skin, -12, -46, 24, 20);

  // The back of the head has no visible face.
  if (direction === "up") {
    return;
  }

  p.fill(COLORS.outline);

  if (direction === "left") {
    p.rect(-8, -36, 3, 4);
  } else if (direction === "right") {
    p.rect(5, -36, 3, 4);
  } else {
    // Looking toward the camera.
    p.rect(-8, -36, 3, 4);
    p.rect(5, -36, 3, 4);
  }

  // Small mouth.
  pixel(p, COLORS.outline, -3, -29, 6, 2);
}

/* =========================================
   JAHVANTÈ
   ========================================= */

/**
 * Draw Jahvantè's curly hairstyle.
 */
function drawJahvanteHair(p, direction) {
  const hair = COLORS.jahvante.hair;
  const highlight = COLORS.jahvante.hairHighlight;

  // Main hair.
  pixel(p, hair, -15, -53, 30, 12);

  // Pixelated curls.
  pixel(p, hair, -18, -50, 7, 10);
  pixel(p, hair, 11, -50, 7, 10);

  pixel(p, hair, -12, -58, 9, 7);
  pixel(p, hair, 0, -59, 9, 8);
  pixel(p, hair, 9, -55, 6, 8);

  // Highlights.
  pixel(p, highlight, -10, -55, 5, 3);
  pixel(p, highlight, 3, -56, 5, 3);

  if (direction === "up") {
    // Back of the curly hairstyle.
    pixel(p, hair, -13, -43, 26, 17);
  } else {
    // Small beard detail.
    pixel(p, hair, -9, -29, 18, 3);
  }
}

/**
 * Draw Jahvantè's complete sprite.
 */
function drawJahvante(p, player) {
  const colors = COLORS.jahvante;
  const animation = getWalkingAnimation(player);

  p.push();
  p.translate(0, -animation.bob);

  drawHumanLegs(p, colors, animation);

  drawHumanBody(p, colors, animation);

  drawHumanFace(p, colors, player.face);

  drawJahvanteHair(p, player.face);

  p.pop();
}

/* =========================================
   WIFE
   ========================================= */

/**
 * Draw long brown hair.
 */
function drawWifeHair(p, direction) {
  const hair = COLORS.wife.hair;
  const highlight = COLORS.wife.hairHighlight;

  // Hair across the top.
  pixel(p, hair, -15, -51, 30, 10);

  // Hair extending down both sides.
  pixel(p, hair, -17, -45, 7, 29);
  pixel(p, hair, 10, -45, 7, 29);

  // Hair highlights.
  pixel(p, highlight, -13, -47, 3, 20);
  pixel(p, highlight, 12, -47, 3, 18);

  if (direction === "up") {
    // Long hair covering the back.
    pixel(p, hair, -13, -44, 26, 29);

    pixel(p, highlight, -6, -40, 4, 20);
  } else {
    // Side parting.
    pixel(p, hair, -11, -47, 14, 6);
  }
}

/**
 * Draw the wife's complete sprite.
 */
function drawWife(p, player) {
  const colors = COLORS.wife;
  const animation = getWalkingAnimation(player);

  p.push();
  p.translate(0, -animation.bob);

  drawHumanLegs(p, colors, animation);

  drawHumanBody(p, colors, animation);

  drawHumanFace(p, colors, player.face);

  drawWifeHair(p, player.face);

  p.pop();
}

/* =========================================
   NEA THE CAT
   ========================================= */

/**
 * Draw Nea's animated tail.
 */
function drawCatTail(p, player) {
  const colors = COLORS.nea;

  const tailMovement = player.walking
    ? Math.round(Math.sin(player.frame * 0.35) * 4)
    : 0;

  // Tail extends behind the body.
  pixel(p, colors.furDark, 10, -24, 7, 6);

  pixel(p, colors.fur, 16, -30 + tailMovement, 6, 13);

  pixel(p, colors.furDark, 18, -33 + tailMovement, 5, 6);
}

/**
 * Draw Nea's four legs.
 */
function drawCatLegs(p, animation) {
  const colors = COLORS.nea;
  const { step } = animation;

  // Back paws.
  pixel(p, colors.furDark, -11, -10, 8, 9);
  pixel(p, colors.furDark, 4, -10, 8, 9);

  // Front paws.
  pixel(p, colors.fur, -12, -15 + step, 8, 13);
  pixel(p, colors.fur, 4, -15 - step, 8, 13);

  // White toes.
  pixel(p, colors.white, -12, -4 + step, 7, 4);

  pixel(p, colors.white, 5, -4 - step, 7, 4);
}

/**
 * Draw Nea's body and tabby markings.
 */
function drawCatBody(p) {
  const colors = COLORS.nea;

  // Body outline.
  pixel(p, colors.furDark, -15, -32, 30, 24);

  // Main fur.
  pixel(p, colors.fur, -13, -30, 26, 20);

  // Lighter chest.
  pixel(p, colors.white, -6, -27, 12, 17);

  // Tabby markings.
  pixel(p, colors.furDark, -12, -26, 5, 3);

  pixel(p, colors.furDark, 7, -26, 5, 3);

  pixel(p, colors.furDark, -13, -19, 6, 3);

  pixel(p, colors.furDark, 7, -19, 6, 3);
}

/**
 * Draw Nea's ears and face.
 */
function drawCatHead(p, direction) {
  const colors = COLORS.nea;

  // Pointed ears.
  pixel(p, colors.furDark, -14, -49, 9, 12);
  pixel(p, colors.furDark, 5, -49, 9, 12);

  // Ear interiors.
  pixel(p, colors.nose, -11, -46, 4, 5);
  pixel(p, colors.nose, 7, -46, 4, 5);

  // Head outline.
  pixel(p, colors.furDark, -13, -42, 26, 20);

  // Face.
  pixel(p, colors.fur, -11, -40, 22, 16);

  // Forehead stripes.
  pixel(p, colors.furDark, -6, -40, 3, 6);
  pixel(p, colors.furDark, 3, -40, 3, 6);

  if (direction === "up") {
    // Only fur is visible from behind.
    pixel(p, colors.furDark, -7, -35, 14, 3);

    return;
  }

  // White muzzle.
  pixel(p, colors.white, -8, -30, 16, 7);

  // Eyes depend on the direction.
  if (direction === "left") {
    pixel(p, colors.eyes, -8, -36, 5, 5);
    pixel(p, COLORS.outline, -6, -35, 2, 3);
  } else if (direction === "right") {
    pixel(p, colors.eyes, 3, -36, 5, 5);
    pixel(p, COLORS.outline, 5, -35, 2, 3);
  } else {
    pixel(p, colors.eyes, -9, -36, 6, 5);
    pixel(p, colors.eyes, 3, -36, 6, 5);

    // Pupils.
    pixel(p, COLORS.outline, -6, -35, 2, 3);
    pixel(p, COLORS.outline, 5, -35, 2, 3);
  }

  // Pink nose.
  pixel(p, colors.nose, -2, -27, 4, 3);
}

/**
 * Draw Nea's complete four-legged sprite.
 */
function drawNea(p, player) {
  const animation = getWalkingAnimation(player);

  p.push();

  // Slight movement while walking.
  p.translate(0, -animation.bob);

  drawCatTail(p, player);

  drawCatLegs(p, animation);

  drawCatBody(p);

  drawCatHead(p, player.face);

  p.pop();
}

/* =========================================
   ORIGINAL ALIEN FALLBACK
   ========================================= */

/**
 * Keep the original alien available as a fallback
 * for older saves or missing character data.
 */
function drawOriginalAlien(p, player) {
  const animation = getWalkingAnimation(player);

  p.push();
  p.translate(0, -animation.bob);

  // Boots.
  pixel(p, "#172C36", -8, -5, 7, 6);
  pixel(p, "#172C36", 2, -5, 7, 6);

  // Purple suit.
  pixel(p, "#6D4B9D", -10, -24, 20, 22);

  // Belt.
  pixel(p, "#F6C95B", -10, -8, 20, 4);

  // Arms.
  pixel(p, "#644088", -15, -21, 5, 11);
  pixel(p, "#644088", 10, -21, 5, 11);

  // Hands.
  pixel(p, "#A5DC73", -15, -11, 5, 4);
  pixel(p, "#A5DC73", 10, -11, 5, 4);

  // Head.
  pixel(p, "#264D3C", -13, -42, 26, 21);
  pixel(p, "#8AD271", -11, -40, 22, 18);

  // Antennae.
  pixel(p, "#8AD271", -7, -48, 4, 8);
  pixel(p, "#8AD271", 4, -48, 4, 8);

  // Eyes.
  if (player.face !== "up") {
    pixel(p, "#193237", -7, -34, 5, 6);
    pixel(p, "#193237", 2, -34, 5, 6);
  }

  p.pop();
}

/* =========================================
   MAIN CHARACTER RENDERER
   ========================================= */

/**
 * Draw whichever character the player selected.
 *
 * This function keeps the existing name
 * drawAlienCharacter so sketch.js does not
 * need another modification.
 *
 * @param {p5} p - p5.js instance
 * @param {Object} player - Current player state
 */
export function drawAlienCharacter(p, player) {
  p.push();

  p.translate(Math.round(player.x), Math.round(player.y));

  p.noStroke();

  drawShadow(p);

  // Select the correct sprite.
  const sprite = player.character?.sprite ?? "alien";

  switch (sprite) {
    case "jahvante":
      drawJahvante(p, player);
      break;

    case "wife":
      drawWife(p, player);
      break;

    case "nea":
      drawNea(p, player);
      break;

    default:
      drawOriginalAlien(p, player);
      break;
  }

  p.pop();
}
