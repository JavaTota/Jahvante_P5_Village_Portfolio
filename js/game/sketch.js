// Instance-mode p5 sketch. Mirrors the structure of the supplied GameProjectFinal/sketch.js:
// setup() -> draw() -> keyPressed()/keyReleased(), using separate character, logic and scenery modules.
import { WIDTH,HEIGHT,TILE,SPEED,COLS,ROWS } from './config.js';
import { makePlayer,updatePlayer,nearbyBuilding,cameraFor,teleportSquare,teleportToDoor } from './logic.js';
import { drawGround,drawDecorations,drawBuildings,drawNPCs,pond } from './scenery.js';
import { drawAlienCharacter } from './character.js';
import { initialCollectables,drawCollectables,collectOnTouch } from './collectable.js';
import { buildings } from '../data/content.js';
import { openPanel,isPanelOpen,onPanelChange } from '../ui/panels.js';
import { buildDirectory,updateGuide,bindEnter,bindMovement,createSoundControls,showToast } from '../ui/controls.js';

const directionKeys={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right',W:'up',A:'left',S:'down',D:'right'};

export function mountGame() {
  if(typeof window.p5!=='function')throw new Error('p5.js did not load. Confirm assets/p5.min.js exists.');
  const player=makePlayer();
  const pressed=new Set();
  const tokens=initialCollectables.map(token=>({...token}));
  let nearby=null;
  let lastBuilding=null;
  let camera={x:0,y:0};
  let visited=new Set();
  const sound=createSoundControls();

  function updateNearby(){
    const next=nearbyBuilding(player);
    if(next?.id!==lastBuilding){
      nearby=next;lastBuilding=next?.id||null;updateGuide(next,visited.size);
    }else{nearby=next;}
  }
  function enter(id){
    const b=buildings.find(b=>b.id===id);
    if(!b)return;
    visited.add(id);
    updateGuide(b,visited.size);
    openPanel(id);
    sound.play('enter');
    pressed.clear();
  }
  function nudge(direction){
    if(isPanelOpen())return;
    const temp=new Set([direction]);
    updatePlayer(player,temp,3,pond);
    updateNearby();
  }
  const setHeld=(direction,held)=>held?pressed.add(direction):pressed.delete(direction);

  buildDirectory(b=>{teleportToDoor(player,b);updateNearby();enter(b.id);});
  bindEnter(()=>nearby,enter);
  bindMovement(setHeld,nudge);
  onPanelChange(open=>{if(open)pressed.clear();});
  document.getElementById('return-to-square').addEventListener('click',()=>{
    teleportSquare(player);pressed.clear();updateNearby();document.getElementById('game-stage').focus({preventScroll:true});
  });
  document.getElementById('game-stage').addEventListener('click',()=>document.getElementById('game-stage').focus({preventScroll:true}));

  const sketch=p=>{
    p.setup=()=>{
      const canvas=p.createCanvas(WIDTH,HEIGHT);
      canvas.parent('game-canvas');
      p.pixelDensity(1);p.noSmooth();p.frameRate(60);p.textFont('monospace');
      camera=cameraFor(player);updateNearby();
    };
    p.draw=()=>{
      const dt=Math.min(2,p.deltaTime/16.667||1);
      if(!isPanelOpen()){
        updatePlayer(player,pressed,dt,pond);
        updateNearby();
        const collected=collectOnTouch(player,tokens,TILE);
        if(collected){showToast(`+1 TOKEN FOUND: ${collected.label.toUpperCase()}`);sound.play('collect');}
      }
      const target=cameraFor(player);
      camera.x+=(target.x-camera.x)*.22;
      camera.y+=(target.y-camera.y)*.22;
      p.push();p.translate(-Math.round(camera.x),-Math.round(camera.y));
      drawGround(p,camera);
      drawDecorations(p);
      drawBuildings(p,nearby);
      drawNPCs(p,p.millis());
      drawCollectables(p,tokens,TILE,p.millis());
      drawAlienCharacter(p,player);
      p.pop();
      // Mini location map, inspired by the score/lives HUD in the original game.
      drawMiniMap(p,player,tokens.filter(t=>t.found).length);
    };
    p.keyPressed=()=>{
      if(isPanelOpen())return;
      const direction=directionKeys[p.key]||directionKeys[p.keyCode===38?'ArrowUp':p.keyCode===40?'ArrowDown':p.keyCode===37?'ArrowLeft':p.keyCode===39?'ArrowRight':''];
      if(direction){pressed.add(direction);return false;}
      if((p.key==='e'||p.key==='E'||p.keyCode===13||p.keyCode===32)&&nearby){enter(nearby.id);return false;}
    };
    p.keyReleased=()=>{
      const direction=directionKeys[p.key]||directionKeys[p.keyCode===38?'ArrowUp':p.keyCode===40?'ArrowDown':p.keyCode===37?'ArrowLeft':p.keyCode===39?'ArrowRight':''];
      if(direction){pressed.delete(direction);return false;}
    };
    p.mousePressed=()=>{
      if(isPanelOpen()||p.mouseX<0||p.mouseY<0||p.mouseX>=WIDTH||p.mouseY>=HEIGHT)return;
      const x=p.mouseX+camera.x,y=p.mouseY+camera.y;
      const b=buildings.find(b=>x>=b.x*TILE&&x<=(b.x+b.w)*TILE&&y>=b.y*TILE&&y<=(b.y+b.h)*TILE);
      if(b){teleportToDoor(player,b);updateNearby();enter(b.id);return false;}
    };
  };
  const game=new window.p5(sketch);

  // Support a direct link to a specific room, for recruiters and accessibility.
  const initial=location.hash.slice(1);
  if(buildings.some(b=>b.id===initial)){
    const b=buildings.find(b=>b.id===initial);
    teleportToDoor(player,b);
    requestAnimationFrame(()=>{updateNearby();enter(b.id);});
  }
  return ()=>game.remove();
}

function drawMiniMap(p,player,count){
  p.noStroke();p.fill(14,43,51,220);p.rect(WIDTH-159,58,137,102);
  p.fill('#e6ebd6');p.textAlign(p.LEFT,p.TOP);p.textSize(10);p.text('TOWN MAP',WIDTH-147,65);
  const mapX=WIDTH-147,mapY=83,scaleX=113/(COLS*TILE),scaleY=63/(ROWS*TILE);
  p.fill('#527a62');p.rect(mapX,mapY,113,63);
  for(const b of buildings){p.fill(b.color);p.rect(mapX+b.x*TILE*scaleX,mapY+b.y*TILE*scaleY,Math.max(4,b.w*TILE*scaleX),Math.max(4,b.h*TILE*scaleY));}
  p.fill('#ffe989');p.rect(mapX+player.x*scaleX-2,mapY+player.y*scaleY-2,5,5);
  p.fill('#e6ebd6');p.textSize(9);p.textAlign(p.LEFT,p.TOP);p.text(`TOKENS ${count}/5`,WIDTH-147,150);
}
