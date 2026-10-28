/** Accessible, keyboard-friendly NPC dialogue separate from the game engine. */
export function createNPCDialogue(nextFact, onVisibilityChange = () => {}) {
  const backdrop = document.getElementById('npc-dialog-backdrop');
  const name = document.getElementById('npc-dialog-name');
  const role = document.getElementById('npc-dialog-role');
  const factText = document.getElementById('npc-dialog-fact');
  const anotherButton = document.getElementById('npc-dialog-next');
  const closeButton = document.getElementById('npc-dialog-close');
  const card = document.getElementById('npc-dialog-card');

  let open = false;
  let lastFocused = null;

  function revealFact() {
    const fact = nextFact();
    factText.textContent = fact?.text || 'Come back for another story!';
  }

  function talkTo(npc) {
    if (!npc) return;

    lastFocused = document.activeElement;
    name.textContent = npc.name;
    role.textContent = npc.title;
    revealFact();
    backdrop.hidden = false;
    open = true;
    closeButton.focus();
    onVisibilityChange(true);
  }

  function close() {
    if (!open) return;

    backdrop.hidden = true;
    open = false;
    onVisibilityChange(false);
    if (lastFocused instanceof HTMLElement) {
      lastFocused.focus({ preventScroll: true });
    }
  }

  anotherButton.addEventListener('click', revealFact);
  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!open) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    // Keep keyboard navigation inside the open dialogue.
    if (event.key === 'Tab') {
      const first = anotherButton;
      const last = closeButton;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  return { talkTo, close, isOpen: () => open };
}
