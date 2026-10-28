/** Render villagers in the same pixel-art style as the player. */
import { TILE } from './config.js';
import { villagers } from '../data/npcs.js';

export function npcPosition(npc) {
  return { x: npc.x * TILE + TILE / 2, y: npc.y * TILE + TILE / 2 };
}

export function findNearbyVillager(player, range = TILE * 2.5) {
  return villagers.find((npc) => {
    const pos = npcPosition(npc);
    return Math.hypot(player.x - pos.x, player.y - pos.y) <= range;
  }) || null;
}

export function hitVillager(x, y) {
  return villagers.find((npc) => {
    const pos = npcPosition(npc);
    // Include the head and the dialogue indicator when clicking.
    return Math.abs(x - pos.x) <= 22 && y >= pos.y - 42 && y <= pos.y + 14;
  }) || null;
}

function drawVillager(p, npc, time, nearby) {
  const { x, y } = npcPosition(npc);
  const bob = Math.round(Math.sin(time / 450 + npc.x) * 1.2);

  p.push();
  p.translate(Math.round(x), Math.round(y + bob));
  p.noStroke();

  // Character shadow, boots, jacket, face and hair.
  p.fill('#416b61');
  p.ellipse(0, 9, 25, 8);
  p.fill('#243c4a');
  p.rect(-8, 6, 6, 7);
  p.rect(2, 6, 6, 7);
  p.fill(npc.coat);
  p.rect(-10, -12, 20, 18);
  p.fill('#f2c79b');
  p.rect(-9, -29, 18, 16);
  p.fill(npc.hair);
  p.rect(-10, -32, 20, 7);
  p.rect(-10, -26, 4, 7);
  p.fill('#243944');
  p.rect(-5, -22, 3, 3);
  p.rect(3, -22, 3, 3);

  // A speech bubble signals these characters are interactive.
  const bubbleY = -51 + Math.sin(time / 380 + npc.y) * 2;
  p.fill(nearby ? '#ffe793' : '#fff8dd');
  p.stroke('#294a4b');
  p.strokeWeight(2);
  p.rect(-11, bubbleY - 10, 22, 20, 2);
  p.noStroke();
  p.fill('#24494b');
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(14);
  p.text(nearby ? 'E' : '?', 0, bubbleY + 1);
  p.pop();
}

export function drawVillagers(p, time, nearbyNPC) {
  for (const npc of villagers) {
    drawVillager(p, npc, time, nearbyNPC?.id === npc.id);
  }
}
