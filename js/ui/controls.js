import {buildings} from '../data/content.js';

let lastNearby=null;
let lastCount=-1;
export function buildDirectory(onTravel){
  const target=document.getElementById('building-directory');
  buildings.forEach((b,index)=>{
    const button=document.createElement('button');button.className='building-link';button.type='button';
    button.innerHTML=`<span class="building-link__icon">${b.icon}</span><span><strong class="building-link__name">${b.name}</strong><small class="building-link__desc">${b.room}</small></span><span class="building-link__arrow">↗</span>`;
    button.setAttribute('aria-label',`Visit ${b.name}: ${b.room}`);
    button.addEventListener('click',()=>onTravel(b,index));target.appendChild(button);
  });
}
export function updateGuide(b,foundCount=0){
  if(lastNearby===b?.id && lastCount===foundCount)return;
  lastCount=foundCount;
  lastNearby=b?.id||null;
  const guide=document.getElementById('guide-copy');
  const enter=document.getElementById('enter-button');
  const canvas=document.getElementById('canvas-enter');
  const prompt=document.getElementById('walk-prompt');
  if(b){
    guide.innerHTML=`<span class="guide-copy__eyebrow">LOCATION DISCOVERED</span><h2>${b.name}</h2><p>${b.description}</p>`;
    enter.disabled=false;enter.innerHTML=`ENTER ${b.name} <span>↗</span>`;
    canvas.textContent='E · ENTER HOUSE';canvas.classList.remove('hidden');prompt.style.display='none';
  } else {
    guide.innerHTML=`<span class="guide-copy__eyebrow">A NEW ADVENTURE</span><h2>Welcome to<br/>my world.</h2><p>I'm Jahvantè, a full-stack developer. Walk up to any building to reveal what I've worked on. Explore and collect the little tech tokens!</p>`;
    enter.disabled=true;enter.innerHTML='WALK TO A HOUSE <span>↗</span>';
    canvas.classList.add('hidden');prompt.style.display='block';
  }
  document.querySelector('.side-card__count').textContent=`${String(foundCount).padStart(2,'0')} / ${String(buildings.length).padStart(2,'0')}`;
}
export function bindEnter(getNearby,onEnter){
  const enter=()=>{const b=getNearby();if(b)onEnter(b.id);};
  document.getElementById('enter-button').addEventListener('click',enter);
  document.getElementById('canvas-enter').addEventListener('click',enter);
}
export function bindMovement(setHeld,nudge){
  document.querySelectorAll('[data-move]').forEach(button=>{
    const direction=button.dataset.move;
    button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);setHeld(direction,true);nudge(direction);});
    const release=()=>setHeld(direction,false);
    button.addEventListener('pointerup',release);
    button.addEventListener('pointercancel',release);
    button.addEventListener('lostpointercapture',release);
  });
}
export function createSoundControls(){
  let enabled=false;
  const btn=document.getElementById('sound-toggle');
  const sources={start:'./assets/sounds/gameStart.wav',collect:'./assets/sounds/collectable.mp3',enter:'./assets/sounds/gameWin.wav'};
  btn.addEventListener('click',()=>{enabled=!enabled;btn.textContent=enabled?'SFX ON':'SFX OFF';btn.setAttribute('aria-pressed',String(enabled));if(enabled)play('start');});
  function play(type){if(!enabled)return;const audio=new Audio(sources[type]);audio.volume=type==='collect'?.2:.16;audio.play().catch(()=>{});}
  return {play};
}
let toastTimer=null;
export function showToast(message){
  const target=document.getElementById('collect-toast');target.textContent=message;target.classList.add('is-visible');
  if(toastTimer)clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>target.classList.remove('is-visible'),1800);
}
