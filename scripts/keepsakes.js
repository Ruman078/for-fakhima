import { botanicalDefs, sprig } from './botany.js';
import { berryCluster, strawberryGardenDefs, strawberryBackdrop } from './strawberry-garden.js';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const escapeText = (value) => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function bloomStamp() {
  const petals = Array.from({ length: 13 }, (_, i) =>
    `<path transform="rotate(${i * 360 / 13})" d="M0 -3C-4 -8 -4 -14 -.5 -17C3 -16 4 -10 0 -3Z"/>`).join('');
  return `<svg viewBox="-23 -23 46 46" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true">${petals}<circle r="3.2"/><circle r="21" stroke-width=".65" stroke-dasharray="1 4"/></svg>`;
}

function petalSpray() {
  let flowers = '';
  for (const [x, y, scale] of [[27,18,1],[61,9,.7],[79,29,.75]]) {
    flowers += `<g transform="translate(${x} ${y}) scale(${scale})">`;
    for (let i = 0; i < 12; i++) {
      flowers += `<path transform="rotate(${i * 30})" d="M0 -2Q-3 -6 0 -10Q3 -7 0 -2Z"/>`;
    }
    flowers += '<circle r="1.9"/></g>';
  }
  return `<svg viewBox="0 0 100 97" fill="none" stroke="currentColor" stroke-width=".9" aria-hidden="true"><path d="M44 95Q49 58 27 18M46 81Q45 43 61 9M46 80Q60 57 79 29M46 72Q31 53 20 49Q23 61 46 72ZM48 67Q61 44 70 43Q66 55 48 67ZM42 56Q31 41 30 32Q41 39 42 56Z"/>${flowers}</svg>`;
}

const arrow = '<svg class="ks-arrow" viewBox="0 0 24 12" width="24" height="12" aria-hidden="true"><path d="M1 6h20m-5-4.5L21 6l-5 4.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function mountLetter(host, { onNext, config, onSound }) {
  const scene = document.createElement('section');
  scene.className = 'ks-letter ks-scene';
  scene.dataset.open = 'false';
  scene.setAttribute('aria-labelledby', 'ks-letter-heading');
  scene.innerHTML = `
    <h2 id="ks-letter-heading" class="ks-heading">A little <i>letter.</i></h2>
    <div class="ks-mailstage">
      <button class="ks-envelope-button" aria-label="Open the letter for ${escapeText(config.recipient)}">
        <span class="ks-envelope" aria-hidden="true">
          <span class="ks-envelope-lining"></span>
          <span class="ks-preview-slip"><span>${escapeText(config.letter[0])}</span></span>
          <span class="ks-pocket"><svg viewBox="0 0 320 200" preserveAspectRatio="none"><path d="M0 200L142 90Q160 77 179 91L320 200Z" fill="#f6edda" opacity=".13"/><path d="M-2 201L134 95M322 201L184 94" fill="none" stroke="#a3957b" stroke-width=".8"/><path d="M0 201L134 96M320 201L184 95" fill="none" stroke="#f4ead1" stroke-width=".9"/></svg></span>
          <span class="ks-front-spray">${petalSpray()}</span>
          <span class="ks-to">For <i>${escapeText(config.recipient)}</i></span>
          <span class="ks-flap"><span class="ks-flap-face"></span><span class="ks-wax">${bloomStamp()}</span></span>
        </span>
      </button>
      <article class="ks-paper" tabindex="-1" aria-label="Birthday letter" aria-hidden="true" inert>
        <div class="ks-paper-inner">
          <div class="ks-letter-flower">${petalSpray()}</div>
          ${config.letter.map((paragraph, i) => `<p${i === 0 ? ' class="ks-salutation"' : ''}>${escapeText(paragraph)}</p>`).join('')}
        </div>
      </article>
    </div>
    <div class="ks-letter-actions">
      <button type="button" class="ks-action ks-open">Open the seal ${arrow}</button>
      <button type="button" class="ks-back" hidden>Fold it back</button>
      <button type="button" class="ks-action ks-next" hidden>Explore the garden ${arrow}</button>
    </div>`;
  host.replaceChildren(scene);
  const envelope = scene.querySelector('.ks-envelope-button');
  const article = scene.querySelector('.ks-paper');
  const openButton = scene.querySelector('.ks-open');
  const closeButton = scene.querySelector('.ks-back');
  const nextButton = scene.querySelector('.ks-next');
  const setOpen = open => {
    onSound?.(open ? 'letterOpen' : 'letterFold');
    scene.classList.toggle('ks-refolding', !open && !reducedMotion());
    scene.dataset.open = String(open);
    openButton.hidden = open;
    closeButton.hidden = !open;
    nextButton.hidden = !open;
    envelope.disabled = open;
    envelope.setAttribute('aria-hidden', String(open));
    article.toggleAttribute('inert', !open);
    article.setAttribute('aria-hidden', String(!open));
    if (open) {
      article.scrollTop = 0;
      article.focus({ preventScroll: true });
    } else {
      openButton.focus({ preventScroll: true });
    }
  };
  envelope.onclick = openButton.onclick = () => setOpen(true);
  closeButton.onclick = () => setOpen(false);
  nextButton.onclick = () => onNext();
  return () => scene.remove();
}

