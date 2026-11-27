import { botanicalDefs, sprig } from './botany.js';
import { flowerArc } from './motion.js';
import { cutFlowers, floristDefs, flowerId, useArt } from './florist-art.js';
import { wrapChoices, defaultWrap, makeWrap, swatch } from './bouquet-wrap.js';

const LIMIT = 42;
const SVG_NS = 'http://www.w3.org/2000/svg';
const bouquet = { stems: [], nextId: 1, arrangement: 0, wrapped: false, wrap: defaultWrap() };
let mounts = 0;

export function resetBouquet() {
  Object.assign(bouquet, {stems:[], nextId:1, arrangement:0, wrapped:false, wrap:defaultWrap()});
}

const escape = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[c]));

const icons = {
  undo: '<path d="m8 4-5 5 5 5M4 9h9a5 5 0 0 1 0 10h-3"/>',
  arrange: '<path d="M3 7h3c5 0 7 10 12 10h3m-4-4 4 4-4 4M3 17h3c1.5 0 3.1-1.5 4.4-3.6M13.5 9.5C15 7.7 16.4 7 18 7h3m-4-4 4 4-4 4"/>',
  arrow: '<path d="M3 12h17m-6-6 6 6-6 6"/>',
  save: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
};
const icon = key => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" aria-hidden="true">${icons[key]}</svg>`;

function paper(prefix) {
  const grain = Array.from({ length: 62 }, (_, i) => {
    const x = (i * 37.1) % 42;
    const y = (i * 17.6 + i * i / 3) % 42;
    return `<path d="m${x.toFixed(1)} ${y.toFixed(1)} .65 -.21"/>`;
  }).join('');
  const corner = '<path d="M0 23V0h23M2.8 13V2.8h10.2M0 6.5c6.5 0 6.5-3.3 8.9-3.3-1 1.9-1.8 5.5-5.8 5.9C4 6.9 6.6 4.3 8.9 3.2"/>';
  return `<defs>
    <linearGradient id="${prefix}-paper" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#f4ebd2"/><stop offset=".54" stop-color="#e5d8b6"/><stop offset="1" stop-color="#f0e6cc"/></linearGradient>
    <pattern id="${prefix}-grain" width="42" height="42" patternUnits="userSpaceOnUse"><g fill="none" stroke="#6c6444" stroke-width=".63" opacity=".19">${grain}</g></pattern>
    <clipPath id="${prefix}-tucked"><path d="M0 0H320V175H232L186 299 157 313 89 179H0Z"/></clipPath>
  </defs><rect width="320" height="350" fill="url(#${prefix}-paper)"/><rect width="320" height="350" fill="url(#${prefix}-grain)"/>
  <g fill="none" stroke="#8b8265" stroke-width=".65" opacity=".6"><path d="M24 11h272M24 339h272M11 24v302m298-302v302" opacity=".5"/>${[[11,11,0],[309,11,90],[309,339,180],[11,339,270]].map(([x,y,r])=>`<g transform="translate(${x} ${y}) rotate(${r})">${corner}</g>`).join('')}</g>`;
}

function emptyStudy(prefix) {
  const specimens = [
    ['lavender', 145, 278, -24, 1.09, 6],
    ['white-lily', 158, 287, 12, 1.14, 8],
    ['daisy', 169, 283, -15, .98, 47]
  ];
  const drawing = specimens.map(([type, x, y, angle, size, seed]) =>
    `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${size})">${sprig(type,{prefix,seed})}</g>`
  ).join('');
  return `<g class="bq-empty"><g class="bq-pencil" opacity=".57">${drawing}</g>
    <g fill="none" stroke="#8f7c64" stroke-width="1.1" stroke-linecap="round" opacity=".75">
      <path d="M146 259q11-5 25-4l-1 4q-10-1-23 4z" fill="#c9b595"/>
      <path d="M155 260c-16-10-23-10-24-6s7 9 25 5c8-11 18-19 22-14s-9 13-22 15m2-1q-9 18-24 18m23-17q7 10 21 11"/>
    </g></g>`;
}

