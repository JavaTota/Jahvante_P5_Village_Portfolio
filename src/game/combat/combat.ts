import { distance } from '../core/geometry';
import { collides, isLava, moveWithCollisions } from '../core/maps';
import type { Enemy, Player } from '../core/types';

export const swordCooldown = 350;
export function swordHits(player: Player, enemy: Enemy): boolean {
  if (enemy.health <= 0 || distance(player,enemy)>82) return false;
  const dx=enemy.x-player.x,dy=enemy.y-player.y;
  return player.face==='left'?dx<18 : player.face==='right'?dx>-18 : player.face==='up'?dy<18 : dy>-18;
}
export function createEnemy(index: number): Enemy {
  const positions = [[14,21],[25,21],[33,21],[43,21],[48,21],[56,21],[59,21]];
  const [x,y]=positions[Math.min(index,6)];
  const isBoss=index>=6;
  return { id: isBoss?'guardian':`enemy-${index+1}`, x:x*24+12, y:y*24+12,
    health:isBoss?250:50, maxHealth:isBoss?250:50,
    isBoss, lastHit:0,lastAttack:0,windup:0,nextSpecial:0 };
}
/** Simple chase AI with collisions, attack cooldowns and telegraphed boss area attack. */
export function updateEnemy(enemy:Enemy,player:Player,now:number,dt:number): { damage:number; special:boolean } {
  if(enemy.health<=0) return { damage:0,special:false };
  const d=distance(enemy,player);
  if(d<510&&d>(enemy.isBoss?70:37)){
    const speed=(enemy.isBoss?1.2:1.48)*dt;
    const direction={x:(player.x-enemy.x)/d*speed,y:(player.y-enemy.y)/d*speed};
    const target=moveWithCollisions(enemy,direction,'volcano');
    if(!collides(target,'volcano')&&!isLava(target)){enemy.x=target.x;enemy.y=target.y;}
  }
  if(enemy.isBoss&&d<210&&now>enemy.nextSpecial&&enemy.windup===0){enemy.windup=now+1000;enemy.nextSpecial=now+4600;}
  if(enemy.windup>0&&now>=enemy.windup){enemy.windup=0;return {damage:d<125?24:0,special:true};}
  if(d<(enemy.isBoss?76:37)&&now-enemy.lastAttack>1200&&enemy.windup===0){enemy.lastAttack=now;return {damage:enemy.isBoss?18:10,special:false};}
  return {damage:0,special:false};
}