// Positions identify the part of each drawing a visitor can touch, in proportion
// to the bed. The botanical stems and ground extend beyond these points.
const finds = [
  { key: 'lily', label: 'Open the ivory lily bud', x: .07, y: .36 },
  { key: 'daisy', label: 'Touch the daisy', x: .32, y: .28 },
  { key: 'bug', label: 'Visit the ladybug on the sage', x: .06, y: .66, angle:43 },
  { key: 'butterfly', label: 'Greet the butterfly', x: .86, y: .05 },
  { key: 'stars', label: 'Join the stars', x: .17, y: .05 },
  { key: 'chain', label: 'Lift the gajra on the flower stake', x: .53, y: .48 },
  { key: 'lavender', label: 'Brush the lavender', x: .72, y: .29 },
  { key: 'blush', label: 'Touch the pink lily', x: .94, y: .44 },
  { key: 'fern', label: 'Uncurl the fern', x: .96, y: .87 },
  { key: 'gift', label: 'Open the present on the path', x: .40, y: .88 },
  { key: 'bug-clover', label: 'Visit the ladybug by the daisies', x: .30, y: .52, angle:-61 },
  { key: 'bug-path', label: 'Visit the ladybug beside the path', x: .58, y: .69, angle:105 },
  { key: 'bug-berry', label: 'Visit the ladybug in the strawberry leaves', x: .16, y: .89, angle:-119 },
  { key: 'strawberry', label: 'Pick a ripe strawberry', x: .80, y: .69 }
];

function butterfly() {
  const wing = '<path d="M0 1C-8 -13 -26 -26 -28 -22C-33 -12 -23 4 -8 7C-21 7 -22 17 -16 20C-8 20 -3 13 0 5Z" fill="url(#ks-wing)" stroke="#675032" stroke-width="1.3"/><path d="M-2 2Q-15 -13 -26 -20M-2 4Q-18 -6 -28 -11M-3 5Q-18 -1 -24 -3M-3 7Q-12 12 -17 16" fill="none" stroke="#795c45" stroke-width="1.1"/><g fill="#ffeabb"><circle cx="-24" cy="-17" r="1.3"/><circle cx="-26" cy="-12" r="1.4"/><circle cx="-24" cy="-7" r="1.2"/><circle cx="-16" cy="16" r="1.3"/></g>';
  return `<g transform="rotate(-25) scale(.85 .78)"><g class="ks-flight"><g class="ks-wing-left">${wing}</g><g transform="scale(-.73 .95) skewY(12)"><g class="ks-wing-right">${wing}</g></g><path d="M0 11Q-3 2 -.5 -5Q1 -9 2 -5Q4 1 0 11Z" fill="#382f27"/><path d="M0 -5Q-3 -13 -5 -13M1 -5Q5 -14 7 -12" fill="none" stroke="#e2bd86" stroke-width=".8"/></g></g>`;
}

