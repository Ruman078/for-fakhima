import { botanicalDefs, sprig } from './botany.js';

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

export function mountLetter(host, { onNext, config }) {
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
  { key: 'lily', label: 'Open the ivory lily bud', x: .10, y: .48 },
  { key: 'daisy', label: 'Touch the daisy', x: .35, y: .33 },
  { key: 'bug', label: 'Visit the ladybug', x: .21, y: .74 },
  { key: 'butterfly', label: 'Greet the butterfly', x: .77, y: .15 },
  { key: 'stars', label: 'Join the stars', x: .18, y: .16 },
  { key: 'chain', label: 'Lift the gajra', x: .53, y: .66 },
  { key: 'lavender', label: 'Brush the lavender', x: .59, y: .35 },
  { key: 'blush', label: 'Touch the pink lily', x: .87, y: .51 },
  { key: 'fern', label: 'Uncurl the fern', x: .77, y: .80 },
  { key: 'gift', label: 'Open the little gift', x: .39, y: .87 }
];

function butterfly() {
  const wing = '<path d="M0 1C-8 -13 -26 -26 -28 -22C-33 -12 -23 4 -8 7C-21 7 -22 17 -16 20C-8 20 -3 13 0 5Z" fill="url(#ks-wing)" stroke="#675032" stroke-width="1.3"/><path d="M-2 2Q-15 -13 -26 -20M-2 4Q-18 -6 -28 -11M-3 5Q-18 -1 -24 -3M-3 7Q-12 12 -17 16" fill="none" stroke="#795c45" stroke-width="1.1"/><g fill="#ffeabb"><circle cx="-24" cy="-17" r="1.3"/><circle cx="-26" cy="-12" r="1.4"/><circle cx="-24" cy="-7" r="1.2"/><circle cx="-16" cy="16" r="1.3"/></g>';
  return `<g transform="rotate(-14)"><g class="ks-flight"><g class="ks-wing-left">${wing}</g><g transform="scale(-1 1)"><g class="ks-wing-right">${wing}</g></g><path d="M0 11Q-3 2 -.5 -5Q1 -9 2 -5Q4 1 0 11Z" fill="#382f27"/><path d="M0 -5Q-3 -13 -5 -13M1 -5Q5 -14 7 -12" fill="none" stroke="#e2bd86" stroke-width=".8"/></g></g>`;
}

function ladybug() {
  return `<path d="M-47 30Q-30 -6 30 -15Q26 20 -23 25Q-38 26 -47 30Z" fill="url(#ks-leaf)" stroke="#96a282" stroke-width=".8"/><path d="M-58 38Q-30 18 26 -12M-30 21l7 -13M-17 15l9 -14M-5 9L9 -4M-20 17l15 3M-2 7l16 2" fill="none" stroke="#c2bf8d" opacity=".7" stroke-width=".8"/>
    <g class="ks-bug-travel"><g transform="rotate(53)"><g stroke="#292b23" stroke-width="1.8" fill="none"><path d="M-6 -3l-4 -3m4 6l-5 1m6 3l-4 4M6 -3l4 -3M6 0l5 1M5 4l4 4"/></g><ellipse cy="-5" rx="5.5" ry="6.8" fill="#282b26"/><ellipse rx="7.2" ry="9.3" fill="#c66747" stroke="#3a3028"/><path d="M0 -8.5Q1 0 0 9" stroke="#47362b" fill="none"/><g fill="#372f29"><circle cx="-3.5" cy="-3" r="1.65"/><circle cx="3.3" cy="-2" r="1.8"/><circle cx="-3" cy="3.8" r="1.5"/><circle cx="3.5" cy="4.5" r="1.4"/></g><path d="M-5 -3Q-5 -6 -3.5 -6.5" fill="none" stroke="#efb89b" stroke-width="1.2"/></g></g>`;
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
  return `<g class="ks-garland"><path d="M-19 -3C-39 2 -30 21 -48 18M-20 -1Q-27 10 -40 8" stroke="#a98b5f" fill="none" stroke-width="1.2"/>${buds}</g>`;
}

