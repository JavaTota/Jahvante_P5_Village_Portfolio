import {
  characters,
  defaultCharacterId,
  getCharacterById,
} from "../data/characters.js";

/**
 * Display the character selection screen.
 *
 * Returns the selected character after the player
 * clicks "Start Adventure".
 *
 * Example:
 * const character = await chooseCharacter();
 */
export function chooseCharacter() {
  return new Promise((resolve) => {
    let selectedId = defaultCharacterId;

    // Create the selection screen.
    const dialog = document.createElement("dialog");

    dialog.className = "character-select";

    dialog.setAttribute("aria-labelledby", "character-select-title");

    dialog.innerHTML = `
      <div class="character-select__content">

        <p class="character-select__eyebrow">
          JAHVANTÈ TOWN / NEW GAME
        </p>

        <h2 id="character-select-title">
          Choose Your Character
        </h2>

        <p class="character-select__description">
          Who would you like to explore the village as?
        </p>

        <div
          class="character-select__cards"
          role="group"
          aria-label="Available characters"
        ></div>

        <button
          class="character-select__start"
          type="button"
        >
          START ADVENTURE ▶
        </button>

      </div>
    `;

    const cardsContainer = dialog.querySelector(".character-select__cards");

    const startButton = dialog.querySelector(".character-select__start");

    const characterButtons = [];

    /**
     * Update the selected character and
     * visually highlight the chosen card.
     */
    function selectCharacter(id) {
      selectedId = id;

      characterButtons.forEach((button) => {
        const isSelected = button.dataset.characterId === selectedId;

        button.classList.toggle("is-selected", isSelected);

        button.setAttribute("aria-pressed", String(isSelected));
      });
    }

    /**
     * Create one character selection card.
     */
    function createCharacterCard(character) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "character-select__card";
      button.dataset.characterId = character.id;

      // Portrait container.
      const portrait = document.createElement("div");
      portrait.className = "character-select__portrait";

      const image = document.createElement("img");
      image.src = character.portrait;
      image.alt = character.name;

      // Show an initial if the portrait isn't ready yet.
      const fallback = document.createElement("span");
      fallback.className = "character-select__fallback";
      fallback.textContent = character.name[0];

      image.addEventListener("error", () => {
        image.hidden = true;
      });

      portrait.append(image, fallback);

      // Character name.
      const name = document.createElement("h3");
      name.textContent = character.name;

      // Character title.
      const title = document.createElement("span");
      title.className = "character-select__title";
      title.textContent = character.title;

      // Character description.
      const description = document.createElement("p");
      description.textContent = character.description;

      button.append(portrait, name, title, description);

      button.addEventListener("click", () => {
        selectCharacter(character.id);
      });

      characterButtons.push(button);

      return button;
    }

    // Create all available character cards.
    characters.forEach((character) => {
      const card = createCharacterCard(character);
      cardsContainer.appendChild(card);
    });

    // Select Jahvantè by default.
    selectCharacter(defaultCharacterId);

    /**
     * Confirm the selection and start the game.
     */
    function startAdventure() {
      const selectedCharacter = getCharacterById(selectedId);

      dialog.close();
      dialog.remove();

      resolve(selectedCharacter);
    }

    startButton.addEventListener("click", startAdventure);

    // Keep the selection screen open until
    // the player chooses a character.
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
    });

    // Display the modal.
    document.body.appendChild(dialog);
    dialog.showModal();
  });
}
