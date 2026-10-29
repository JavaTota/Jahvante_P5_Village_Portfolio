import { COLS, ROWS, HEIGHT, TILE, WIDTH } from '../core/geometry';
import { isLava, isVolcanoRock } from '../core/maps';
import type { P5, Point } from '../core/types';

const hash = (x:number,y:number):number => {const value=Math.sin(x*71.11+y*197.6)*12987.33;return value-Math.floor(value);};
/** Safe bridge is rendered where the lava river has a 7-tile gap. */
export function drawVolcano(p:P5,camera:Point,time:number):void{
  p.background('#1a1c24');p.noStroke();
  const sx=Math.max(0,Math.floor(camera.x/TILE)-2),ex=Math.min(COLS,Math.ceil((camera.x+WIDTH)/TILE)+2);
  const sy=Math.max(0,Math.floor(camera.y/TILE)-2),ey=Math.min(ROWS,Math.ceil((camera.y+HEIGHT)/TILE)+2);
  for(let y=sy;y<ey;y++)for(let x=sx;x<ex;x++){
    const px=x*TILE,py=y*TILE,n=hash(x,y),point={x:px+12,y:py+12};
    if(isLava(point)){
      p.fill(n>.5?'#ad2a19':'#d53d1d');p.rect(px,py,TILE,TILE);
      p.fill(n>.7?'#ffe16b':'#f87b28');p.rect(px+3+(time/220|0)%5,py+7,13,5);
      p.fill('#8d1719');p.rect(px+6,py+19,14,3);
    } else if(isVolcanoRock(point)){
      p.fill('#34303a');p.rect(px,py,TILE,TILE);
      p.fill('#4c424d');p.rect(px+3,py+2,17,9);
      p.fill('#a83a29');p.rect(px+10,py+13,8,2);
    }else{
      const path=y>=18&&y<=24;
      p.fill(path?'#49424a':n>.55?'#302b35':'#292630');p.rect(px,py,TILE,TILE);
      p.fill(path?'#655b5d':'#41363d');if(n>.3)p.rect(px+4,py+8,9,3);
      if(n>.88){p.fill('#c9603a');p.rect(px+16,py+16,3,3);}
    }
  }
  // Ember particles are visual only. Deterministic coordinates keep frame rate consistent.
  for(let i=0;i<55;i++){
    const x=(i*283+19)% (COLS*TILE), y=(i*173+time*.025)% (ROWS*TILE);
    if(x<camera.x-10||x>camera.x+WIDTH+10||y<camera.y-10||y>camera.y+HEIGHT+10)continue;
    p.fill(i%3===0?'#ffe17a':'#ef7847');p.rect(x,y,2,2);
  }
  p.fill('#e9bca0');p.textAlign(p.CENTER,p.CENTER);p.textSize(12);
  p.text('THE OBSIDIAN TRIAL', 9*TILE, 16*TILE);
  p.text('RÉSUMÉ GUARDIAN', 58*TILE, 15*TILE);
}
export function drawRescue(p:P5,x:number,y:number):void{
  // Wife and Nea appear inside the arena after the guardian falls.
  p.fill('#573a38');p.rect(x-13,y-42,26,29);p.fill('#e2b08e');p.rect(x-9,y-34,18,16);
  p.fill('#4774a1');p.rect(x-9,y-17,18,17);p.fill('#f3c7b5');p.rect(x-7,y-26,4,3);p.rect(x+4,y-26,4,3);
  const catX=x+54,catY=y+3;
  p.fill('#786c5d');p.rect(catX-13,catY-23,26,19);p.rect(catX-12,catY-33,8,12);p.rect(catX+4,catY-33,8,12);
  p.fill('#e7e0cf');p.rect(catX-7,catY-11,14,10);p.fill('#b5db77');p.rect(catX-8,catY-22,5,4);p.rect(catX+3,catY-22,5,4);
  p.fill('#ffa1a5');p.textSize(26);p.text('♥',x+22,y-64);
}