function chosenFlowers(config) {
  const types = config.flowerTypes || config.flowers;
  if (!Array.isArray(types)) return cutFlowers;
  const allowed = new Set(types.map(item => typeof item === 'string' ? item : item?.type));
  const choices = cutFlowers.filter(flower => allowed.has(flower.type));
  return choices.length ? choices : cutFlowers;
}

// A rounded crown grows wider and taller with each new tier. Divide the stems
// by the width of each chord so a full bouquet keeps its domed silhouette.
function arrangement() {
  const { stems, arrangement: variant } = bouquet;
  if (!stems.length) return [];
  const n=stems.length, fullness=(n-1)/(LIMIT-1);
  const tierCount=Math.ceil(Math.sqrt(n/2));
  const weights=Array.from({length:tierCount},(_,i)=>{
    const depth=tierCount===1?.5:i/(tierCount-1);
    return .60+.40*Math.sin(Math.PI*(.09+depth*.83));
  });
  const total=weights.reduce((a,b)=>a+b,0);
  const quota=weights.map(w=>n*w/total);
  const counts=quota.map(Math.floor);
  const remaining=n-counts.reduce((a,b)=>a+b,0);
  const fractions=quota.map((q,i)=>({i,remainder:q-counts[i]})).sort((a,b)=>b.remainder-a.remainder);
  fractions.slice(0,remaining).forEach(({i})=>counts[i]++);
  const rank=stem=>{
    const airy=['breath','sweet-pea','lavender'].includes(stem.type);
    const phase=stem.id*.61803399+Math.sin(stem.id*2.37+variant*1.61)*.29+variant*.23;
    return (phase-Math.floor(phase))-(airy?.56:0);
  };
  const ordered=stems.slice().sort((a,b)=>rank(a)-rank(b));
  const placements=[];
  const nominalSpread=Math.min(121,45+Math.sqrt(n)*12);
  for(let row=0;row<tierCount;row++){
    const depth=tierCount===1?0:row/(tierCount-1);
    const count=counts[row];
    const spread=Math.min(nominalSpread*weights[row],(count-1)*(n<10?32:24));
    for(let i=0;i<count;i++){
      const stem=ordered[placements.length],across=count===1?0:2*i/(count-1)-1;
      const wobble=Math.sin(stem.id*3.91+variant*.75);
      const x=160+spread*across+wobble*2.3;
      const y=(n===1?116:103-32*fullness)+depth*(37+70*fullness)+across*across*(13-7*fullness)+Math.cos(stem.id*1.91+variant)*3;
      const angle=Math.atan2(x-165,258-y),length=Math.hypot(x-165,258-y)/124;
      const width=(.96-fullness*.38)*(depth*.15+.87);
      const a=width*Math.cos(angle),b=width*Math.sin(angle),c=-length*Math.sin(angle),d=length*Math.cos(angle);
      const stemMatrix=[a,b,c,d,165+c*36,258+d*36];
      const tilt=angle*.49+wobble*.27;
      const size=(.9-.34*Math.sqrt(fullness))*(.94+.11*depth)*(1+wobble*.052);
      const dx=size*Math.cos(tilt),dy=size*Math.sin(tilt);
      const headMatrix=[dx,dy,-dy,dx,x,y];
      const matrix=data=>'matrix('+data.map(v=>v.toFixed(4)).join(',')+')';
      placements.push({stem,x,y,stemMatrix:matrix(stemMatrix),headMatrix:matrix(headMatrix)});
    }
  }
  return placements;
}

