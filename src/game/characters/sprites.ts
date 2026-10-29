import type { CharacterId, P5, Player, Enemy } from '../core/types';

function rect(p:P5,color:string,x:number,y:number,w:number,h:number):void {p.fill(color);p.rect(x,y,w,h);}
/** Small top-down sprites deliberately use p5 primitives: no copyrighted game assets. */
export function drawPlayer(p:P5,player:Player,id:CharacterId,time:number):void{
  p.push();p.translate(Math.round(player.x),Math.round(player.y));p.noStroke();
  p.fill('#10161b');p.ellipse(0,3,id==='nea'?34:30,10);
  const bob=player.walking?Math.sin(player.frame*.62)*2:0;p.translate(0,bob);
  const step=player.walking?Math.sin(player.frame*.62)*3:0;
  if(id==='nea'){
    rect(p,'#645d50',12,-23,8,9);rect(p,'#967f68',17,-31+Math.sin(time*.008)*3,6,15);
    rect(p,'#635b51',-14,-22,28,19);rect(p,'#a5947e',-12,-23,24,17);
    rect(p,'#ece6d4',-7,-19,14,14);rect(p,'#6e6357',-12,-5,8,7);rect(p,'#6e6357',4,-5,8,7);
    rect(p,'#65584c',-12,-44,24,22);rect(p,'#8e806a',-10,-42,20,18);
    rect(p,'#685f53',-12,-51,8,13);rect(p,'#685f53',4,-51,8,13);
    if(player.face!=='up'){rect(p,'#9fc96e',-7,-36,5,5);rect(p,'#9fc96e',3,-36,5,5);rect(p,'#f0ebdf',-6,-28,12,5);rect(p,'#bf8a89',-2,-29,4,2);}p.pop();return;
  }
  const knight=id==='knight',wife=id==='wife';
  const skin=wife?'#e7b38e':'#b98259';
  const clothes=knight?'#262730':wife?'#446f9b':'#345266';
  const trim=knight?'#d33a41':wife?'#8fb1db':'#71b09e';
  const boots=knight?'#121820':'#253542';
  rect(p,boots,-9,-7+step,8,8);rect(p,boots,2,-7-step,8,8);
  if(knight){rect(p,'#b72e3d',-16,-29,32,30);rect(p,'#191b23',-12,-33,24,27);}
  rect(p,clothes,-11,-30,22,24);rect(p,trim,-11,-30,5,21);
  rect(p,clothes,-16,-27+step,5,16);rect(p,clothes,11,-27-step,5,16);
  if(knight){
    rect(p,'#10151c',-14,-48,28,19);rect(p,'#45404a',-11,-47,22,13);
    rect(p,'#df4750',-8,-37,16,4);rect(p,'#20242c',-12,-49,24,6);
    // Knight always carries a sword. Attack swing is handled in the engine.
    rect(p,'#dfd4bb',16,-30,4,25);rect(p,'#b33038',13,-8,10,5);
  }else{
    rect(p,skin,-12,-46,24,20);
    rect(p,wife?'#52372f':'#242329',-14,-52,28,wife?13:11);
    if(wife){rect(p,'#52372f',-15,-48,6,28);rect(p,'#52372f',9,-48,6,28);}
    else {rect(p,'#242329',-17,-47,6,11);rect(p,'#242329',11,-47,6,11);}
    if(player.face!=='up'){rect(p,'#222e33',-7,-36,4,4);rect(p,'#222e33',3,-36,4,4);}
  }
  p.pop();
}
export function drawEnemy(p:P5,enemy:Enemy,time:number):void{
  p.push();p.translate(enemy.x,enemy.y);p.noStroke();
  const boss=enemy.isBoss,scale=boss?1.65:1;
  p.fill('#100f15');p.ellipse(0,6,34*scale,10);
  if(boss)p.translate(0,Math.sin(time*.002)*3);
  rect(p,boss?'#311d2b':'#573b3d',-13*scale,-35*scale,26*scale,31*scale);
  rect(p,boss?'#a83a2e':'#b65a48',-10*scale,-29*scale,20*scale,19*scale);
  rect(p,'#221c24',-12*scale,-48*scale,24*scale,19*scale);
  rect(p,boss?'#f8a743':'#f4c677',-8*scale,-37*scale,6*scale,4*scale);
  rect(p,boss?'#f8a743':'#f4c677',2*scale,-37*scale,6*scale,4*scale);
  if(boss){rect(p,'#a83a2e',-13*scale,-54*scale,8*scale,10*scale);rect(p,'#a83a2e',5*scale,-54*scale,8*scale,10*scale);}
  const width=boss?100:44;
  rect(p,'#141b21',-width/2,-72*scale,width,7);
  rect(p,boss?'#ed6349':'#f0ab75',-width/2,-72*scale,width*Math.max(0,enemy.health/enemy.maxHealth),5);
  p.pop();
}
