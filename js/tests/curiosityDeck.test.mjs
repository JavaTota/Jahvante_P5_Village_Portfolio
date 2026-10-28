import assert from 'node:assert/strict';
import { createCuriosityDeck } from '../game/curiosityDeck.js';
import { curiosities } from '../data/npcs.js';

const deck = createCuriosityDeck(curiosities);
const firstRound = Array.from({ length: curiosities.length }, () => deck.next().id);

assert.equal(new Set(firstRound).size, 7, 'All seven facts appear exactly once per round');

const secondRound = Array.from({ length: curiosities.length }, () => deck.next().id);
assert.equal(new Set(secondRound).size, 7, 'The second round contains all seven facts');
assert.notEqual(firstRound.at(-1), secondRound[0], 'Two consecutive rounds never repeat a fact');

for (let i = 0; i < 1000; i++) {
  const next = deck.next();
  assert.ok(curiosities.includes(next), 'Every conversation uses a recognized fact');
}

console.log('Fact deck tests passed');