function cutStem(type, seed) {
  const bend=Math.sin(seed)*8;
  const shaft='M0 0Q'+bend.toFixed(2)+' -84 0 -160';
  const sparse=['breath','lavender','sweet-pea'].includes(type);
  const slender=['white-lily','pink-lily','tulip','cosmos','lavender','cornflower'].includes(type);
  const leaves=[];
  for(let i=0;i<(sparse?2:4);i++){
    const y=-39-i*22,side=i%2===0?-1:1;
    const x=(bend*.45).toFixed(1),length=slender?40:30,w=slender?4:8;
    leaves.push(`<g transform="translate(${x} ${y}) scale(${side} 1) rotate(25)"><path d="M0 0Q${-w} -12 1 -${length}Q${w+4} -14 0 0Z" fill="${i%2?'#85947b':'#6e826d'}" stroke="#596f60" stroke-width=".64"/><path d="M0 -1Q3 -17 1 -${length-2}" fill="none" stroke="#b2bb99" stroke-width=".6"/></g>`);
  }
  return `<path d="${shaft}" fill="none" stroke="#536f5e" stroke-width="1.85"/><path d="${shaft}" fill="none" stroke="#a8b28b" stroke-width=".62"/>${leaves.join('')}`;
}

function trimControls() {
  const labels={paper:'Paper',pattern:'Print',ribbon:'Ribbon'};
  return Object.entries(wrapChoices).map(([kind,options])=>
    `<fieldset class="bq-trim-row"><legend>${labels[kind]}</legend><div class="bq-swatch-list">${Object.entries(options).map(([key,{name}])=>
      `<button class="bq-trim-choice" type="button" data-${kind}="${key}" aria-label="${labels[kind]} · ${name}" aria-pressed="false" title="${name}">${swatch(kind,key)}</button>`).join('')}</div><span class="bq-selected-name" data-selected="${kind}"></span></fieldset>`
  ).join('');
}

