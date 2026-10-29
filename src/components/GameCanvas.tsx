import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { createEngine } from '../game/core/engine';
import type { GameControls } from '../game/core/engine';
import type { CharacterId, Direction, GameEvent, GameMode, GameStats } from '../game/core/types';

interface Props {
  character: CharacterId;
  mode: GameMode;
  paused: boolean;
  controller: RefObject<GameControls | null>;
  onEvent(event:GameEvent): void;
  onStats(stats:GameStats):void;
}
/** p5 is mounted once per character/run, not on every React re-render. */
export function GameCanvas({character,mode,paused,controller,onEvent,onStats}:Props){
  const container=useRef<HTMLDivElement>(null);
  const live=useRef({paused,onEvent,onStats});
  live.current={paused,onEvent,onStats};
  useEffect(()=>{if(paused)controller.current?.clearInput();},[paused,controller]);
  useEffect(()=>{
    if(!container.current||!window.p5)return;
    const instance=new window.p5(p=>{
      controller.current=createEngine(p,{character,mode,isPaused:()=>live.current.paused,onEvent:event=>live.current.onEvent(event),onStats:stats=>live.current.onStats(stats)});
    },container.current);
    const onKeyDown=(e:KeyboardEvent)=>{
      if(live.current.paused||e.repeat&&e.code==='Space')return;
      const dir:Record<string,Direction>={KeyW:'up',KeyA:'left',KeyS:'down',KeyD:'right',ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
      if(dir[e.code]){e.preventDefault();controller.current?.press(dir[e.code],true);}
      if(e.code==='Space'&&mode==='volcano'){e.preventDefault();controller.current?.attack();}
      else if((e.code==='KeyE'||e.code==='Enter')&&!e.repeat){controller.current?.interact();}
    };
    const onKeyUp=(e:KeyboardEvent)=>{
      const dir:Record<string,Direction>={KeyW:'up',KeyA:'left',KeyS:'down',KeyD:'right',ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
      if(dir[e.code]){e.preventDefault();controller.current?.press(dir[e.code],false);}
    };
    window.addEventListener('keydown',onKeyDown);
    window.addEventListener('keyup',onKeyUp);
    return()=>{window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);controller.current=null;instance.remove();};
  },[character,mode,controller]);
  return <div ref={container} className="p5-host" role="img" aria-label={mode==='volcano'?'Playable volcanic RPG. WASD or arrow keys to move, space to attack.':'Playable village. WASD or arrow keys to move, E to enter a house, or click a destination.'}/>;
}
