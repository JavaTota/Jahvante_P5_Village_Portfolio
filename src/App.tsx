import { useCallback, useEffect, useRef, useState } from 'react';
import { CharacterSelect } from './components/CharacterSelect';
import { GameCanvas } from './components/GameCanvas';
import { PortfolioPanel } from './components/PortfolioPanel';
import { characters } from './data/characters';
import { buildings, urls } from './data/content';
import type { GameControls } from './game/core/engine';
import type { CharacterId, Direction, GameEvent, GameStats, PortfolioId } from './game/core/types';

const initialStats:GameStats={health:100,maxHealth:100,progress:0,boss:false,enemyHealth:0,enemyMaxHealth:0,objective:'Explore the world',mode:'village'};
export default function App(){
  const [selected,setSelected]=useState<CharacterId|null>(null);
  const [run,setRun]=useState(0);
  const [panel,setPanel]=useState<PortfolioId|null>(null);
  const [isVictoryPanel,setVictoryPanel]=useState(false);
  const [ending,setEnding]=useState(false);
  const [toast,setToast]=useState('');
  const [stats,setStats]=useState(initialStats);
  const controller=useRef<GameControls|null>(null);
  const current=characters.find(c=>c.id===selected);
  const volcano=current?.mode==='volcano';
  const showToast=useCallback((message:string)=>setToast(message),[]);
  useEffect(()=>{if(!toast)return;const id=window.setTimeout(()=>setToast(''),2800);return()=>window.clearTimeout(id);},[toast]);
  const handleEvent=useCallback((event:GameEvent)=>{
    if(event.type==='section'){setVictoryPanel(Boolean(volcano));setPanel(event.section);}
    if(event.type==='ending')setEnding(true);
    if(event.type==='npc'||event.type==='toast')showToast(event.type==='npc'?event.message:event.message);
  },[volcano,showToast]);
  const select=(id:CharacterId)=>{setSelected(id);setStats({...initialStats,mode:id==='knight'?'volcano':'village'});setPanel(null);setEnding(false);setToast('');setRun(n=>n+1);};
  const returnToSelection=()=>{setSelected(null);setPanel(null);setEnding(false);setToast('');};
  const closePanel=useCallback(()=>setPanel(null),[]);
  const openSection=(id:PortfolioId)=>{setVictoryPanel(false);setPanel(id);};
  function press(direction:Direction,state:boolean){controller.current?.press(direction,state);}
  return <div className="app-shell">
    <header className="site-header"><a className="brand" href="#top" onClick={e=>{e.preventDefault();returnToSelection();window.scrollTo({top:0,behavior:'smooth'});}}><img src="/favicon.svg" alt=""/><span><strong>JAHVANTÈ TOWN</strong><small>AN INTERACTIVE DEVELOPER PORTFOLIO</small></span></a>
      <nav className="header-actions" aria-label="Portfolio links"><a href={urls.github} target="_blank" rel="noreferrer">GITHUB ↗</a><a href={urls.linkedin} target="_blank" rel="noreferrer">LINKEDIN ↗</a><a className="resume-pill" href="/assets/Jahvante_Tota_Resume.pdf" target="_blank" rel="noreferrer">↓ RÉSUMÉ</a></nav>
    </header>
    <main id="top"><section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="status-dot"/> BUILDING SOFTWARE, ONE WORLD AT A TIME</div><h1>A portfolio <em>you can play.</em></h1><p>I'm Jahvantè, a full-stack developer. Explore my projects through a peaceful pixel village — or fight through a volcanic quest to unlock my work.</p><div className="hero-tags"><span>REACT</span><span>TYPESCRIPT</span><span>P5.JS</span><span>GAME AI</span><span>REST APIS</span></div></div><div className="hero-stat"><span>YOUR NEXT QUEST</span><strong>{selected?'ADVENTURE IN PROGRESS':'CHOOSE A WORLD'}</strong><small>REAL CODE · REAL PROJECTS · A LITTLE PIXEL MAGIC</small></div></section>
      {!selected?<CharacterSelect onSelect={select}/>:<section className="game-section" aria-label="Playable portfolio">
        <div className="game-topbar"><div><span className="status-dot"/>{volcano?'WORLD 02 / OBSIDIAN TRIAL':'WORLD 01 / STARTER VILLAGE'}<small> · {current?.name.toUpperCase()}</small></div><div className="topbar-buttons"><button onClick={()=>{controller.current?.returnToStart();showToast('Returned to the last checkpoint.');}}>↺ CHECKPOINT</button><button onClick={returnToSelection}>← CHANGE CHARACTER</button></div></div>
        <div className="game-grid"><div className="console"><div className="console-bar"><span>● ● ● &nbsp; JAHVANTE_TOWN/{volcano?'VOLCANO':'VILLAGE'}</span><span>REACT + TYPESCRIPT + P5</span></div><div className="canvas-shell"><GameCanvas key={`${selected}-${run}`} controller={controller} mode={current!.mode} character={selected} paused={Boolean(panel)||ending} onEvent={handleEvent} onStats={setStats}/><div className="canvas-label">{volcano?'THE OBSIDIAN TRIAL':'JAHVANTÈ TOWN'}</div>{toast&&<div className="toast" role="status">{toast}</div>}</div><div className="console-footer"><span>{stats.objective}</span><span>{volcano?'SPACE · SWORD':'E · INTERACT'}</span></div></div>
        <aside className="sidebar"><div className="side-card"><div className="card-heading">{volcano?'⚔ QUEST JOURNAL':'✦ VILLAGE GUIDE'}<span>{volcano?`${stats.progress}/6`:`${stats.progress}/6`}</span></div><h2>{volcano?'The Black Knight':'Explore the town'}</h2><p>{volcano?'Defeat each enemy to reveal a portfolio section. The final guardian protects the résumé.':'Walk up to a building, press E, or choose a section below. Meet the villagers and find five hidden tokens.'}</p>{volcano&&<><div className="health-header"><span>HEALTH</span><strong>{stats.health}/100</strong></div><div className="health-track"><div style={{width:`${stats.health}%`}}/></div>{stats.boss&&<><div className="health-header"><span>RÉSUMÉ GUARDIAN</span><strong>{stats.enemyHealth}/{stats.enemyMaxHealth}</strong></div><div className="health-track boss-track"><div style={{width:`${100*stats.enemyHealth/Math.max(1,stats.enemyMaxHealth)}%`}}/></div></>}</>}</div>
        <div className="side-card"><div className="card-heading">⌂ PORTFOLIO DIRECTORY <span>06</span></div><div className="directory">{buildings.map((b,i)=><button type="button" key={b.id} onClick={()=>openSection(b.id as PortfolioId)}><span className="directory-icon" style={{background:b.color}}>{b.icon}</span><span><small>0{i+1} / {b.room.toUpperCase()}</small><strong>{b.name}</strong></span><span className="directory-arrow">↗</span></button>)}</div><p className="tiny">Direct access is always available to recruiters.</p></div>
        <div className="side-card"><div className="card-heading">⌘ CONTROLS</div><div className="control-grid"><div className="dpad">{(['up','left','down','right'] as Direction[]).map(dir=><button key={dir} className={`dpad-${dir}`} aria-label={`Move ${dir}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);press(dir,true);}} onPointerUp={()=>press(dir,false)} onPointerCancel={()=>press(dir,false)} onLostPointerCapture={()=>press(dir,false)}>{dir==='up'?'▲':dir==='down'?'▼':dir==='left'?'◀':'▶'}</button>)}</div><div className="input-help"><p><kbd>WASD</kbd> or arrows to move</p><p><kbd>{volcano?'SPACE':'E'}</kbd> {volcano?'attack':'interact'}</p><p><kbd>CLICK</kbd> {volcano?'attack':'travel / select'}</p><button className="action-button" onClick={()=>volcano?controller.current?.attack():controller.current?.interact()}>{volcano?'⚔ ATTACK':'⌂ ENTER / TALK'}</button></div></div></div></aside></div>
      </section>}
      <section className="below"><div className="section-heading"><span className="eyebrow">NO GAMEPLAY REQUIRED</span><h2>The work behind the <em>world.</em></h2><p>A quick route to the information that matters in a technical interview.</p></div><div className="shortcut-grid">{buildings.map(b=><button key={b.id} onClick={()=>openSection(b.id as PortfolioId)}><span className="shortcut-icon" style={{background:b.color}}>{b.icon}</span><strong>{b.room}</strong><small>{b.short} ↗</small></button>)}</div></section>
      <section className="architecture"><div><div className="eyebrow">UNDER THE HOOD</div><h2>Built to demonstrate <em>engineering.</em></h2><p>This portfolio is itself a working software project: React components own accessible UI, TypeScript models the world and game logic, p5 draws each frame, A* finds walking routes, and a finite-state-inspired enemy controller powers combat.</p></div><div className="architecture-pills"><span>React UI</span><span>TypeScript models</span><span>p5 rendering</span><span>A* pathfinding</span><span>Enemy AI</span><span>Collision physics</span><span>Vitest</span><span>Vite</span></div></section>
    </main>
    <footer className="footer"><span>© 2026 JAHVANTÈ TOTA · CHICAGO, IL</span><span>ONE PORTFOLIO / TWO WORLDS</span><a href={urls.email}>SAY HELLO ↗</a></footer>
    {panel&&<PortfolioPanel section={panel} victory={isVictoryPanel} onClose={closePanel}/>}
    {ending&&<div className="modal-backdrop"><section className="ending-modal" role="dialog" aria-modal="true" aria-labelledby="ending-title"><div className="ending-eyebrow">✦ FINAL QUEST COMPLETED ✦</div><div className="ending-art"><span className="knight-emoji">♞</span><span className="heart-emoji">♥</span><span className="cat-emoji">🐈</span></div><h2 id="ending-title">The knight was <em>Jahvantè.</em></h2><p>The helmet comes off. His wife runs to him and gives him a kiss. A little pixel heart appears. Nea meows, and the volcanic world finally grows quiet.</p><blockquote>“You did it! Thank you for saving us!”</blockquote><div className="ending-actions"><a className="primary-button" href="/assets/Jahvante_Tota_Resume.pdf" target="_blank" rel="noopener noreferrer">↓ VIEW / DOWNLOAD RÉSUMÉ</a><button onClick={()=>setEnding(false)}>WATCH REUNION SCENE</button><button onClick={()=>{setEnding(false);select('knight');}}>↺ REPLAY ADVENTURE</button><button onClick={returnToSelection}>CHANGE CHARACTER</button><button onClick={()=>select('jahvante')}>EXPLORE THE VILLAGE</button></div><div className="ending-bottom">QUEST COMPLETE — THANK YOU FOR EXPLORING JAHVANTÈ'S WORLD!</div></section></div>}
  </div>;
}