export function mountBouquet(host, { onNext, onSound = () => {}, config = {} } = {}) {
  const prefix = 'bouquet-' + (++mounts);
  const recipient = config.recipient || 'Fakhima';
  const choices = chosenFlowers(config);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const flyers = new Set();
  const nodes = new Map();
  const movements = new Map();
  let lastPlacement = -Infinity;
  let disposed = false;
  let saving = false;

  const root = document.createElement('section');
  root.className = 'bq-root';
  root.setAttribute('aria-label', 'Make your bouquet');
  root.innerHTML = `<div class="bq-layout">
    <div class="bq-intro"><h1 class="bq-title" tabindex="-1"></h1><p class="bq-description"></p></div>
    <div class="bq-paper"><svg class="bq-sheet" viewBox="0 0 320 350" xmlns="${SVG_NS}" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="Your flower arrangement">${botanicalDefs(prefix)}${floristDefs(prefix,choices)}${paper(prefix)}${emptyStudy(prefix)}<g class="bq-tissue-slot"></g><g class="bq-stems"></g><g class="bq-wrap-slot"></g><g class="bq-heads"></g></svg></div>
    <div class="bq-controls"><div class="bq-tray" aria-label="Choose your flowers">
      ${choices.map(({type,name}) => `<button type="button" data-flower="${type}" aria-label="Add ${escape(name)}" class="bq-choice"><svg class="bq-sample" aria-hidden="true" viewBox="-53 -53 106 92"><path d="M-5 33Q2 15 0 0m-2 24q14-1 15-12-12 2-15 12Z" stroke="#9fa887" stroke-width="1.1" fill="#70876f"/>${useArt(flowerId(prefix,type))}</svg><span class="bq-quantity" aria-hidden="true"></span><span class="bq-flower-name">${escape(name)}</span></button>`).join('')}
    </div><div class="bq-tools"><span class="bq-tally"><span class="bq-count"></span><span class="bq-capacity"> / ${LIMIT}</span></span><div class="bq-tool-group"><button type="button" data-bq-action="undo" aria-label="Undo last flower" title="Undo last flower">${icon('undo')}<span>Undo</span></button><button type="button" data-bq-action="arrange" aria-label="Rearrange bouquet" title="Rearrange bouquet">${icon('arrange')}<span>Rearrange</span></button></div></div>
    <div class="bq-trims" aria-label="Customize your wrap" hidden>${trimControls()}</div>
    <div class="bq-actions"><button type="button" class="bq-primary" data-bq-action="wrap">Choose your wrap ${icon('arrow')}</button><button type="button" class="bq-primary" data-bq-action="next">Open your letter ${icon('arrow')}</button><button type="button" class="bq-secondary" data-bq-action="save">${icon('save')} Save PNG</button><button type="button" class="bq-secondary" data-bq-action="edit">Edit flowers</button></div></div>
    <span class="bq-sr" role="status" aria-live="polite" aria-atomic="true"></span>
  </div>`;
  host.append(root);
  const $ = selector => root.querySelector(selector);
  const sheet = $('.bq-sheet');
  const stemsLayer = $('.bq-stems');
  const headsLayer = $('.bq-heads');
  const tissueSlot = $('.bq-tissue-slot');
  const wrapSlot = $('.bq-wrap-slot');
  const speak = message => { $('.bq-sr').textContent = message; };

  function fly(button, placed) {
    const svgMatrix = sheet.getScreenCTM();
    if (reduced.matches || !svgMatrix || !Element.prototype.animate || flyers.size >= 4) return 0;
    const sample = button.querySelector('svg');
    const origin = sample.getBoundingClientRect();
    const target = sheet.createSVGPoint();
    target.x = placed.x; target.y = placed.y;
    const end = target.matrixTransform(svgMatrix);
    const startX = origin.left + origin.width * .5;
    const startY = origin.top + origin.height * .25;
    const dx = end.x - startX, dy = end.y - startY;
    const float = document.createElementNS(SVG_NS, 'svg');
    float.setAttribute('viewBox', '-52 -56 104 112');
    float.setAttribute('aria-hidden', 'true');
    float.setAttribute('class', 'bq-fly');
    float.style.left = (startX - 29) + 'px'; float.style.top = (startY - 29) + 'px';
    const instance = document.createElementNS(SVG_NS, 'use');
    const href='#'+flowerId(prefix,placed.stem.type,placed.stem.id%2);
    instance.setAttribute('href',href);
    instance.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',href);
    float.append(instance);
    document.body.append(float);
    flyers.add(float);
    const keys = [0,.25,.55,.8,1].map(t => {
      const pose=flowerArc(t,dx,dy,46);
      return {offset:t, transform:`translate(${pose.x}px, ${pose.y}px) rotate(${pose.angle}deg) scale(${pose.scale})`, opacity:t===1?0:.96};
    });
    const flight = float.animate(keys,{duration: 570,easing:'cubic-bezier(.22,.6,.33,1)',fill:'forwards'});
    const land = () => { float.remove(); flyers.delete(float); };
    flight.onfinish = land;
    flight.oncancel = land;
    return 315;
  }

  function position(node, matrix, animate) {
    const before=node.getAttribute('transform');
    if(before===matrix) return;
    const running=movements.get(node);
    running?.cancel();
    movements.delete(node);
    node.setAttribute('transform',matrix);
    if(!animate || !before || !node.animate) return;
    const tween=node.animate([{transform:before},{transform:matrix}],{duration:470,easing:'cubic-bezier(.22,.76,.3,1)'});
    movements.set(node,tween);
    tween.onfinish=()=>{if(movements.get(node)===tween)movements.delete(node);};
  }

  function drawStems(added, from) {
    const keep = new Set(bouquet.stems.map(stem=>stem.id));
    for(const [id, item] of nodes) {
      if(keep.has(id)) continue;
      for(const node of [item.cut,item.head]) {
        movements.get(node)?.cancel(); movements.delete(node); node.remove();
      }
      nodes.delete(id);
    }
    const now=performance.now(),animate=!reduced.matches && now-lastPlacement>95;
    lastPlacement=now;
    const layout=arrangement();
    for(const [index,placed] of layout.entries()) {
      const {stem,stemMatrix,headMatrix}=placed;
      let item=nodes.get(stem.id);
      if(!item) {
        const cut=document.createElementNS(SVG_NS,'g'),head=document.createElementNS(SVG_NS,'g');
        cut.innerHTML=cutStem(stem.type,stem.seed);head.innerHTML=useArt(flowerId(prefix,stem.type,stem.id%2));
        cut.dataset.stemId=String(stem.id);head.dataset.stemId=String(stem.id);
        item={cut,head};nodes.set(stem.id,item);
      }
      // Only move a painted group in the document when its depth changes.
      if(stemsLayer.children[index]!==item.cut)stemsLayer.insertBefore(item.cut,stemsLayer.children[index]||null);
      if(headsLayer.children[index]!==item.head)headsLayer.insertBefore(item.head,headsLayer.children[index]||null);
      position(item.cut,stemMatrix,animate);position(item.head,headMatrix,animate);
      if(added===stem.id && from && !reduced.matches && item.head.animate){
        const delay=fly(from,placed);
        item.head.animate([{opacity:0},{opacity:1}],{duration:240,delay,fill:'backwards'});
      }
    }
  }

  function drawWrap(fold=false) {
    if(!bouquet.wrapped) {
      tissueSlot.replaceChildren();wrapSlot.replaceChildren();
      stemsLayer.removeAttribute('clip-path'); return;
    }
    const art=makeWrap(prefix,bouquet.wrap,escape(recipient));
    tissueSlot.innerHTML=art.back;wrapSlot.innerHTML=art.front;
    if(config.bouquetMessage){
      const note=document.createElementNS(SVG_NS,'text');
      for(const [key,value] of Object.entries({x:'160',y:'328','text-anchor':'middle','font-size':'8.4','font-family':'Georgia, serif','font-style':'italic',fill:'#655840'})) note.setAttribute(key,value);
      note.textContent=config.bouquetMessage;
      wrapSlot.append(note);
    }
    wrapSlot.classList.toggle('bq-folding',fold);
    stemsLayer.setAttribute('clip-path',`url(#${prefix}-tucked)`);
    for(const kind of Object.keys(wrapChoices)){
      root.querySelectorAll('[data-'+kind+']').forEach(control=>{
        control.setAttribute('aria-pressed',String(control.dataset[kind]===bouquet.wrap[kind]));
      });
      $('[data-selected="'+kind+'"]').textContent=wrapChoices[kind][bouquet.wrap[kind]].name;
    }
  }

  function render({added,from,fold=false}={}) {
    const {wrapped,stems}=bouquet;
    drawStems(added,from);drawWrap(fold);
    $('.bq-empty').setAttribute('opacity',stems.length?0:1);
    const count=stems.length+' '+(stems.length===1?'stem':'stems');
    sheet.setAttribute('aria-label',stems.length?(wrapped?'Wrapped bouquet':'Bouquet')+' with '+count:'A pencil study on flower-press paper');
    root.classList.toggle('is-wrapped',wrapped);
    const heading=wrapped?'Dress your <em>bouquet.</em>':'Pick your <em>flowers.</em>';
    if($('.bq-title').innerHTML!==heading)$('.bq-title').innerHTML=heading;
    $('.bq-description').textContent=wrapped?'Pick a paper, a print and a ribbon.':'Tap to add a stem. Ek daisy aur bhi le lo :3';
    $('.bq-tray').hidden=wrapped;$('.bq-tools').hidden=wrapped;$('.bq-trims').hidden=!wrapped;
    $('[data-bq-action="wrap"]').hidden=wrapped;
    for(const key of ['edit','next','save'])$('[data-bq-action="'+key+'"]').hidden=!wrapped;
    $('[data-bq-action="wrap"]').disabled=!stems.length;
    $('[data-bq-action="undo"]').disabled=!stems.length;
    $('[data-bq-action="arrange"]').disabled=stems.length<2;
    const quantities=new Map();
    stems.forEach(({type})=>quantities.set(type,(quantities.get(type)||0)+1));
    root.querySelectorAll('[data-flower]').forEach(button=>{
      const quantity=quantities.get(button.dataset.flower)||0;
      button.disabled=stems.length>=LIMIT;
      button.querySelector('.bq-quantity').textContent=quantity?String(quantity):'+';
      button.classList.toggle('bq-has-flower',quantity>0);
    });
    $('.bq-count').textContent=count;
  }

  async function save() {
    if (saving || !bouquet.wrapped) return;
    saving = true;
    const saveButton = $('[data-bq-action="save"]');
    saveButton.disabled = true;
    let sourceUrl;
    try {
      // A self-contained SVG can be rasterized without fonts, network requests, or tainted canvases.
      const copy = sheet.cloneNode(true);
      copy.removeAttribute('class');
      copy.querySelector('.bq-empty')?.remove();
      const used=new Set(bouquet.stems.map(stem=>flowerId(prefix,stem.type,stem.id%2)));
      copy.querySelectorAll('[id^="'+prefix+'-cut-"]').forEach(node=>{if(!used.has(node.id))node.remove();});
      copy.setAttribute('width','960'); copy.setAttribute('height','1050');
      const svg = new XMLSerializer().serializeToString(copy);
      sourceUrl = URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
      const image = new Image();
      await new Promise((resolve,reject) => {
        image.onload = resolve; image.onerror = reject; image.src = sourceUrl;
      });
      if (disposed) return;
      const canvas = document.createElement('canvas');
      canvas.width = 960; canvas.height = 1050;
      canvas.getContext('2d').drawImage(image,0,0,960,1050);
      const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
      if (!blob || disposed) return;
      const fileUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl; a.download = `Flowers for ${recipient}.png`; a.target = '_blank'; a.rel = 'noopener';
      document.body.append(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 30_000);
      onSound('save');
      speak('Your bouquet PNG is ready.');
    } catch {
      speak('You can also keep your flowers with a screenshot.');
      $('.bq-description').textContent = 'A screenshot will keep your flowers too :3';
    } finally {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      saving = false;
      if (!disposed) saveButton.disabled = false;
    }
  }

  function click(event) {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.dataset.flower && !bouquet.wrapped && bouquet.stems.length < LIMIT) {
      const type = button.dataset.flower;
      const id = bouquet.nextId++;
      bouquet.stems.push({id,type,seed: 71 * id + 13});
      onSound('flower');
      render({added:id, from:button});
      speak(`${choices.find(f => f.type === type).name} added. ${$('.bq-count').textContent}.`);
      return;
    }
    for(const kind of Object.keys(wrapChoices)){
      const option=button.dataset[kind];
      if(bouquet.wrapped && option && wrapChoices[kind][option]){
        if(bouquet.wrap[kind]!==option){
          bouquet.wrap[kind]=option; drawWrap(); onSound(kind);
          speak(wrapChoices[kind][option].name+' selected.');
        }
        return;
      }
    }
    switch (button.dataset.bqAction) {
      case 'undo': bouquet.stems.pop(); render(); onSound('undo'); speak('Last flower removed. ' + $('.bq-count').textContent + '.'); break;
      case 'arrange': bouquet.arrangement++; render(); onSound('arrange'); speak('Flowers rearranged.'); break;
      case 'wrap':
        bouquet.wrapped = true; render({fold:true}); onSound('wrap'); root.scrollTop=0; $('.bq-title').focus({preventScroll: true}); speak('Choose your paper, print and ribbon.'); break;
      case 'edit':
        bouquet.wrapped = false; render(); onSound('unwrap'); root.scrollTop=0; $('.bq-title').focus({preventScroll: true}); break;
      case 'save': void save(); break;
      case 'next': onNext?.(); break;
    }
  }

  root.addEventListener('click',click);
  render();
  return () => {
    disposed = true;
    root.removeEventListener('click',click);
    for (const float of flyers) { float.getAnimations?.().forEach(a => a.cancel()); float.remove(); }
    flyers.clear();
    movements.forEach(tween=>tween.cancel());movements.clear();
    root.remove();
  };
}
