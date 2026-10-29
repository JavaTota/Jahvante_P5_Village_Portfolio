/**
 * Main entry point for Jahvantè Town.
 *
 * Responsibilities:
 * 1. Wait for the page to load.
 * 2. Display the character selection screen.
 * 3. Wait for the player to choose a character.
 * 4. Start the p5.js game.
 */

import { mountGame } from "./game/sketch.js";

import { chooseCharacter } from "./ui/characterSelect.js";

/**
 * Initialize the portfolio game.
 */
async function startPortfolio() {
  try {
    // Step 1: Open the character selection screen.
    const selectedCharacter = await chooseCharacter();

    // Step 2: Start the game with the chosen character.
    mountGame(selectedCharacter);
  } catch (error) {
    console.error("Village initialization failed:", error);

    // Display a useful message if initialization fails.
    const canvasContainer = document.getElementById("game-canvas");

    if (canvasContainer) {
      canvasContainer.textContent =
        "The village could not initialize. " +
        "Please check the browser console.";
    }
  }
}

/**
 * Start the application when the HTML is ready.
 */
document.addEventListener("DOMContentLoaded", startPortfolio);