function wrappedGift() {
  return `<g transform="rotate(-7)"><path d="M-16 -4L17 -4L16 15L-15 16Z" fill="#ba9479" stroke="#886c56"/><path d="M-13 -2L-12 12L13 12" stroke="#dfbc9c" fill="none"/><path d="M-3 -5h5v21h-5Z" fill="#7c453b"/><g class="ks-lid"><path d="M-19 -9L18 -10L19 -3L-19 -2Z" fill="#d5b492" stroke="#8e705b"/><path d="M-3 -9h5v7h-5Z" fill="#915548"/><path d="M0 -10C-20 -13 -14 -24 -8 -19Q-2 -16 0 -10ZM1 -10C5 -23 19 -24 14 -16Q10 -10 1 -10Z" fill="none" stroke="#c98b76" stroke-width="2"/></g></g>`;
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

function objectArt(key, scale) {
  if (key === 'stars') return constellation();
  if (key === 'butterfly') return butterfly();
  if (key === 'bug') return ladybug();
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
    <radialGradient id="ks-soil" cx="50%" cy="50%" r="50%"><stop stop-color="#70755a" stop-opacity=".6"/><stop offset=".63" stop-color="#526353" stop-opacity=".35"/><stop offset="1" stop-color="#253f3b" stop-opacity="0"/></radialGradient>
    <g id="ks-jasmine-bud" fill="#ebe2c5" stroke="#a5a081" stroke-width=".65"><path d="M0 4Q-7 1 -6 -5Q-2 -6 0 -2Q2 -9 5 -6Q7 -1 0 4Z"/><path d="M0 4Q-2 0 -4 -2M0 3L3 -4" fill="none"/><circle cy="3" r="1.5" fill="#a0a582"/></g>
    <g id="ks-grass"><path d="M0 0Q-1 -13 -7 -20Q-4 -7 0 0ZM0 0Q2 -21 8 -27Q5 -13 0 0ZM0 0Q7 -13 14 -15Q7 -5 0 0Z" fill="currentColor"/></g>
  </defs>`;
}

function undergrowth(width,height) {
  let result = `<ellipse cx="${width*.5}" cy="${height*.70}" rx="${width*.57}" ry="${height*.37}" fill="url(#ks-soil)"/>`;
  // A twig resting against the stems gives the jasmine chain a place to hang.
  result += `<path d="M${width*.34} ${height*.94}Q${width*.43} ${height*.68} ${width*.58} ${height*.57}M${width*.46} ${height*.71}Q${width*.49} ${height*.62} ${width*.47} ${height*.55}M${width*.54} ${height*.60}Q${width*.59} ${height*.60} ${width*.61} ${height*.57}" stroke="#958e75" stroke-width="1.35" opacity=".7" fill="none"/>`;
  const layers = [[.66,'#607264'],[.79,'#71806a'],[.95,'#72836d']];
  layers.forEach(([base,color],layer) => {
    let line='';
    for(let i=0; i<=32; i++) {
      const x=width*i/32;
      const y=height*(base + .055*Math.sin(i*.27+layer) + .013*Math.sin(i*.72));
      line += `${i ? 'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      if(i>0 && i<32 && (i+layer)%2) {
        result += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${Math.round(15*Math.sin(i*2.3))}) scale(${(.31+layer*.09+.2*Math.abs(Math.sin(i))).toFixed(2)})" color="${color}" opacity=".45"><use href="#ks-grass" xlink:href="#ks-grass"/></g>`;
      }
    }
    result += `<path d="${line}" fill="none" stroke="${color}" opacity=".27" stroke-width=".75"/>`;
  });
  return result;
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
    lavender: ['.ks-live-flower', ['rotate(0)', 'rotate(8deg)', 'rotate(-5deg)', 'rotate(2deg)', 'rotate(0)'], 1350]
  }[key];
  if (motion) {
    const [selector, poses, duration] = motion;
    const el = group.querySelector(selector);
    el.getAnimations().forEach(animation => animation.cancel());
    el.animate(poses.map(transform=>({transform})), { duration, easing:'cubic-bezier(.32,.04,.28,1)' });
  }
}

export function mountDiscoveries(host, { onNext, config }) {
  const scene = document.createElement('section');
  scene.className = 'ks-discover ks-scene';
  scene.setAttribute('aria-labelledby','ks-discovery-heading');
  scene.innerHTML = `
    <h2 id="ks-discovery-heading" class="ks-heading">Little <i>surprises.</i></h2>
    <div class="ks-bed"></div>
    <div class="ks-noteslot" aria-live="polite" aria-atomic="true"><p class="ks-discovery-hint">Touch whatever catches your eye.</p></div>
    <div class="ks-discovery-actions"><span class="ks-count">0 of ${finds.length} found</span><button type="button" class="ks-action">To the finale ${arrow}</button></div>`;
  host.replaceChildren(scene);
  const bed = scene.querySelector('.ks-bed');
  const slot = scene.querySelector('.ks-noteslot');
  const count = scene.querySelector('.ks-count');
  const found = new Set();
  let selected = '';
  let width = 0;
  let height = 0;
  const draw = () => {
    const w = Math.round(bed.clientWidth);
    const h = Math.round(bed.clientHeight);
    if (!w || !h || (w === width && h === height)) return;
    const focused = bed.contains(document.activeElement) ? document.activeElement.dataset.key : null;
    width = w;
    height = h;
    // Scaling the engraving independently from the hit rectangles preserves
    // a fingertip-sized target even on the smallest portrait viewport.
    const size = Math.min(1.2, Math.max(.72, width / 535));
    const plant = Math.min(.75, (height * .46) / (160 * size));
    const objects = finds.map(({key,label,x,y}) => `
      <g class="ks-object${found.has(key)?' ks-found':''}${selected === key?' ks-selected':''}" transform="translate(${(width*x).toFixed(1)} ${(height*y).toFixed(1)})" data-key="${key}" role="button" tabindex="0" focusable="true" aria-label="${label}${found.has(key)?', note found':''}">
        <g transform="scale(${size})"><g class="ks-icon">${objectArt(key,plant)}</g></g>
        <path class="ks-found-glint" d="M16 8Q16.5 11 19 12Q16.5 12.6 16 16Q15.4 12.8 13 12Q15.3 11 16 8Z" aria-hidden="true"/>
        <circle class="ks-focus-ring" r="23"/>
        <rect x="-23" y="-23" width="46" height="46" fill="transparent"/>
      </g>`).join('');
    bed.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 ${width} ${height}" aria-label="A garden with ten hidden birthday notes" role="group">${stageDefs()}<g aria-hidden="true" pointer-events="none">${undergrowth(width,height)}</g>${objects}</svg>`;
    if (focused) bed.querySelector(`[data-key="${focused}"]`)?.focus({ preventScroll:true });
  };
  const discover = group => {
    const key = group.dataset.key;
    const index = finds.findIndex(f => f.key === key);
    if (index < 0) return;
    found.add(key);
    selected = key;
    bed.querySelector('.ks-selected')?.classList.remove('ks-selected');
    group.classList.add('ks-found','ks-selected');
    group.setAttribute('aria-label', `${finds[index].label}, note found`);
    animateFind(key,group,reducedMotion());
    if (key === 'stars' && !reducedMotion()) {
      const stars = group.querySelector('.ks-constellation');
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
    if(group) discover(group);
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
  };
}
