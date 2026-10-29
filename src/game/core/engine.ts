import { buildings } from '../../data/content';
import { drawPlayer, drawEnemy } from '../characters/sprites';
import { createEnemy, swordHits, swordCooldown, updateEnemy } from '../combat/combat';
import { encounterOrder } from '../progression/progression';
import { drawVillage, nearbyNPC, clickedNPC, originalTokens } from '../worlds/village';
import { drawRescue, drawVolcano } from '../worlds/volcano';
import { clamp, distance, HEIGHT, TILE, tileCenter, WIDTH, WORLD_HEIGHT, WORLD_WIDTH } from './geometry';
import { collides, isLava, moveWithCollisions } from './maps';
import { findPath } from './pathfinding';
import type { CharacterId, Direction, Enemy, GameEvent, GameMode, GameStats, P5, Player, Point } from './types';

export interface GameCallbacks {
  character: CharacterId;
  mode: GameMode;
  isPaused(): boolean;
  onEvent(event: GameEvent): void;
  onStats(stats: GameStats): void;
}
export interface GameControls {
  press(direction: Direction, held: boolean): void;
  attack(): void;
  clearInput(): void;
  interact(): void;
  returnToStart(): void;
}
const initialPosition=(mode:GameMode):Point => mode==='village'?tileCenter(31,24):tileCenter(9,21);
const directionFromVector=(dx:number,dy:number):Direction=>Math.abs(dx)>=Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');

