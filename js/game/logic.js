// Adapted from the supplied game's character interactions, camera and contact checks.
import { TILE,COLS,ROWS,WIDTH,HEIGHT,SPEED,WORLD_WIDTH,WORLD_HEIGHT,center } from './config.js';
import { buildings } from '../data/content.js';
export function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
export function makePlayer(){return {x:center.x,y:center.y,face:'down',frame:0,walking:false};}
export function updatePlayer(player,pressed,dt,pond){
  const dx=(pressed.has('right')?1:0)-(pressed.has('left')?1:0);
  const dy=(pressed.has('down')?1:0)-(pressed.has('up')?1:0);
  player.walking=!!(dx||dy);
  if(!player.walking)return;
  const norm=Math.hypot(dx,dy)||1;
  const vx=dx/norm*SPEED*Math.min(dt,2.2);
  const vy=dy/norm*SPEED*Math.min(dt,2.2);
  if(Math.abs(dx)>=Math.abs(dy)&&dx!==0)player.face=dx<0?'left':'right';
  else player.face=dy<0?'up':'down';
  const canWalk=(x,y)=>{
    if(x<12||y<24||x>WORLD_WIDTH-12||y>WORLD_HEIGHT-12)return false;
    // Feet/hitbox, so the sprite may visually overlap the bottom of a roof.
    const r=7;
    const inAnyBuilding=buildings.some(b=>x+r>(b.x)*TILE&&x-r<(b.x+b.w)*TILE&&y+r>(b.y)*TILE&&y-r<(b.y+b.h)*TILE);
    const inPond=x+r>pond.x&&x-r<pond.x+pond.w&&y+r>pond.y&&y-r<pond.y+pond.h;
    return !inAnyBuilding&&!inPond;
  };
  if(canWalk(player.x+vx,player.y))player.x+=vx;
  if(canWalk(player.x,player.y+vy))player.y+=vy;
  player.frame+=Math.min(dt,3);
}
export function nearbyBuilding(player){
  return buildings.find(b=>Math.hypot(player.x-(b.doorX*TILE+TILE/2),player.y-(b.doorY*TILE+TILE/2))<TILE*2.25)||null;
}
export function cameraFor(player){return {x:clamp(player.x-WIDTH/2,0,WORLD_WIDTH-WIDTH),y:clamp(player.y-HEIGHT/2,0,WORLD_HEIGHT-HEIGHT)};}
export function teleportSquare(player){Object.assign(player,makePlayer());}
export function teleportToDoor(player,building){player.x=building.doorX*TILE+TILE/2;player.y=building.doorY*TILE+TILE/2+13;player.face='up';}
