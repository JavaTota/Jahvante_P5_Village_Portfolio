import { buildings } from '../../data/content';
import { TILE, COLS, ROWS, WIDTH, HEIGHT } from '../core/geometry';
import { inArea, isPlaza, isRoad, villagePond } from '../core/maps';
import type { P5, Point } from '../core/types';

export interface VillageNPC { name: string; x: number; y: number; message: string; jacket: string }
export const friendlyNPCs: VillageNPC[] = [
  { name: 'Mira', x: 19, y: 17, jacket: '#e89c72', message: 'Jahvantè enjoys turning project ideas into working applications.' },
  { name: 'Leo', x: 58, y: 17, jacket: '#7097d5', message: 'His projects span frontend interfaces, REST APIs and databases.' },
  { name: 'Nina', x: 9, y: 36, jacket: '#bc86bc', message: 'He studies Computer Science while continuing to build software.' },
  { name: 'Max', x: 55, y: 37, jacket: '#70a77e', message: 'Check out the Guild Hall to learn about his professional work.' },
];
export interface Token extends Point { id: string; found: boolean }
export const originalTokens: Token[] = [
  { id: 'React', x: 19, y: 20, found: false },
  { id: 'Python', x: 45, y: 20, found: false },
  { id: 'APIs', x: 24, y: 28, found: false },
  { id: 'TypeScript', x: 40, y: 30, found: false },
  { id: 'Teamwork', x: 32, y: 37, found: false },
];
const rand = (x: number, y: number): number => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.545; return n - Math.floor(n); };
const buildingTile = (x: number, y: number): boolean => buildings.some(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
const nearStructure = (x: number, y: number): boolean => buildings.some(b => x >= b.x-2 && x <= b.x+b.w+2 && y >= b.y-2 && y <= b.y+b.h+2);
const nearWalkway = (x: number, y: number): boolean => {
  for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) if (isRoad(x+dx, y+dy) || isPlaza(x+dx,y+dy)) return true;
  return false;
};
function drawTree(p: P5, x: number, y: number): void {
  p.fill('#4c7353'); p.rect(x-6,y-10,12,23);
  p.fill('#1e5446'); p.rect(x-18,y-35,36,26);
  p.fill('#3e9959'); p.rect(x-15,y-33,30,21);
  p.fill('#80c66c'); p.rect(x-10,y-27,13,9);
  p.fill('#a1d47d'); p.rect(x+2,y-17,7,5);
}
function drawHouse(p: P5, b: typeof buildings[number], near: boolean): void {
  const x=b.x*TILE, y=b.y*TILE, w=b.w*TILE, h=b.h*TILE;
  p.noStroke();
  p.fill('#2b4550'); p.rect(x,y+38,w,h-38);
  p.fill('#f4e6c3'); p.rect(x+6,y+44,w-12,h-48);
  p.fill('#c8b58f'); p.rect(x+8,y+h-21,w-16,8);
  p.fill('#173541'); p.rect(x-8,y+8,w+16,45);
  p.fill(b.color); p.rect(x-4,y+8,w+8,38);p.rect(x+8,y,w-16,12);
  p.fill('#233843'); for(let i=0;i<4;i++)p.rect(x+15+i*45,y+32,26,3);
  p.fill('#355261'); p.rect(x+20,y+72,33,31);p.rect(x+w-53,y+72,33,31);
  p.fill('#9bded6'); p.rect(x+24,y+76,25,23);p.rect(x+w-49,y+76,25,23);
  p.fill('#e1fcdf');p.rect(x+34,y+77,4,21);p.rect(x+w-39,y+77,4,21);
  const door=b.doorX*TILE;
  p.fill('#274151');p.rect(door-3,y+h-63,30,64);
  p.fill('#ad6a4e');p.rect(door,y+h-59,24,58);
  p.fill('#f4d88c');p.rect(door+17,y+h-28,4,4);
  p.fill('#d7ba91');p.rect(door-7,y+h-2,38,6);
  p.fill(near?'#ffdc7d':'#173e4a');p.rect(x+12,y+43,w-24,25);
  p.fill(near?'#1e3443':'#fff2d1');p.textSize(12);p.textAlign(p.CENTER,p.CENTER);p.text(b.name,x+w/2,y+55);
  if(near){p.fill('#ffe283');p.rect(b.doorX*TILE+5,b.doorY*TILE+7,14,4);}
}
function drawNPC(p: P5, n: VillageNPC, t: number): void {
  const x=(n.x+.5)*TILE,y=(n.y+.5)*TILE+Math.sin(t*.002+n.x)*1.3;
  p.noStroke();p.fill('#42684c');p.ellipse(x,y+2,26,8);
  p.fill('#263e49');p.rect(x-8,y-5,7,7);p.rect(x+1,y-5,7,7);
  p.fill(n.jacket);p.rect(x-10,y-25,20,21);
  p.fill('#f1c296');p.rect(x-9,y-41,18,17);
  p.fill('#453841');p.rect(x-10,y-45,20,8);
  p.fill('#1a2d37');p.rect(x-5,y-34,3,3);p.rect(x+4,y-34,3,3);
  p.fill('#f6e0b1');p.rect(x-6,y-56,12,10);
  p.fill('#243d48');p.textSize(9);p.textAlign(p.CENTER,p.CENTER);p.text(n.name,x,y-52);
}
export function drawVillage(p: P5, camera: Point, nearestBuilding: string | null, tokens: Token[], time: number): void {
  p.background('#7fc979');p.noStroke();
  const sx=Math.max(0,Math.floor(camera.x/TILE)-2),ex=Math.min(COLS,Math.ceil((camera.x+WIDTH)/TILE)+2);
  const sy=Math.max(0,Math.floor(camera.y/TILE)-2),ey=Math.min(ROWS,Math.ceil((camera.y+HEIGHT)/TILE)+2);
  for(let y=sy;y<ey;y++) for(let x=sx;x<ex;x++){
    const px=x*TILE,py=y*TILE,variation=rand(x,y);
    if(isPlaza(x,y)) {p.fill((x+y)%2?'#c3d1bd':'#d4dfc7');p.rect(px,py,TILE,TILE);p.fill('#a2b8a6');p.rect(px+11,py+1,2,TILE-2);}
    else if(isRoad(x,y)&&!buildingTile(x,y)){p.fill(variation>.5?'#e8cda4':'#dec094');p.rect(px,py,TILE,TILE);p.fill('#bd9b72');p.rect(px+6,py+10,8,2);}
    else{p.fill(variation>.66?'#89cd7f':'#78bd70');p.rect(px,py,TILE,TILE);if(variation>.77){p.fill('#a4d68c');p.rect(px+7,py+10,3,5);}}
  }
  // Ground-level path to each door. No obstacle is drawn on the walking network.
  for(const b of buildings){p.fill('#f1d2a7');p.rect(b.doorX*TILE+4,b.doorY*TILE+5,TILE-8,15);}
  p.fill('#519888');p.rect(villagePond.x-8,villagePond.y-8,villagePond.w+16,villagePond.h+16);
  p.fill('#5bbbd0');p.rect(villagePond.x,villagePond.y,villagePond.w,villagePond.h);
  p.fill('#8fe2e0');for(let i=0;i<5;i++)p.rect(villagePond.x+18+i*25,villagePond.y+15+(i%2)*20,13,3);
  // No trees near houses, doors, NPCs, token squares or roads.
  for(let x=2;x<COLS-1;x+=3)for(let y=3;y<ROWS-1;y+=4){
    if(rand(x,y)<.74||nearStructure(x,y)||nearWalkway(x,y)||inArea(x,y,[53,27,63,37])||friendlyNPCs.some(n=>Math.abs(x-n.x)<4&&Math.abs(y-n.y)<4)||tokens.some(c=>Math.abs(x-c.x)<3&&Math.abs(y-c.y)<3))continue;
    drawTree(p,x*TILE,y*TILE);
  }
  for(const [x,y] of [[5,14],[26,13],[44,16],[59,16],[5,27],[58,38]]){p.fill('#f3c7a0');p.rect(x*TILE,y*TILE,5,5);p.fill('#fff1a1');p.rect(x*TILE+8,y*TILE+4,5,5);}
  for(const b of buildings)drawHouse(p,b,b.id===nearestBuilding);
  for(const npc of friendlyNPCs)drawNPC(p,npc,time);
  for(const t of tokens){if(t.found)continue;const px=(t.x+.5)*TILE,py=(t.y+.5)*TILE+Math.sin(time*.003+t.x)*2;p.fill('#245848');p.rect(px-8,py-9,16,16);p.fill('#ffd86f');p.rect(px-5,py-6,10,10);p.fill('#fff7bb');p.rect(px-2,py-3,4,4);}
}
export function nearbyNPC(point: Point): VillageNPC | undefined {
  return friendlyNPCs.find(n => Math.hypot(point.x-(n.x+.5)*TILE,point.y-(n.y+.5)*TILE)<48);
}
export function clickedNPC(point: Point): VillageNPC | undefined {
  return friendlyNPCs.find(n => Math.hypot(point.x-(n.x+.5)*TILE,point.y-(n.y+.5)*TILE)<28);
}
