import { useEffect, useRef } from 'react';
import { buildings, projects, experience, skillGroups, education, urls, badges, certificates, recommendations, additionalTraining } from '../data/content';
import type { PortfolioId } from '../game/core/types';

interface Props { section:PortfolioId; victory:boolean; onClose():void }
const base='/assets/credentials/';
const link=(href:string,label:string)=> <a className="panel-link" href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>;
function Content({section}:{section:PortfolioId}){
  switch(section){
    case 'projects':return <div className="entries">{projects.map(item=><article className="detail-card" key={item.title}><div className="mini-label">{item.type} · {item.year}</div><h3>{item.title}</h3><p>{item.summary}</p><p className="muted">{item.details}</p><div className="tags">{item.stack.map(x=><span key={x}>{x}</span>)}</div><div className="panel-links">{link(item.repo,'SOURCE CODE')}{link(item.live,'LIVE DEMO')}</div></article>)}</div>;
    case 'experience':return <div className="entries">{experience.map(item=><article className="detail-card" key={item.company}><div className="mini-label">{item.dates} · {item.location}</div><h3>{item.company}</h3><strong>{item.role}</strong><p>{item.description}</p></article>)}</div>;
    case 'skills':return <div className="entries skill-entries">{skillGroups.map(group=><article className="detail-card" key={group.label}><div className="mini-label">TECHNICAL SKILLS</div><h3>{group.label}</h3><div className="tags">{group.items.map(x=><span key={x}>{x}</span>)}</div></article>)}</div>;
    case 'about':return <div className="entries"><article className="detail-card"><div className="mini-label">ABOUT THE DEVELOPER</div><h3>Hi, I'm Jahvantè.</h3><p>I build full-stack applications, backend services, and interactive web experiences. I enjoy taking ideas from an initial concept to working, deployed software.</p><p>This playable portfolio is an example of how I combine software engineering, design and curiosity.</p></article>{education.map(item=><article className="detail-card" key={item.school}><div className="mini-label">{item.period}</div><h3>{item.school}</h3><p>{item.program}</p></article>)}</div>;
    case 'credentials':return <div className="entries"><div className="mini-label">SPECIALIST BADGES</div><div className="credential-grid">{badges.map(item=><article className="detail-card" key={item.title}><img className="badge-image" src={item.image.replace('./assets/','/assets/')} alt={item.title}/><h3>{item.title}</h3><p>{item.issuer} · {item.description}</p></article>)}</div><div className="mini-label">CERTIFICATES</div><div className="credential-grid">{certificates.map(item=><article className="detail-card" key={item.title}><img className="certificate-image" src={base+item.preview} alt={`${item.title} certificate preview`} loading="lazy"/><h3>{item.title}</h3><p>{item.issuer} · {item.date}</p>{link(base+item.pdf,'VIEW CERTIFICATE')}</article>)}</div><div className="mini-label">PROFESSIONAL REFERENCES</div><div className="credential-grid">{recommendations.map(item=><article className="detail-card" key={item.title}><h3>{item.title}</h3><p>{item.issuer} · {item.description}</p>{link(base+item.pdf,'READ RECOMMENDATION')}</article>)}</div><div className="mini-label">ADDITIONAL TRAINING</div><div className="credential-grid">{additionalTraining.map(item=><article className="detail-card" key={item.title}><h3>{item.title}</h3><p>{item.issuer} · {item.date}</p>{link(base+item.pdf,'VIEW DOCUMENT')}</article>)}</div></div>;
    case 'contact':return <div className="entries"><article className="detail-card"><div className="mini-label">START A NEW QUEST</div><h3>Let's build something.</h3><p>Interested in a developer role, a collaboration, or an interesting product? I'd be glad to hear from you.</p><div className="panel-links">{link(urls.email,'EMAIL')}{link(urls.linkedin,'LINKEDIN')}{link(urls.github,'GITHUB')}{link('/assets/Jahvante_Tota_Resume.pdf','RÉSUMÉ')}</div></article></div>;
  }
}
export function PortfolioPanel({section,victory,onClose}:Props){
  const ref=useRef<HTMLButtonElement>(null);
  const building=buildings.find(b=>b.id===section)!;
  useEffect(()=>{ref.current?.focus();const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[section,onClose]);
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="portfolio-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <header className="modal-top"><span>{victory?'✦ PORTFOLIO SECTION UNLOCKED':'⌂ LOCATION DISCOVERED'}</span><button ref={ref} onClick={onClose} aria-label="Close portfolio panel">✕ CLOSE</button></header>
    <div className="modal-content"><div className="modal-heading"><div className="modal-symbol" style={{background:building.color}}>{building.icon}</div><div><div className="mini-label">JAHVANTÈ TOWN / {building.room.toUpperCase()}</div><h2 id="modal-title">{building.name}</h2><p>{building.description}</p></div></div><Content section={section}/></div>
    <footer className="modal-footer"><button className="primary-button" onClick={onClose}>{victory?'CONTINUE ADVENTURE →':'RETURN TO GAME →'}</button></footer>
  </section></div>;
}
