import { curiosities } from '../data/npcs.js';

/**
 * Supplies a different fact on every interaction.
 * All seven facts are shown before the deck is reshuffled.
 * The first fact of a new deck will never repeat the previous fact.
 */
export function createCuriosityDeck(facts = curiosities, random = Math.random) {
  let remaining = [];
  let previousId = null;

  function reshuffle() {
    remaining = [...facts];

    // Fisher-Yates shuffle. The end of the array is the next fact to show.
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    if (remaining.length > 1 && remaining.at(-1).id === previousId) {
      const swapIndex = remaining.findIndex((fact) => fact.id !== previousId);
      [remaining[swapIndex], remaining[remaining.length - 1]] = [
        remaining[remaining.length - 1],
        remaining[swapIndex],
      ];
    }
  }

  return {
    next() {
      if (facts.length === 0) return null;
      if (remaining.length === 0) reshuffle();

      const fact = remaining.pop();
      previousId = fact.id;
      return fact;
    },
  };
}
