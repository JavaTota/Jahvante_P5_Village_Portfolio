import type { CSSProperties } from 'react';
import { characters } from '../data/characters';
import type { CharacterId } from '../game/core/types';

function Portrait({id}:{id:CharacterId}){
  if(id==='nea')return <svg viewBox="0 0 80 80" shapeRendering="crispEdges" aria-hidden="true"><rect width="80" height="80" fill="#203d46"/><path d="M14 45 12 13l21 14h14l21-14-2 32-9 19H23Z" fill="#8e806d" stroke="#2b3437" strokeWidth="5"/><rect x="19" y="28" width="12" height="10" fill="#574d45"/><rect x="48" y="28" width="12" height="10" fill="#574d45"/><rect x="23" y="43" width="12" height="7" fill="#acd37b"/><rect x="45" y="43" width="12" height="7" fill="#acd37b"/><rect x="31" y="52" width="18" height="13" fill="#eee7d8"/><rect x="38" y="53" width="5" height="4" fill="#c48d83"/></svg>;
  if(id==='knight')return <svg viewBox="0 0 80 80" shapeRendering="crispEdges" aria-hidden="true"><rect width="80" height="80" fill="#312333"/><rect x="8" y="55" width="64" height="25" fill="#952b36"/><rect x="15" y="17" width="50" height="49" fill="#171c26"/><rect x="22" y="11" width="36" height="17" fill="#343741"/><rect x="20" y="39" width="40" height="10" fill="#c63a3f"/><rect x="26" y="41" width="29" height="4" fill="#fa6b54"/><rect x="34" y="53" width="12" height="26" fill="#28313c"/></svg>;
  return <svg viewBox="0 0 80 80" shapeRendering="crispEdges" aria-hidden="true"><rect width="80" height="80" fill={id==='wife'?'#3d425f':'#2c4e50'}/><rect x="13" y="57" width="54" height="23" fill={id==='wife'?'#5a7fad':'#406a78'}/><rect x="20" y="26" width="40" height="42" fill={id==='wife'?'#e5b292':'#b7835e'}/><rect x="17" y="17" width="46" height="20" fill={id==='wife'?'#563930':'#26252c'}/>{id==='wife'?<><rect x="14" y="22" width="11" height="46" fill="#563930"/><rect x="55" y="22" width="11" height="46" fill="#563930"/></>:<><rect x="12" y="22" width="12" height="13" fill="#26252c"/><rect x="54" y="22" width="12" height="13" fill="#26252c"/></>}<rect x="29" y="44" width="6" height="5" fill="#27323c"/><rect x="47" y="44" width="6" height="5" fill="#27323c"/><rect x="37" y="56" width="12" height="3" fill="#71483e"/></svg>;
}
export function CharacterSelect({onSelect}:{onSelect(id:CharacterId):void}){
  return <section className="select-screen" aria-labelledby="choose-heading">
    <div className="select-header"><div className="eyebrow">SELECT YOUR ADVENTURE / 01</div><h2 id="choose-heading">Choose your <em>character.</em></h2><p>One portfolio. Two worlds. Four ways to explore.</p></div>
    <div className="characters">{characters.map(character=><button type="button" className={`character-card ${character.mode==='volcano'?'character-card--knight':''}`} key={character.id} style={{'--character-accent':character.accent} as CSSProperties} onClick={()=>onSelect(character.id)}>
      <span className="portrait"><Portrait id={character.id}/></span><span className="character-meta"><small>{character.mode==='volcano'?'COMBAT MODE':'EXPLORE MODE'}</small><strong>{character.name}</strong><b>{character.role}</b><span>{character.description}</span><span className="card-arrow">START ADVENTURE ↗</span></span>
    </button>)}</div>
    <p className="selection-footnote">Prefer a traditional portfolio? Use the directory below — no game completion required.</p>
  </section>;
}