function ladybug(key, angle) {
  const mirrored=key==='bug-path' || key==='bug-berry'?-1:1;
  const scale={bug:.91,'bug-clover':.77,'bug-path':.82,'bug-berry':.86}[key];
  const leaf=key==='bug-berry' || key==='bug-clover'
    ? '<g transform="translate(-12 18) rotate(30) scale(1.35)"><use href="#ks-leaf-fan" xlink:href="#ks-leaf-fan"/></g>'
    : '<path d="M-29 16Q-22 -2 -5 -6T21 -13Q14 5 -1 11T-29 16Z" fill="url(#ks-leaf)" stroke="#718568" stroke-width=".65"/><path d="M-28 16Q-13 6 19 -12M-19 11q1-4 4-9m4 4q2-5 6-8M2 0l7-7m-17 12q7 1 12-3" fill="none" stroke="#b3ba8b" opacity=".64" stroke-width=".65"/>';
  return `<g transform="scale(${mirrored} 1)"><path d="M-41 54Q-34 32-27 17Q-9 6 1 -1" fill="none" stroke="#76896b" stroke-width="1.2"/>${leaf}</g>
    <g class="ks-bug-travel"><g class="ks-beetle-breeze"><ellipse cx="1.5" cy="2.3" rx="${scale*8.9}" ry="${scale*6.5}" fill="#1d3127" opacity=".55"/><g transform="rotate(${angle}) scale(${scale})"><g stroke="#2a3027" stroke-width="1.13" fill="none"><path d="M-6 -3l-3 -3 -2 -.2m5 6l-4 1 -1.2 1m6 1.8l-2.5 3.7 -2 1M6 -3l3 -3 2 1M6 0l4 1 1 .8M5 4l2 3.4 2.2 1.1"/></g><ellipse cy="-6.4" rx="5.4" ry="5.3" fill="#252b25"/><path d="M-4.9 -7.3q0 -2.5 2.2 -2.4l.7 1.8zm9.7 0q0 -2.5 -2.1 -2.4l-.6 1.9z" fill="#d6c7a7"/><ellipse rx="7.6" ry="9.1" fill="url(#ks-bug-shell)" stroke="#493a2c" stroke-width=".58"/><path d="M0 -8.5Q1 0 .2 8.9" stroke="#533b2c" fill="none" stroke-width=".7"/><g fill="#342e28"><ellipse cy="-7.4" rx="1.8" ry="1.1"/><circle cx="-3.4" cy="-2.8" r="1.65"/><circle cx="3.1" cy="-2.4" r="1.7"/><circle cx="-3.2" cy="4" r="1.25"/><circle cx="3.6" cy="4.2" r="1.5"/></g><path d="M-5.6 -.9Q-6.3 -3.7 -3.6 -6" fill="none" stroke="#f9c3a1" opacity=".68" stroke-width=".92"/></g></g></g>`;
}

function constellation() {
  const points = [[-27,5],[-14,-10],[1,-5],[13,-17],[29,-11]];
  return `<path class="ks-constellation" d="M-27 5L-14 -10L1 -5L13 -17L29 -11" pathLength="1"/>${points.map(([x,y],i) => `<g transform="translate(${x} ${y})"><path d="M0 -${i % 2 ? 4 : 5}Q.5 -1 3 0Q.5 .5 0 5Q-.5 .5 -3 0Q-.5 -.5 0 -${i % 2 ? 4 : 5}" fill="#f7e6b9"/><circle r="6" fill="#eed8a0" opacity=".07"/></g>`).join('')}`;
}

