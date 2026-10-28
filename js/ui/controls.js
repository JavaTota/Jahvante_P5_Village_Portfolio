import { buildings } from '../data/content.js';

/** Populate the always-accessible directory of portfolio locations. */
export function buildDirectory(onTravel) {
  const target = document.getElementById('building-directory');

  buildings.forEach((building) => {
    const button = document.createElement('button');
    button.className = 'building-link';
    button.type = 'button';
    button.setAttribute('aria-label', `Visit ${building.name}: ${building.room}`);
    button.innerHTML = `<span class="building-link__icon">${building.icon}</span>
      <span><strong class="building-link__name">${building.name}</strong>
      <small class="building-link__desc">${building.room}</small></span>
      <span class="building-link__arrow">↗</span>`;
    button.addEventListener('click', () => onTravel(building));
    target.appendChild(button);
  });
}

let previousGuide = '';

/** Render the guide based on the player's proximity to a house or a villager. */
export function updateGuide(building, visitedCount = 0, npc = null) {
  const guide = document.getElementById('guide-copy');
  const enterButton = document.getElementById('enter-button');
  const talkButton = document.getElementById('talk-button');
  const canvasEnter = document.getElementById('canvas-enter');
  const canvasTalk = document.getElementById('canvas-talk');
  const walkPrompt = document.getElementById('walk-prompt');

  const guideKey = `${building?.id || ''}:${npc?.id || ''}:${visitedCount}`;
  if (guideKey === previousGuide) return;
  previousGuide = guideKey;

  document.querySelector('.side-card__count').textContent =
    `${String(visitedCount).padStart(2, '0')} / ${String(buildings.length).padStart(2, '0')}`;

  enterButton.disabled = !building;
  talkButton.hidden = !npc;
  canvasEnter.classList.toggle('hidden', !building || Boolean(npc));
  canvasTalk.classList.toggle('hidden', !npc);
  walkPrompt.style.display = building || npc ? 'none' : 'block';

  if (npc) {
    guide.innerHTML = `<span class="guide-copy__eyebrow">FRIENDLY VILLAGER</span>
      <h2>${npc.name}</h2>
      <p>${npc.title}. Say hello to hear an interesting fact about Jahvantè.</p>`;
    talkButton.textContent = `TALK TO ${npc.name.toUpperCase()} ↗`;
    canvasTalk.textContent = `E · TALK TO ${npc.name.toUpperCase()}`;
    enterButton.innerHTML = building ? `ENTER ${building.name} <span>↗</span>` : 'WALK TO A HOUSE <span>↗</span>';
    return;
  }

  if (building) {
    guide.innerHTML = `<span class="guide-copy__eyebrow">LOCATION DISCOVERED</span>
      <h2>${building.name}</h2><p>${building.description}</p>`;
    enterButton.innerHTML = `ENTER ${building.name} <span>↗</span>`;
    return;
  }

  guide.innerHTML = `<span class="guide-copy__eyebrow">A NEW ADVENTURE</span>
    <h2>Welcome to<br/>my world.</h2>
    <p>I'm Jahvantè, a full-stack developer. Explore the buildings or talk to villagers
    to discover personal facts. Click or tap any NPC to approach and talk!</p>`;
  enterButton.innerHTML = 'WALK TO A HOUSE <span>↗</span>';
  walkPrompt.textContent = 'CLICK / TAP TO WALK OR TALK';
}

export function bindEnter(getNearbyBuilding, onEnter) {
  const enter = () => {
    const building = getNearbyBuilding();
    if (building) onEnter(building.id);
  };
  document.getElementById('enter-button').addEventListener('click', enter);
  document.getElementById('canvas-enter').addEventListener('click', enter);
}

export function bindTalk(getNearbyNPC, onTalk) {
  const talk = () => {
    const npc = getNearbyNPC();
    if (npc) onTalk(npc);
  };
  document.getElementById('talk-button').addEventListener('click', talk);
  document.getElementById('canvas-talk').addEventListener('click', talk);
}

export function bindMovement(setHeld, nudge) {
  document.querySelectorAll('[data-move]').forEach((button) => {
    const direction = button.dataset.move;
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      setHeld(direction, true);
      nudge(direction);
    });

    const release = () => setHeld(direction, false);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });
}

export function createSoundControls() {
  let enabled = false;
  const button = document.getElementById('sound-toggle');
  const sources = {
    start: './assets/sounds/gameStart.wav',
    collect: './assets/sounds/collectable.mp3',
    enter: './assets/sounds/gameWin.wav',
  };

  function play(type) {
    if (!enabled) return;
    const audio = new Audio(sources[type]);
    audio.volume = type === 'collect' ? 0.2 : 0.16;
    audio.play().catch(() => {});
  }

  button.addEventListener('click', () => {
    enabled = !enabled;
    button.textContent = enabled ? 'SFX ON' : 'SFX OFF';
    button.setAttribute('aria-pressed', String(enabled));
    if (enabled) play('start');
  });

  return { play };
}

let toastTimer = null;
export function showToast(message) {
  const toast = document.getElementById('collect-toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}
