import { botanicalDefs, sprig } from './botany.js';
import { flowerArc } from './motion.js';

const FLOWERS = [
  { type: 'daisy', name: 'Daisy' },
  { type: 'white-lily', name: 'Ivory lily' },
  { type: 'pink-lily', name: 'Pink lily' },
  { type: 'lavender', name: 'Lavender' },
  { type: 'breath', name: "Baby’s breath" }
];
const LIMIT = 11;
const SVG_NS = 'http://www.w3.org/2000/svg';
const bouquet = { stems: [], nextId: 1, arrangement: 0, wrapped: false };
let mounts = 0;

export function resetBouquet() {
  bouquet.stems = [];
  bouquet.nextId = 1;
  bouquet.arrangement = 0;
  bouquet.wrapped = false;
}

const escape = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[c]));

const icons = {
  undo: '<path d="m8 4-5 5 5 5M4 9h9a5 5 0 0 1 0 10h-3"/>',
  arrange: '<path d="M3 7h3c5 0 7 10 12 10h3m-4-4 4 4-4 4M3 17h3c1.5 0 3.1-1.5 4.4-3.6M13.5 9.5C15 7.7 16.4 7 18 7h3m-4-4 4 4-4 4"/>',
  arrow: '<path d="M3 12h17m-6-6 6 6-6 6"/>',
  save: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>'
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
    <linearGradient id="${prefix}-wrap-a" x1="0" y1="0" x2="1" y2=".25"><stop stop-color="#b48f65"/><stop offset=".5" stop-color="#e1c69b"/><stop offset="1" stop-color="#c5a47a"/></linearGradient>
    <linearGradient id="${prefix}-wrap-b" x1="0" y1="0" x2="1" y2=".32"><stop stop-color="#efdcba"/><stop offset=".55" stop-color="#d9bb91"/><stop offset="1" stop-color="#b58e66"/></linearGradient>
    <pattern id="${prefix}-grain" width="42" height="42" patternUnits="userSpaceOnUse"><g fill="none" stroke="#6c6444" stroke-width=".63" opacity=".19">${grain}</g></pattern>
    <pattern id="${prefix}-wrap-lines" width="3.8" height="3.8" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><path d="M0 0v4" stroke="#73603d" stroke-width=".45" opacity=".34"/></pattern>
    <clipPath id="${prefix}-tucked"><path d="M0 0H320V189H214L179 293 159 301 104 191H0Z"/></clipPath>
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

function wrapArt(prefix, name) {
  return `<g class="bq-wrap">
    <g class="bq-wrap-left"><path d="m104 192 61 30 45-21-34 99-18 8z" fill="url(#${prefix}-wrap-a)" stroke="#957854" stroke-width=".8"/><path d="m104 192 61 30 45-21-34 99-18 8z" fill="url(#${prefix}-wrap-lines)"/><path d="m108 196 51 104m7-77-5 62" fill="none" stroke="#a18462" stroke-width=".8"/></g>
    <g class="bq-wrap-right"><path d="m214 185-53 28-47-8 44 103 22-8z" fill="url(#${prefix}-wrap-b)" stroke="#a38b68" stroke-width=".8"/><path d="m214 185-53 28-47-8 44 103 22-8z" fill="url(#${prefix}-grain)"/><path d="m212 188-50 80-4 39m-42-100 46 61" fill="none" stroke="#9a7a57" opacity=".6" stroke-width=".8"/></g>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round" class="bq-ribbon">
      <path d="M150 263q15 5 33-3" stroke="#7d4947" stroke-width="4.2"/><path d="M150 262q15 5 33-3" stroke="#ba8580" stroke-width="1.4"/>
      <g class="bq-bow"><path d="M164 264c-14-13-23-17-26-12s10 17 26 12c12-18 23-22 25-16s-11 17-25 16Zm-2 2q-12 22-27 22m30-22q10 11 22 12" stroke="#814e51" stroke-width="3.6"/><path d="M164 264c-14-13-23-17-26-12s10 17 26 12c12-18 23-22 25-16s-11 17-25 16Zm-2 2q-12 22-27 22m30-22q10 11 22 12" stroke="#ca9990" stroke-width="1.1"/><ellipse cx="164" cy="264" rx="3.2" ry="2.4" fill="#9e6c69" stroke="#804f50" stroke-width=".7"/></g>
    </g>
    <g class="bq-tag"><path d="M165 264q25 2 33 19m-33-19q21 1 34 19" fill="none" stroke="#856d4e" stroke-width=".9"/><g transform="rotate(-11 195 284)"><path d="m191 277 8-5h55v20h-55l-8-5z" fill="#a89975" opacity=".4" transform="translate(1 1.2)"/><path d="m191 276 8-5h55v20h-55l-8-5z" fill="#f4ecd5" stroke="#9c8a69" stroke-width=".6"/><circle cx="197" cy="281" r="1.8" fill="#978664"/><text x="226" y="284" font-family="Georgia, serif" font-size="8.5" font-style="italic" fill="#514235" text-anchor="middle">For ${escape(name)}</text></g></g>
  </g>`;
}

function chosenFlowers(config) {
  const types = config.flowerTypes || config.flowers;
  if (!Array.isArray(types)) return FLOWERS;
  const allowed = new Set(types.map(item => typeof item === 'string' ? item : item?.type));
  const filtered = FLOWERS.filter(flower => allowed.has(flower.type));
  return filtered.length ? filtered : FLOWERS;
}

function arrangement() {
  const { stems, arrangement: variant } = bouquet;
  const ordered = stems.slice().sort((a, b) => {
    const rank = stem => (['breath', 'lavender'].includes(stem.type) ? 0 : 1) +
      (variant ? (Math.sin(stem.id * 71 + variant * 53) + 1) * .41 : stem.id / 1000);
    return rank(a) - rank(b);
  });
  const rows = ordered.length < 4 ? [ordered] : [
    ordered.slice(0, Math.ceil(ordered.length * .57)), ordered.slice(Math.ceil(ordered.length * .57))
  ];
  return rows.flatMap((row, depth) => row.map((stem, i) => {
    const across = row.length === 1 ? 0 : (i / (row.length - 1)) * 2 - 1;
    const spread = Math.min(depth ? 73 : 93, Math.max(25, row.length * 23));
    const jitter = Math.sin(stem.id * 89 + variant * 4) * 3.1;
    const x = 160 + spread * across + jitter;
    const y = (depth ? 153 : 106) + Math.abs(across) * (depth ? 8 : 23) +
      Math.cos(stem.id * 3.9 + variant) * 4.5;
    // The fan converges above the cut ends so that every stem actually enters the ribbon.
    const angle = Math.atan2(x - 163, 260 - y);
    const length = Math.hypot(x - 163, 260 - y) / 124;
    const width = Math.min(.94, length * .86) * (depth ? 1.03 : .93);
    const a = width * Math.cos(angle), b = width * Math.sin(angle);
    const c = -length * Math.sin(angle), d = length * Math.cos(angle);
    const matrix = [a,b,c,d,163 + c * 36,260 + d * 36];
    return {stem, x, y, matrix: matrix.map(n => n.toFixed(4)).join(',')};
  }));
}

export function mountBouquet(host, { onNext, config = {} } = {}) {
  const prefix = 'bouquet-' + (++mounts);
  const recipient = config.recipient || 'Fakhima';
  const choices = chosenFlowers(config);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const flyers = new Set();
  const nodes = new Map();
  let disposed = false;
  let saving = false;

  const root = document.createElement('section');
  root.className = 'bq-root';
  root.setAttribute('aria-label', 'Make your bouquet');
  root.innerHTML = `<div class="bq-layout">
    <div class="bq-intro"><h1 class="bq-title" tabindex="-1"></h1><p class="bq-description"></p></div>
    <div class="bq-paper"><svg class="bq-sheet" viewBox="0 0 320 350" xmlns="${SVG_NS}" role="img" aria-label="Your flower arrangement">${botanicalDefs(prefix)}${paper(prefix)}${emptyStudy(prefix)}<g class="bq-stems"></g><g class="bq-wrap-slot"></g></svg></div>
    <div class="bq-controls"><div class="bq-tray" aria-label="Choose your flowers">
      ${choices.map(({type,name}, i) => `<button type="button" data-flower="${type}" aria-label="Add ${escape(name)}" class="bq-choice"><svg class="bq-sample" aria-hidden="true" viewBox="-64 -240 128 250">${sprig(type, {seed: 24+i*41,prefix})}</svg><span class="bq-plus">${icon('plus')}</span><span class="bq-flower-name">${escape(name)}</span></button>`).join('')}
    </div><div class="bq-tools"><span class="bq-count" aria-hidden="true"></span><div class="bq-tool-group"><button type="button" data-bq-action="undo" aria-label="Undo last flower" title="Undo last flower">${icon('undo')}<span>Undo</span></button><button type="button" data-bq-action="arrange" aria-label="Rearrange bouquet" title="Rearrange bouquet">${icon('arrange')}<span>Rearrange</span></button></div></div>
    <div class="bq-actions"><button type="button" class="bq-primary" data-bq-action="wrap">Wrap my bouquet ${icon('arrow')}</button><button type="button" class="bq-primary" data-bq-action="next">Open your letter ${icon('arrow')}</button><button type="button" class="bq-secondary" data-bq-action="save">${icon('save')} Save PNG</button><button type="button" class="bq-secondary" data-bq-action="edit">Unwrap</button></div></div>
    <span class="bq-sr" role="status" aria-live="polite" aria-atomic="true"></span>
  </div>`;
  host.append(root);
  const $ = selector => root.querySelector(selector);
  const sheet = $('.bq-sheet');
  const stemsLayer = $('.bq-stems');
  const wrapSlot = $('.bq-wrap-slot');
  const speak = message => { $('.bq-sr').textContent = message; };

  function fly(button, placed) {
    const svgMatrix = sheet.getScreenCTM();
    if (reduced.matches || !svgMatrix || !Element.prototype.animate) return 0;
    const sample = button.querySelector('svg');
    const origin = sample.getBoundingClientRect();
    const target = sheet.createSVGPoint();
    target.x = placed.x; target.y = placed.y;
    const end = target.matrixTransform(svgMatrix);
    const startX = origin.left + origin.width * .5;
    const startY = origin.top + origin.height * .25;
    const dx = end.x - startX, dy = end.y - startY;
    const float = document.createElementNS(SVG_NS, 'svg');
    float.setAttribute('viewBox', '-58 -220 116 236');
    float.setAttribute('aria-hidden', 'true');
    float.setAttribute('class', 'bq-fly');
    float.style.left = (startX - 29) + 'px'; float.style.top = (startY - 15) + 'px';
    const instance = document.createElementNS(SVG_NS, 'use');
    instance.setAttribute('href', '#' + prefix + '-stem-' + placed.stem.id);
    instance.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + prefix + '-stem-' + placed.stem.id);
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

  function render({ added, from } = {}) {
    const { wrapped, stems } = bouquet;
    const layout = arrangement();
    const currentIds = new Set(stems.map(stem => stem.id));
    for (const [id, g] of nodes) if (!currentIds.has(id)) { g.remove(); nodes.delete(id); }
    for (const placed of layout) {
      const {stem, matrix} = placed;
      let g = nodes.get(stem.id);
      const fresh = !g;
      if (fresh) {
        g = document.createElementNS(SVG_NS, 'g');
        g.innerHTML = `<g id="${prefix}-stem-${stem.id}">${sprig(stem.type,{seed:stem.seed,prefix})}</g>`;
        nodes.set(stem.id, g);
      }
      const old = g.getAttribute('transform');
      const next = 'matrix(' + matrix + ')';
      stemsLayer.append(g);
      g.setAttribute('transform', next);
      if (reduced.matches || !g.animate) continue;
      if (fresh && added === stem.id && from) {
        const delay = fly(from, placed);
        g.animate([{opacity:0},{opacity:1}],{duration:270,delay,fill:'backwards'});
      } else if (old && old !== next) {
        g.animate([{transform:old},{transform:next}],{duration:570,easing:'cubic-bezier(.22,.76,.3,1)'});
      }
    }
    $('.bq-empty').setAttribute('opacity', stems.length ? 0 : 1);
    sheet.setAttribute('aria-label', stems.length ? `${wrapped ? 'Wrapped bouquet' : 'Bouquet'} with ${stems.length} ${stems.length === 1 ? 'stem' : 'stems'}` : 'A pencil study on an empty sheet of flower-press paper');
    if (wrapped && !wrapSlot.firstElementChild) wrapSlot.innerHTML = wrapArt(prefix,recipient);
    if (!wrapped) wrapSlot.replaceChildren();
    if (wrapped) stemsLayer.setAttribute('clip-path', `url(#${prefix}-tucked)`);
    else stemsLayer.removeAttribute('clip-path');
    root.classList.toggle('is-wrapped', wrapped);
    const heading = wrapped ? `Flowers for <em>${escape(recipient)}.</em>` : 'Pick your <em>flowers.</em>';
    if ($('.bq-title').innerHTML !== heading) $('.bq-title').innerHTML = heading;
    $('.bq-description').textContent = wrapped ? (config.bouquetMessage || 'Ye wale kabhi murjhayenge bhi nahi btw.') : 'Tap the stems you like. Ek daisy aur bhi le lo :3';
    $('.bq-tray').hidden = wrapped;
    $('.bq-tools').hidden = wrapped;
    $('[data-bq-action="wrap"]').hidden = wrapped;
    for (const key of ['edit','next','save']) $('[data-bq-action="' + key + '"]').hidden = !wrapped;
    $('[data-bq-action="wrap"]').disabled = !stems.length;
    $('[data-bq-action="undo"]').disabled = !stems.length;
    $('[data-bq-action="arrange"]').disabled = stems.length < 2;
    root.querySelectorAll('[data-flower]').forEach(button => { button.disabled = stems.length >= LIMIT; });
    $('.bq-count').textContent = stems.length === LIMIT ? 'Bouquet full' : `${stems.length} ${stems.length === 1 ? 'stem' : 'stems'}`;
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
      render({added:id, from:button});
      speak(`${choices.find(f => f.type === type).name} added. ${$('.bq-count').textContent}.`);
      return;
    }
    switch (button.dataset.bqAction) {
      case 'undo': bouquet.stems.pop(); render(); speak('Last flower removed. ' + $('.bq-count').textContent + '.'); break;
      case 'arrange': bouquet.arrangement++; render(); speak('Flowers rearranged.'); break;
      case 'wrap':
        bouquet.wrapped = true; render(); $('.bq-title').focus({preventScroll: true}); speak('Your bouquet is wrapped.'); break;
      case 'edit':
        bouquet.wrapped = false; render(); $('.bq-title').focus({preventScroll: true}); break;
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
    root.remove();
  };
}