function jasmineChain() {
  let buds = '';
  for (let i = 0; i < 21; i++) {
    const a = i / 21 * Math.PI * 2;
    const x = 19 * Math.cos(a) + 2.8 * Math.sin(a * 2);
    const y = 14 * Math.sin(a) + 2 * Math.sin(2 * a);
    buds += `<g class="ks-jasmine" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${Math.round(a*57)+20})"><use href="#ks-jasmine-bud" xlink:href="#ks-jasmine-bud"/></g>`;
  }
  return `<path d="M-9 55L-6 -19Q-5 -29 2 -26Q7 -22 2 -19" fill="none" stroke="#474e3b" stroke-width="3"/><path d="M-8 55l3-73q0-9 6-8" fill="none" stroke="#b6a27b" stroke-width="1.1"/><g class="ks-garland"><path d="M-19 -3C-39 2 -30 21 -48 18M-20 -1Q-27 10 -40 8" stroke="#a98b5f" fill="none" stroke-width="1.2"/>${buds}</g>`;
}

function wrappedGift() {
  const wicker=Array.from({length:12},(_,i)=>`M${i*3.9-24} 9l${(5.5-i)*.65} 10`).join(' ');
  return `<ellipse cx="1" cy="21" rx="35" ry="7" fill="url(#ks-ground-moss)"/><path d="M-25 10Q-25 -21 1 -25Q23 -24 23 10" fill="none" stroke="#645b40" stroke-width="3.8"/><path d="M-25 10Q-24 -20 1 -24Q22 -23 23 9" fill="none" stroke="#b4a07a" stroke-width="1.6" stroke-dasharray="3 .9"/>
    <g transform="rotate(-7)"><path d="M-16 -4L17 -4L16 15L-15 16Z" fill="#ba9479" stroke="#886c56"/><path d="M-13 -2L-12 12L13 12" stroke="#dfbc9c" fill="none"/><path d="M-3 -5h5v21h-5Z" fill="#7c453b"/><g class="ks-lid"><path d="M-19 -9L18 -10L19 -3L-19 -2Z" fill="#d5b492" stroke="#8e705b"/><path d="M-3 -9h5v7h-5Z" fill="#915548"/><path d="M0 -10C-20 -13 -14 -24 -8 -19Q-2 -16 0 -10ZM1 -10C5 -23 19 -24 14 -16Q10 -10 1 -10Z" fill="none" stroke="#c98b76" stroke-width="2"/></g></g>
    <path d="M-27 8Q-2 13 26 7L21 18Q1 24 -20 19Z" fill="#968663" stroke="#5a5843"/><path d="${wicker}" fill="none" stroke="#c0b08a" stroke-width="1.05"/><path d="M-27 8Q-2 13 26 7M-24 13Q0 19 23 12m-44 5q20 5 41-1" fill="none" stroke="#665e46" stroke-width="1.4" stroke-linecap="round"/>`;
}

function pollen() {
  return Array.from({length: 8}, (_, i) => {
    const angle = (i / 8 * Math.PI * 1.5) - Math.PI * 1.2;
    const dx = (Math.cos(angle) * (15 + i)).toFixed(1);
    const dy = (Math.sin(angle) * 15 - 17).toFixed(1);
    return `<circle class="ks-pollen" r="${i%3 ? .95 : 1.25}" fill="#e7c477" style="--ks-dx:${dx}px;--ks-dy:${dy}px;--ks-delay:${i*34}ms"/>`;
  }).join('');
}

function rootedPlant(type, scale, seed) {
  const tilt = { daisy: -8, lavender: 7, 'pink-lily': 12, 'white-lily': -7, bud: -7 }[type];
  return `<g transform="rotate(${tilt}) scale(${scale}) translate(0 160)">${sprig(type, { prefix: 'ks-bot', seed, detail: true })}</g>`;
}

