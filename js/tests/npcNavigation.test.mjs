import assert from 'node:assert/strict';
import { villagers } from '../data/npcs.js';
import { makePlayer, canWalkAt } from '../game/logic.js';
import { npcPosition } from '../game/npcCharacters.js';
import { createClickNavigation } from '../game/navigation.js';
import { pond } from '../game/scenery.js';

for (const npc of villagers) {
  const player = makePlayer();
  let talkedTo = null;
  const nav = createClickNavigation(player, pond, () => {}, (character) => { talkedTo = character.id; });

  assert.equal(nav.navigateToNPC(npc), true, `Path exists to ${npc.name}`);

  for (let frame = 0; frame < 1600 && !talkedTo; frame++) {
    nav.tick(1);
    assert.equal(canWalkAt(player.x, player.y, pond), true, `Player never clips through a wall or NPC (${npc.name})`);
  }

  assert.equal(talkedTo, npc.id, `Navigation opens conversation when arriving near ${npc.name}`);
  const npcPos = npcPosition(npc);
  assert.ok(Math.hypot(player.x - npcPos.x, player.y - npcPos.y) < 60, 'Player stops in talking range');
  console.log(`Reached ${npc.name} at x:${Math.round(player.x)} y:${Math.round(player.y)}`);
}
