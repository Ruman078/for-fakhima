import {config} from './config.js';
import {timeline, reducedMotion} from './motion.js';
import {landscape} from './landscape.js';
import {emblem, icons, moon, seedButton, corner} from './illustrations.js';
import {mountGarden} from './garden-art.js';
import {gardenSound} from './sound.js';

const $=selector=>document.querySelector(selector);
const roman=['I','II','III','IV','V','VI','VII','VIII'];
const scene=$('#scene'),book=$('#book'),plate=$('#plate'),map=$('#chapter-layer');
const escapeText=s=>String(s).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const name=escapeText(config.recipient),sender=escapeText(config.sender);
Object.entries(config.palette).forEach(([key,value])=>book.style.setProperty('--'+key,value));
$('.dedication i').textContent=config.recipient;
$('.emblem').innerHTML=emblem();$('.sound-icon').innerHTML=icons.silent;$('.map-icon').innerHTML=icons.chapters;
$('.etched-frame').innerHTML=Array.from({length:4},()=>`<span>${corner()}</span>`).join('');
$('#prev').innerHTML=icons.left;$('#next').innerHTML=icons.right;$('#close-chapters').innerHTML=icons.close;
$('#contents').innerHTML=config.chapters.map((title,i)=>`<button data-page="${i}"><span>${roman[i]}</span>${escapeText(title)}${icons.right}</button>`).join('');
$('#progress').innerHTML=roman.map(()=>'<i></i>').join('');
function showSound(state) {
  const enabled=state==='on';
  const status={on:'Sound on',off:'Sound off',starting:'Starting sound',paused:'Resume sound',retry:'Try sound again'};
  const button=$('#sound');
  button.setAttribute('aria-pressed',String(enabled));
  button.setAttribute('aria-label',enabled?'Turn sound off':state==='off'?'Turn sound on':status[state]);
  button.querySelector('.tool-text').textContent=status[state];
  button.querySelector('.sound-icon').innerHTML=enabled?icons.sound:icons.silent;
}
const environment=landscape(plate,config.quality),garden=mountGarden($('#garden')),sound=gardenSound(showSound);
$('#sound').hidden=!sound.available;
let current=-1,schedule,cleanup,serial=0,awakening=false,locked=false;
let bouquetModule;
const foundNotes = new Set();
const button=(label,action,icon=icons.right)=>`<button class="garden-button" data-action="${action}">${label}${icon}</button>`;
const date=`<div class="date-line"><span></span>${escapeText(config.birthday)}<span></span></div>`;
function content(page) {
  if(page===0) return `<div class="centerpiece greeting">
    <div class="moon-art">${moon()}</div>${date}
    <h1 aria-label="${escapeText(config.greeting)} ${name.toUpperCase()} :3"><span class="salutation">${escapeText(config.greeting)}</span><span class="recipient">${name}<small> :3</small></span></h1>
    <p class="aside">${escapeText(config.aside)}</p>
    <button class="wake-button" data-action="wake" aria-label="Wake the garden"><span class="seed-art">${seedButton()}</span><span class="tap-label">tap it jee</span></button>
  </div>`;
  if(page===1) return `<div class="centerpiece growing first-growth"><div class="little-moon">${moon()}</div><h1>The first <i>daisy.</i></h1><p class="bloom-message">Since you like these so much...</p></div>`;
  if(page===2) return `<div class="centerpiece growing lily-growth"><div class="little-moon">${moon()}</div><h1>A few <i>lilies,</i> too.</h1><p class="aside">Okay, maybe more than a few.</p></div>`;
  if(page===3 || page===7) {
    const finale=page===7, greeting=escapeText(finale?config.finalGreeting:config.birthdayGreeting);
    return `<div class="centerpiece celebration ${finale?'finale':''}"><div class="celebration-ornament">${finale?emblem():moon()}</div>${date}
      <h1 aria-label="${greeting} ${name.toUpperCase()}"><span class="salutation">${greeting}</span><span class="recipient name-reveal" aria-hidden="true">${Array.from(config.recipient).map((ch,i)=>`<i style="--i:${i}">${escapeText(ch)}</i>`).join('')}</span></h1>
      <p class="aside">${escapeText(finale?config.closing:config.birthdayAside)}</p>
      ${finale?`<p class="signature">With love, ${sender}</p>`:button('Make your bouquet','next')}
    </div>${finale?`<nav class="closing-actions" aria-label="Revisit your garden">${button('Visit the garden','visit')}${button('Read the letter','letter')}${button('New bouquet','bouquet')}${button('Replay','replay',icons.replay)}</nav>`:''}`;
  }
  return '';
}
function syncNav(){
  const title=config.chapters[current];
  $('#chapter-number').textContent=String(current+1).padStart(2,'0')+' / 08';
  $('#chapter-title').textContent=title;$('#folio').textContent=roman[current];
  $('#prev').disabled=current===0;$('#next').disabled=current===7;
  $('#next').setAttribute('aria-label',current===1||current===2?'Skip growth animation':'Next chapter');
  $('#progress').querySelectorAll('i').forEach((node,i)=>node.classList.toggle('active',i===current));
  document.querySelectorAll('#contents button').forEach((node,i)=>{if(i===current)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');});
  $('#announce').textContent='Chapter '+(current+1)+'. '+title;
}
async function go(page,focus=true){
  if(page<0 || page>7 || page===current) return;
  if(current>=0 && !(awakening && page===1)) {
    sound.play(page===7?'finale':page===3?'birthday':page===2?'bloom':'chapter');
  }
  const token=++serial;
  schedule?.cancel();cleanup?.();cleanup=null;schedule=timeline();
  if(!map.hidden)closeMap(false);
  current=page;awakening=false;book.classList.remove('awakening');
  book.dataset.stage=String(page);
  environment.setStage(page);garden.setStage(page);syncNav();
  scene.scrollTop=0;scene.className='scene scene-'+page;
  scene.innerHTML=content(page);
  if(page===4 || page===5 || page===6) {
    const feature=page===4?await import('./bouquet.js'):await import('./keepsakes.js');
    if(token!==serial)return;
    const mount=page===4?feature.mountBouquet:page===5?feature.mountLetter:feature.mountDiscoveries;
    if(page===4)bouquetModule=feature;
    cleanup=mount(scene,{config,foundNotes,onSound:sound.play,onNext:()=>{if(page===current)go(page+1);}});
  }
  if(focus){
    const anchor=scene.querySelector('h1,h2')||scene;
    anchor.tabIndex=-1;anchor.focus({preventScroll:true});
  }
  if(page===1 || page===2) {
    const delay=reducedMotion.matches?(page===1?1800:2100):(page===1?config.timing.firstBloom:config.timing.gardenBloom);
    schedule.after(delay,()=>{if(map.hidden)go(page+1);else pendingAdvance=page;});
    if(page===1 && !reducedMotion.matches) schedule.after(5100,()=>{if(map.hidden)sound.play('bloom');});
  }
}
function wake(event){
  if(awakening || current!==0) return;
  awakening=true;
  const rect=plate.getBoundingClientRect(),seed=$('.seed-art').getBoundingClientRect();
  const x=event.detail?event.clientX:seed.left+seed.width/2,y=event.detail?event.clientY:seed.top+seed.height/2;
  const ripple=document.createElement('span');ripple.className='light-ripple';
  ripple.style.left=(x-rect.left)+'px';ripple.style.top=(y-rect.top)+'px';
  plate.append(ripple);setTimeout(()=>ripple.remove(),1650);
  book.classList.add('awakening');sound.play('wake');schedule.after(reducedMotion.matches?80:config.timing.wake,()=>go(1));
}
async function replay(){bouquetModule?.resetBouquet?.();foundNotes.clear();await go(0);}
scene.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(!action)return;
  if(action==='wake')wake(event);
  if(action==='next')go(current+1);
  if(action==='visit')go(6);
  if(action==='letter')go(5);
  if(action==='bouquet'){bouquetModule?.resetBouquet();go(4);}
  if(action==='replay')replay();
});
// A double tap on a page arrow should turn only one page.
function turn(delta){
  if(locked)return;locked=true;setTimeout(()=>{locked=false;},360);
  go(current+delta);
}
$('#prev').addEventListener('click',()=>turn(-1));$('#next').addEventListener('click',()=>turn(1));
$('#sound').addEventListener('click',sound.toggle);
let pendingAdvance=null;
function openMap(){
  sound.play('menuOpen');
  map.hidden=false;
  $('#contents [aria-current]')?.focus();
  book.inert=true;book.setAttribute('aria-hidden','true');environment.pause(true);
}
function closeMap(focus=true){
  if(focus)sound.play('menuClose');
  map.hidden=true;book.inert=false;book.removeAttribute('aria-hidden');environment.pause(false);
  if(focus)$('#chapters').focus({preventScroll:true});
  const page=pendingAdvance;pendingAdvance=null;
  if(focus && page===current)schedule.after(1100,()=>go(page+1));
}
$('#chapters').addEventListener('click',openMap);$('#close-chapters').addEventListener('click',()=>closeMap());
map.addEventListener('click',event=>{
  if(event.target===map){closeMap();return;}
  const choice=event.target.closest('[data-page]');
  if(choice){const page=Number(choice.dataset.page);closeMap(page===current);go(page);}
});
map.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();closeMap();return;}
  if(e.key!=='Tab')return;
  const controls=map.querySelectorAll('button'),first=controls[0],last=controls[controls.length-1];
  if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
});
go(0,false);