function objectArt({key,angle}, scale) {
  if (key === 'stars') return constellation();
  if (key === 'butterfly') return butterfly();
  if (key.startsWith('bug')) return ladybug(key,angle);
  if (key === 'strawberry') return berryCluster();
  if (key === 'chain') return jasmineChain();
  if (key === 'gift') return wrappedGift();
  if (key === 'lily') return `<g class="ks-closed-bud">${rootedPlant('bud', scale, 19)}</g><g class="ks-open-lily">${rootedPlant('white-lily',scale,19)}</g>`;
  if (key === 'fern') return `<g class="ks-frond" transform="rotate(20) scale(${scale * .86}) translate(0 108)">${sprig('fern',{prefix:'ks-bot',seed:24,detail:false})}</g><g transform="translate(-13 30)"><g class="ks-new-sprouts"><path d="M0 0Q-1 -13 -10 -21M2 1Q4 -8 11 -12" fill="none" stroke="#8c9d76" stroke-width=".9"/><use href="#ks-jasmine-bud" xlink:href="#ks-jasmine-bud" transform="translate(-10 -21) scale(.55)"/><use href="#ks-jasmine-bud" xlink:href="#ks-jasmine-bud" transform="translate(11 -12) scale(.45)"/></g></g>`;
  const type = { daisy:'daisy', lavender:'lavender', blush:'pink-lily' }[key];
  return `<g class="ks-live-flower">${rootedPlant(type,scale,41 + key.length)}</g>${key==='daisy'?pollen():''}`;
}

function stageDefs() {
  return `${botanicalDefs('ks-bot')}<defs>
    <linearGradient id="ks-wing" x2=".7" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#e3c7a1"/><stop offset=".5" stop-color="#cc9b83"/><stop offset="1" stop-color="#9a765e"/></linearGradient>
    <linearGradient id="ks-leaf" x2="0" y2="1"><stop stop-color="#84987a"/><stop offset="1" stop-color="#3e6255"/></linearGradient>
    <radialGradient id="ks-bug-shell" cx=".28" cy=".26" r=".86"><stop stop-color="#ffa983"/><stop offset=".45" stop-color="#dc7358"/><stop offset="1" stop-color="#a04d3e"/></radialGradient>
    <g id="ks-jasmine-bud" fill="#ebe2c5" stroke="#a5a081" stroke-width=".65"><path d="M0 4Q-7 1 -6 -5Q-2 -6 0 -2Q2 -9 5 -6Q7 -1 0 4Z"/><path d="M0 4Q-2 0 -4 -2M0 3L3 -4" fill="none"/><circle cy="3" r="1.5" fill="#a0a582"/></g>
  </defs>`;
}

function animateFind(key, group, reduced) {
  if (reduced || !group.animate) return;
  const motion = {
    butterfly: ['.ks-flight', ['translate(0,0) rotate(0)', 'translate(-17px,-13px) rotate(-11deg)', 'translate(8px,-20px) rotate(8deg)', 'translate(0,0) rotate(0)'], 1650],
    bug: ['.ks-bug-travel', ['translate(0,0)', 'translate(10px,-5px) rotate(-7deg)', 'translate(15px,-9px)', 'translate(0,0)'], 1950],
    chain: ['.ks-garland', ['rotate(0)', 'translateY(-8px) rotate(-12deg)', 'translateY(-3px) rotate(7deg)', 'rotate(0)'], 1150],
    fern: ['.ks-icon', ['scale(1)', 'rotate(-11deg) scale(.96,1.1)', 'rotate(4deg) scale(1.04,1.02)', 'scale(1)'], 1150],
    gift: ['.ks-lid', ['translateY(0)', 'translateY(-9px) rotate(9deg)', 'translateY(-6px) rotate(5deg)', 'translateY(0)'], 1150],
    daisy: ['.ks-live-flower', ['rotate(0)', 'rotate(-7deg)', 'rotate(3deg)', 'rotate(0)'], 1000],
    blush: ['.ks-live-flower', ['scale(1)', 'scale(1.07,.98)', 'scale(1.02,1.03)', 'scale(1)'], 1050],
    lavender: ['.ks-live-flower', ['rotate(0)', 'rotate(8deg)', 'rotate(-5deg)', 'rotate(2deg)', 'rotate(0)'], 1350],
    strawberry: ['.ks-berries', ['rotate(0)', 'translate(1px,-5px) rotate(-10deg)', 'rotate(4deg)', 'rotate(0)'], 1050]
  }[key.startsWith('bug')?'bug':key];
  if (motion) {
    const [selector, poses, duration] = motion;
    const el = group.querySelector(selector);
    el.getAnimations().forEach(animation => animation.cancel());
    el.animate(poses.map(transform=>({transform})), { duration, easing:'cubic-bezier(.32,.04,.28,1)' });
  }
}