/** One p5 instance owns all frame-by-frame simulation state. React owns menus and dialogs. */
export function createEngine(p:P5,callbacks:GameCallbacks):GameControls {
  const { mode }=callbacks;
  const spawn=initialPosition(mode);
  const player:Player={...spawn,face:'down',health:100,maxHealth:100,frame:0,walking:false,lastAttack:-10000,invulnerableUntil:0,checkpoint:{...spawn}};
  const held=new Set<Direction>();
  const tokens=originalTokens.map(t=>({...t}));
  let camera:Point={x:0,y:0};
  let route:Point[]=[];
  let travelAction:(()=>void)|null=null;
  let visited=new Set<string>();
  let progress=0;
  let enemy:Enemy|null=mode==='volcano'?createEnemy(0):null;
  let spawnPending=false;
  let victory=false;
  let lastSwing=0;
  let lastStatsFrame=-1;
  let flashUntil=0;
  const emit=(event:GameEvent):void=>{callbacks.onEvent(event);};
  function nearBuilding():typeof buildings[number]|undefined {
    return buildings.find(b=>distance(player,tileCenter(b.doorX,b.doorY))<TILE*2.25);
  }
  function openBuilding(b:typeof buildings[number]):void{
    visited.add(b.id);
    held.clear();route=[];travelAction=null;
    emit({type:'section',section:b.id as typeof encounterOrder[number]});
  }
  function clearTravel():void{route=[];travelAction=null;}
  function goTo(point:Point,action:(()=>void)|null=null):void{
    const newRoute=findPath(player,point,'village');
    if(!newRoute.length&&distance(player,point)>10){emit({type:'toast',message:'That destination cannot be reached.'});return;}
    route=newRoute;travelAction=action;
    if(!route.length){const done=travelAction;clearTravel();done?.();}
  }
  function attack():void{
    if(mode!=='volcano'||callbacks.isPaused()||victory)return;
    const now=p.millis();
    if(now-player.lastAttack<swordCooldown)return;
    player.lastAttack=now;lastSwing=now;
    if(enemy&&swordHits(player,enemy)){
      enemy.health=Math.max(0,enemy.health-25);
      enemy.lastHit=now;
      if(enemy.health===0){
        if(enemy.isBoss){victory=true;enemy=null;emit({type:'ending'});}
        else {const section=encounterOrder[progress];progress++;enemy=null;spawnPending=true;emit({type:'section',section});}
      }
    }
  }
  function interact():void{
    if(callbacks.isPaused())return;
    if(mode==='village'){
      const b=nearBuilding();if(b){openBuilding(b);return;}
      const npc=nearbyNPC(player);if(npc)emit({type:'npc',message:`${npc.name}: ${npc.message}`});
    }else attack();
  }
  function applyDamage(amount:number,now:number):void{
    if(amount<=0||now<player.invulnerableUntil)return;
    player.health=Math.max(0,player.health-amount);
    player.invulnerableUntil=now+900;
    flashUntil=now+300;
    if(player.health===0){player.health=100;player.x=player.checkpoint.x;player.y=player.checkpoint.y;emit({type:'toast',message:'You fell in battle! Restored at your checkpoint.'});}
  }
  function handleLava(now:number):void{
    if(isLava(player)){
      applyDamage(18,now);
      player.x=player.checkpoint.x;player.y=player.checkpoint.y;
      clearTravel();emit({type:'toast',message:'LAVA! Respawned at the last checkpoint.'});
    }
  }
  function updateMovement(dt:number,now:number):void{
    let dx=Number(held.has('right'))-Number(held.has('left'));
    let dy=Number(held.has('down'))-Number(held.has('up'));
    if(dx||dy)clearTravel();
    else if(route.length){
      const target=route[0];const d=distance(player,target);
      if(d<4){route.shift();if(!route.length){const done=travelAction;clearTravel();done?.();}}
      else{dx=(target.x-player.x)/d;dy=(target.y-player.y)/d;}
    }
    const length=Math.hypot(dx,dy);
    player.walking=length>.1;
    if(!player.walking)return;
    dx/=length;dy/=length;
    player.face=directionFromVector(dx,dy);
    const speed=(mode==='volcano'?3.35:3.05)*dt;
    const next=moveWithCollisions(player,{x:dx*speed,y:dy*speed},mode);
    player.x=next.x;player.y=next.y;player.frame+=dt;
    if(mode==='volcano'){
      handleLava(now);
      if((player.x>21*TILE&&player.x<34*TILE)||(player.x>39*TILE&&player.x<49*TILE)||(player.x>54*TILE)){
        const stage=player.x>54*TILE?54:player.x>39*TILE?39:21;
        if(player.checkpoint.x<(stage+.5)*TILE)player.checkpoint=tileCenter(stage,21);
      }
    }
  }
  function updateCombat(dt:number,now:number):void{
    if(spawnPending&&enemy===null&&!victory){enemy=createEnemy(progress);spawnPending=false;}
    if(!enemy)return;
    const {damage}=updateEnemy(enemy,player,now,dt);
    applyDamage(damage,now);
  }
  function update(dt:number,now:number):void{
    updateMovement(dt,now);
    if(mode==='volcano')updateCombat(dt,now);
    else{
      for(const token of tokens){if(!token.found&&distance(player,tileCenter(token.x,token.y))<17){token.found=true;emit({type:'toast',message:`${token.id} token collected!`});}}
    }
  }
  function drawMinimap():void{
    const mapX=WIDTH-155,mapY=60,scaleX=118/WORLD_WIDTH,scaleY=76/WORLD_HEIGHT;
    p.noStroke();p.fill('#0e202c');p.rect(mapX-8,mapY-21,135,105);
    p.fill('#e6e8df');p.textAlign(p.LEFT,p.TOP);p.textSize(10);p.text(mode==='village'?'TOWN MAP':'VOLCANO MAP',mapX,mapY-16);
    p.fill(mode==='village'?'#568768':'#5a3741');p.rect(mapX,mapY,118,76);
    if(mode==='village')for(const b of buildings){p.fill(b.color);p.rect(mapX+b.x*TILE*scaleX,mapY+b.y*TILE*scaleY,b.w*TILE*scaleX,b.h*TILE*scaleY);}
    if(mode==='volcano'&&enemy){p.fill('#ff7d55');p.rect(mapX+enemy.x*scaleX-2,mapY+enemy.y*scaleY-2,5,5);}
    p.fill('#f7e89c');p.rect(mapX+player.x*scaleX-2,mapY+player.y*scaleY-2,5,5);
  }
  p.setup=()=>{p.createCanvas(WIDTH,HEIGHT);p.pixelDensity(1);p.noSmooth();p.frameRate(60);p.textFont('monospace');camera={x:clamp(player.x-WIDTH/2,0,WORLD_WIDTH-WIDTH),y:clamp(player.y-HEIGHT/2,0,WORLD_HEIGHT-HEIGHT)};};
  p.draw=()=>{
    const now=p.millis(),dt=Math.min(2,p.deltaTime/16.667||1);
    if(!callbacks.isPaused()&&!victory)update(dt,now);
    const targetX=clamp(player.x-WIDTH/2,0,WORLD_WIDTH-WIDTH),targetY=clamp(player.y-HEIGHT/2,0,WORLD_HEIGHT-HEIGHT);
    camera.x+=(targetX-camera.x)*.18;camera.y+=(targetY-camera.y)*.18;
    p.push();p.translate(-Math.round(camera.x),-Math.round(camera.y));
    if(mode==='village')drawVillage(p,camera,nearBuilding()?.id??null,tokens,now);
    else drawVolcano(p,camera,now);
    if(mode==='volcano'&&enemy){
      if(enemy.windup>now){p.noFill();p.stroke('#f7ae65');p.strokeWeight(4);p.ellipse(enemy.x,enemy.y,246,246);p.noStroke();}
      drawEnemy(p,enemy,now);
    }
    if(victory)drawRescue(p,Math.min(WORLD_WIDTH-120,player.x+34),player.y);
    drawPlayer(p,player,victory?'jahvante':callbacks.character,now);
    if(mode==='volcano'&&now-lastSwing<160){
      const mx=player.face==='right'?player.x+43:player.face==='left'?player.x-43:player.x;
      const my=player.face==='up'?player.y-36:player.face==='down'?player.y+28:player.y-10;
      p.noFill();p.stroke('#ff6a57');p.strokeWeight(6);p.ellipse(mx,my,64,42);p.noStroke();
    }
    if(flashUntil>now){p.noFill();p.stroke('#ffb07c');p.strokeWeight(3);p.ellipse(player.x,player.y-20,46,58);p.noStroke();}
    p.pop();drawMinimap();
    if(p.frameCount-lastStatsFrame>=10){lastStatsFrame=p.frameCount;callbacks.onStats({mode,health:player.health,maxHealth:100,progress:mode==='village'?visited.size:progress,boss:enemy?.isBoss??false,enemyHealth:enemy?.health??0,enemyMaxHealth:enemy?.maxHealth??0,objective:mode==='village'?(nearBuilding()?`Press E to enter ${nearBuilding()!.name}`:nearbyNPC(player)?'Press E to talk to a villager':'Explore the houses or use the directory'):victory?'The adventure is complete':enemy?.isBoss?'Defeat the Résumé Guardian':`Defeat enemy ${Math.min(progress+1,6)} of 6`});}
  };
  p.mousePressed=()=>{
    if(callbacks.isPaused()||p.mouseX<0||p.mouseX>=WIDTH||p.mouseY<0||p.mouseY>=HEIGHT)return;
    if(mode==='volcano'){attack();return false;}
    const point={x:p.mouseX+camera.x,y:p.mouseY+camera.y};
    const b=buildings.find(b=>point.x>=b.x*TILE&&point.x<(b.x+b.w)*TILE&&point.y>=b.y*TILE&&point.y<(b.y+b.h)*TILE);
    if(b){goTo(tileCenter(b.doorX,b.doorY),()=>openBuilding(b));return false;}
    const npc=clickedNPC(point);
    if(npc){
      const target=tileCenter(npc.x+1,npc.y+1);
      goTo(target,()=>emit({type:'npc',message:`${npc.name}: ${npc.message}`}));return false;
    }
    if(!collides(point,'village'))goTo(point);
    return false;
  };
  return {
    press:(direction,heldState)=>{if(callbacks.isPaused())return;if(heldState)held.add(direction);else held.delete(direction);},
    attack,
    clearInput:()=>held.clear(),
    interact,
    returnToStart:()=>{held.clear();clearTravel();const start=initialPosition(mode);player.x=start.x;player.y=start.y;player.health=100;player.checkpoint={...start};}
  };
}
