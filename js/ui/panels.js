import { buildings,projects,experience,skillGroups,education,urls,badges,certificates,recommendations,additionalTraining } from '../data/content.js';

const escapeHTML = (value) => String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const chipList = (items) => items.map(item=>`<span>${escapeHTML(item)}</span>`).join('');
const external=(url,text)=>`<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${text} ↗</a>`;

function projectsHTML(){
  return `<section class="panel-section"><h3>01 / Featured projects</h3>
    ${projects.map((project,index)=>`<article class="panel-project"><span class="panel-project__label">QUEST ${String(index+1).padStart(2,'0')} / ${escapeHTML(project.type)} / ${project.year}</span>
      <h4>${escapeHTML(project.title)}</h4><p>${escapeHTML(project.summary)}</p><p>${escapeHTML(project.details)}</p>
      <div class="panel-project__chips">${chipList(project.stack)}</div>
      <div class="panel-project__links">${external(project.repo,'VIEW CODE')}${external(project.live,'VIEW LIVE')}</div>
    </article>`).join('')}
  </section><p class="panel-note">More work will be added as projects move from development into public releases. Public repository and demo links are supplied where available.</p>`;
}
function experienceHTML(){
  return `<section class="panel-section"><h3>02 / Work experience</h3>
    ${experience.map(entry=>`<article class="panel-experience"><time>${escapeHTML(entry.dates)} · ${escapeHTML(entry.location)}</time>
      <h4>${escapeHTML(entry.company)}</h4><strong>${escapeHTML(entry.role)}</strong><p>${escapeHTML(entry.description)}</p>
    </article>`).join('')}
  </section><p class="panel-note">Trep DigitalX is listed as the employer; RIBER Italia is identified as a client project completed during that internship.</p>`;
}
function skillsHTML(){
  return `<section class="panel-section"><h3>03 / Inventory by category</h3>
    ${skillGroups.map(group=>`<article class="panel-project"><h4>${escapeHTML(group.label)}</h4><div class="panel-tags">${chipList(group.items)}</div></article>`).join('')}
  </section><section class="panel-section"><h3>Currently exploring</h3><div class="panel-tags">${chipList(['Java','Spring Boot','Networking','Backend architecture','AI automation'])}</div></section>`;
}
function aboutHTML(){
  return `<section class="panel-section"><h3>04 / Player biography</h3><p class="panel-bio">I'm Jahvantè Tota, a full-stack developer based in Chicago. I build web and mobile experiences, backend APIs, and systems that connect interfaces, data, and business needs. I care about clear code, maintainable architecture, collaboration, and owning a project beyond the first prototype.</p>
    <p class="panel-bio">My practical background spans freelance/client delivery, AI and financial-data integrations at FinSight AI, and website development at Trep DigitalX. I'm also completing a BSc in Computer Science at the University of London.</p></section>
    <section class="panel-section"><h3>Education & training</h3>
    ${education.map(item=>`<article class="panel-experience"><time>${escapeHTML(item.period)}</time><h4>${escapeHTML(item.school)}</h4><strong>${escapeHTML(item.program)}</strong></article>`).join('')}
    </section><div class="panel-actions">${external(urls.linkedin,'LINKEDIN')}${external(urls.github,'GITHUB')}${external(urls.resume,'RESUME PDF')}</div>`;
}