export function mountDiscoveries(host, { onNext, config, onSound, foundNotes: found = new Set() }) {
  const scene = document.createElement('section');
  scene.className = 'ks-discover ks-scene';
  scene.setAttribute('aria-labelledby','ks-discovery-heading');
  scene.innerHTML = `
    <h2 id="ks-discovery-heading" class="ks-heading">Little <i>surprises.</i></h2>
    <div class="ks-bed"></div>
    <div class="ks-garden-foot">
      <div class="ks-noteslot" aria-live="polite" aria-atomic="true"><p class="ks-discovery-hint">Tap a flower, a strawberry or a ladybug.</p></div>
      <div class="ks-discovery-actions"><span class="ks-count">${found.size} of ${finds.length} found</span><button type="button" class="ks-action">To the finale ${arrow}</button></div>
    </div>`;
  host.replaceChildren(scene);
  const bed = scene.querySelector('.ks-bed');
  const slot = scene.querySelector('.ks-noteslot');
  const count = scene.querySelector('.ks-count');
  let selected = '';
  let width = 0;
  let height = 0;
  let prints=[];
  const clearPrints=()=>{
    prints.forEach(url=>URL.revokeObjectURL(url));
    prints=[];
  };
  const draw = () => {
    const w = Math.round(bed.clientWidth);
    const h = Math.round(bed.clientHeight);
    if (!w || !h || (w === width && h === height)) return;
    const focused = bed.contains(document.activeElement) ? document.activeElement.dataset.key : null;
    width = w;
    height = h;
    // Scaling the engraving independently from the hit rectangles preserves
    // a fingertip-sized target even on the smallest portrait viewport.
    const size = Math.min(1.49, Math.max(.88, Math.min(width / 540,height / 315)));
    const plant = Math.min(.9, (height * .36) / (160 * size));
    const {background,layers,patch}=strawberryBackdrop(width,height);
    // The still plants share three prints. Moving a ladybug or flower then
    // repaints only its own mark and the cached images below it.
    clearPrints();
    const defs=botanicalDefs('ks-bot')+strawberryGardenDefs();
    const bands=[{y:-1,art:background},{y:height*.67,art:''},{y:height*.91,art:''}];
    layers.push({y:height*.92,art:patch.plants});
    for(const layer of layers.sort((a,b)=>a.y-b.y)){
      const band=layer.y<height*.63?0:layer.y<height*.86?1:2;
      bands[band].art+=layer.art;
    }
    const bedLayers=bands.map(({y,art})=>{
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}${art}</svg>`;
      const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
      prints.push(url);
      return {y,art:`<image href="${url}" xlink:href="${url}" width="${width}" height="${height}" aria-hidden="true" pointer-events="none"/>`};
    });
    bedLayers.push({y:height*.92,art:`<g aria-hidden="true">${patch.berries}</g>`});
    const controls=[];
    const objects = finds.map(find=>{
      const {key,label,x,y}=find;
      const px=25+(width-50)*x,py=24+(height-68)*y;
      const root=key.startsWith('bug')?53:{lily:plant*160,daisy:plant*160,lavender:plant*160,blush:plant*160,fern:plant*93,chain:55,strawberry:64,gift:25}[key]||0;
      const transform=`translate(${px.toFixed(1)} ${py.toFixed(1)})`;
      const state=(found.has(key)?' ks-found':'')+(selected===key?' ks-selected':'');
      controls.push(`<g class="ks-object${state}" transform="${transform}" data-key="${key}" role="button" tabindex="0" focusable="true" aria-label="${label}${found.has(key)?', note found':''}">
        <path class="ks-found-glint" d="M16 8Q16.5 11 19 12Q16.5 12.6 16 16Q15.4 12.8 13 12Q15.3 11 16 8Z" aria-hidden="true"/>
        <circle class="ks-focus-ring" r="23"/>
        <rect x="-23" y="-23" width="46" height="46" fill="transparent"/>
      </g>`);
      return {y:py+root*size,art:`<g class="ks-specimen${state}" data-specimen="${key}" transform="${transform} scale(${size})" aria-hidden="true"><g class="ks-icon"><g class="ks-stem-breeze">${objectArt(find,plant)}</g></g></g>`};
    });
    const planted=bedLayers.concat(objects).sort((a,b)=>a.y-b.y).map(layer=>layer.art).join('');
    bed.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 ${width} ${height}" aria-label="A strawberry garden with ${finds.length} hidden birthday notes" role="group">${stageDefs()}${strawberryGardenDefs(false)}${planted}<rect x="0" y="${height-29}" width="${width}" height="30" fill="url(#ks-footer-shade)" pointer-events="none"/>${controls.join('')}</svg>`;
    if (focused) bed.querySelector(`[data-key="${focused}"]`)?.focus({ preventScroll:true });
  };
  const discover = group => {
    const key = group.dataset.key;
    const index = finds.findIndex(f => f.key === key);
    if (index < 0) return;
    onSound?.(key.startsWith('bug')?'bug':key);
    found.add(key);
    selected = key;
    bed.querySelectorAll('.ks-selected').forEach(el=>el.classList.remove('ks-selected'));
    group.classList.add('ks-found','ks-selected');
    const specimen=bed.querySelector(`[data-specimen="${key}"]`);
    specimen.classList.add('ks-found','ks-selected');
    group.setAttribute('aria-label', `${finds[index].label}, note found`);
    animateFind(key,specimen,reducedMotion());
    if (key === 'stars' && !reducedMotion()) {
      const stars = specimen.querySelector('.ks-constellation');
      if (stars.animate) {
        stars.getAnimations().forEach(animation => animation.cancel());
        stars.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:800,easing:'ease-out'});
      }
    }
    const note = document.createElement('p');
    note.className = 'ks-tag';
    note.textContent = config.surprises[index];
    slot.replaceChildren(note);
    count.textContent = `${found.size} of ${finds.length} found`;
  };
  bed.onclick = event => {
    const group = event.target.closest('.ks-object');
    const specimen=event.target.closest('[data-specimen]');
    if(group) discover(group);
    else if(specimen) discover(bed.querySelector(`[data-key="${specimen.dataset.specimen}"]`));
    else if(event.target.closest('[data-fruit]')) discover(bed.querySelector('[data-key="strawberry"]'));
  };
  bed.onkeydown = event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const group = event.target.closest('.ks-object');
    if(group) { event.preventDefault(); discover(group); }
  };
  scene.querySelector('.ks-action').onclick = () => onNext();
  draw();
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(draw) : null;
  if (observer) observer.observe(bed);
  else window.addEventListener('resize',draw);
  return () => {
    observer?.disconnect();
    window.removeEventListener('resize',draw);
    scene.remove();
    clearPrints();
  };
}
