import { describe, expect, it } from 'vitest';
import { buildings } from '../data/content';
import { swordHits, createEnemy } from '../game/combat/combat';
import { findPath } from '../game/core/pathfinding';
import { collides, isLava, isRoad, validateMap } from '../game/core/maps';
import { tileCenter, TILE } from '../game/core/geometry';
import type { Player } from '../game/core/types';
import { encounterOrder, isBossEncounter, sectionForVictory } from '../game/progression/progression';

function player():Player{return {...tileCenter(12,21),face:'right',health:100,maxHealth:100,walking:false,frame:0,lastAttack:0,invulnerableUntil:0,checkpoint:tileCenter(12,21)};}
describe('portfolio progression',()=>{
  it('has six unique sections and then the guardian',()=>{
    expect(new Set(encounterOrder).size).toBe(6);
    expect(encounterOrder.map((_,i)=>sectionForVictory(i))).toEqual(encounterOrder);
    expect(isBossEncounter(5)).toBe(false);
    expect(isBossEncounter(6)).toBe(true);
    expect(sectionForVictory(6)).toBeNull();
  });
});
describe('map geometry',()=>{
  it('keeps road extents inside the village',()=>expect(validateMap()).toBe(true));
  it('aligns six safe doors with roads',()=>{
    expect(buildings).toHaveLength(6);
    for(const b of buildings){expect(isRoad(b.doorX,b.doorY)).toBe(true);expect(collides(tileCenter(b.doorX,b.doorY),'village')).toBe(false);}
  });
  it('has safe bridges and dangerous lava off the bridges',()=>{
    expect(isLava(tileCenter(18,10))).toBe(true);
    expect(isLava(tileCenter(18,21))).toBe(false);
  });
  it('finds a route from square to the projects entrance',()=>{
    const route=findPath(tileCenter(31,24),tileCenter(12,14),'village');
    expect(route.length).toBeGreaterThan(0);
    expect(route.at(-1)).toEqual(tileCenter(12,14));
  });
});
describe('combat',()=>{
  it('creates six standard foes then a stronger boss',()=>{
    expect(createEnemy(0).isBoss).toBe(false);
    expect(createEnemy(6).isBoss).toBe(true);
    expect(createEnemy(6).health).toBeGreaterThan(createEnemy(0).health);
  });
  it('only hits an enemy within sword reach and facing arc',()=>{
    const hero=player();const enemy=createEnemy(0);
    enemy.x=hero.x+TILE;enemy.y=hero.y;
    expect(swordHits(hero,enemy)).toBe(true);
    hero.face='left';expect(swordHits(hero,enemy)).toBe(false);
  });
});