const credentialBlobCache = new Map();
function credentialAsset(name){
  const embedded = window.__credentialAssets?.[name];
  if(!embedded)return `./assets/credentials/${encodeURIComponent(name)}`;
  if(!name.endsWith('.pdf'))return embedded;
  if(!credentialBlobCache.has(name)){
    const data = atob(embedded.slice(embedded.indexOf(',')+1));
    const bytes = new Uint8Array(data.length);
    for(let i=0;i<data.length;i++)bytes[i]=data.charCodeAt(i);
    credentialBlobCache.set(name, URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})));
  }
  return credentialBlobCache.get(name);
}
function credentialCard(item, index){
  return `<article class="credential-card">
    <div class="credential-card__image"><img loading="lazy" src="${credentialAsset(item.preview)}" alt="Preview of ${escapeHTML(item.title)}" /></div>
    <div class="credential-card__text">
      <span class="panel-project__label">${escapeHTML(item.type || `DOCUMENT ${String(index+1).padStart(2,'0')}`)}</span>
      <h4>${escapeHTML(item.title)}</h4>
      <p class="credential-card__issuer">${escapeHTML(item.issuer)}${item.date?` · ${escapeHTML(item.date)}`:''}</p>
      ${item.description?`<p>${escapeHTML(item.description)}</p>`:''}
      <div class="panel-project__links"><a href="${credentialAsset(item.pdf)}" target="_blank" rel="noopener noreferrer">VIEW DOCUMENT ↗</a><a href="${credentialAsset(item.pdf)}" download>DOWNLOAD ↓</a></div>
    </div>
  </article>`;
}
function credentialsHTML(){
  return `<section class="panel-section"><h3>05 / Coding Temple skill badges</h3>
    <p class="panel-bio">Achievements unlocked: Backend Specialist and Frontend Specialist.</p>
    <div class="badge-gallery">${badges.map(item=>`<figure class="badge-tile"><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.issuer)} ${escapeHTML(item.title)} certified badge" /><figcaption><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.issuer)}</small></figcaption></figure>`).join('')}</div>
  </section>
  <section class="panel-section"><h3>Completed developer training</h3><div class="credential-list">${certificates.map(credentialCard).join('')}</div></section>
  <section class="panel-section"><h3>Professional recommendations</h3><p class="panel-bio">Letters from people who evaluated my work directly.</p><div class="credential-list">${recommendations.map(credentialCard).join('')}</div></section>
  <details class="credential-extras"><summary>View additional training certificates</summary><div class="credential-list">${additionalTraining.map(credentialCard).join('')}</div></details>
  <p class="panel-note">These are supporting credentials, not substitutes for code samples and working applications. Documents open as PDF files.</p>`;
}
function contactHTML(){
  return `<section class="panel-section"><h3>06 / Start a new quest</h3><p class="panel-bio">Interested in a development role, collaboration, or a product worth building? I’d be glad to hear about it.</p></section>
  <div class="panel-actions"><a href="${urls.email}">✉ EMAIL ME</a>${external(urls.linkedin,'LINKEDIN')}${external(urls.github,'GITHUB')}${external(urls.resume,'DOWNLOAD RÉSUMÉ')}</div>
  <section class="panel-section"><h3>What I work on</h3><div class="panel-tags">${chipList(['Full-stack web apps','REST APIs','Backend systems','Frontend products','AI / automation','Client websites'])}</div></section>`;
}
const renderers={projects:projectsHTML,experience:experienceHTML,skills:skillsHTML,about:aboutHTML,credentials:credentialsHTML,contact:contactHTML};
let lastFocus=null;
let active=null;
let onChanged=()=>{};
const backdrop=document.getElementById('panel-backdrop');
const body=document.getElementById('panel-body');
const panel=document.getElementById('portfolio-panel');
const kicker=document.getElementById('panel-kicker');
const closeButton=document.getElementById('close-panel');

export function isPanelOpen(){return active!==null;}
export function onPanelChange(fn){onChanged=fn;}
export function openPanel(id){
  const b=buildings.find(item=>item.id===id);if(!b)return;
  lastFocus=document.activeElement;active=id;
  kicker.textContent=`LOCATION DISCOVERED  /  ${String(buildings.indexOf(b)+1).padStart(2,'0')} OF ${String(buildings.length).padStart(2,'0')}`;
  body.innerHTML=`<div class="panel-heading-block"><span class="panel-heading-block__pixel" aria-hidden="true">${b.icon}</span><div><span class="panel-eyebrow">JAHVANTÈ TOWN · ${escapeHTML(b.room.toUpperCase())}</span><h2 id="panel-heading">${escapeHTML(b.name)}</h2><p class="panel-subtitle">${escapeHTML(b.description)}</p></div></div>${renderers[id]()}`;
  backdrop.hidden=false;document.body.style.overflow='hidden';
  try{window.history.replaceState(null,'',`#${id}`);}catch{/* Standalone local preview / restricted origins */}
  panel.scrollTop=0;closeButton.focus();onChanged(true);
}
export function closePanel(){
  if(!active)return;
  active=null;backdrop.hidden=true;document.body.style.overflow='';
  try{window.history.replaceState(null,'',`${window.location.pathname}${window.location.search}#home`);}catch{/* Standalone local preview / restricted origins */}
  onChanged(false);
  if(lastFocus instanceof HTMLElement)lastFocus.focus({preventScroll:true});
}
closeButton.addEventListener('click',closePanel);
backdrop.addEventListener('click',event=>{if(event.target===backdrop)closePanel();});
document.addEventListener('keydown',event=>{
  if(!isPanelOpen())return;
  if(event.key==='Escape'){event.preventDefault();closePanel();return;}
  // Keep focus inside the dialog.
  if(event.key==='Tab'){
    const focusable=[...panel.querySelectorAll('a[href], button:not([disabled])')];
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});
