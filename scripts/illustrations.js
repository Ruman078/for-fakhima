import {random} from './motion.js';

const svg = (content, view = '0 0 24 24') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" fill="none" aria-hidden="true" focusable="false">${content}</svg>`;
const stroke = paths => `<g stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${paths}</g>`;
export const icons = {
  sound: svg(stroke('<path d="M3 9h4l5-4v14l-5-4H3zM16 9q3 3 0 6m3-9q5 6 0 12"/>')),
  silent: svg(stroke('<path d="M3 9h4l5-4v14l-5-4H3zM16 9l5 6m0-6-5 6"/>')),
  chapters: svg(stroke('<path d="M2.5 5.5Q8 4 12 7q4-3 9.5-1.5V18q-5.5-1.5-9.5 1.4-4-2.9-9.5-1.4zM12 7v12"/>')),
  left: svg(stroke('<path d="M19 12H5m6-6-6 6 6 6"/>')),
  right: svg(stroke('<path d="M5 12h14m-6-6 6 6-6 6"/>')),
  close: svg(stroke('<path d="m6 6 12 12m0-12L6 18"/>')),
  replay: svg(stroke('<path d="M5 9a7.5 7.5 0 1 1-.3 5M4 4v6h6"/>'))
};

export function emblem() {
  const petals = Array.from({length: 12}, (_,i) => `<path transform="rotate(${30*i} 20 19)" d="M19.8 16c-2.9-2.3-3.2-6.6-.9-8.5 2.2-.6 3.6 4.3 1.6 8.6" fill="#eadbb3" stroke="#927f52" stroke-width=".42"/>`).join('');
  return svg(`<path d="M17 42q6-10 3-22M19 34q-9 .1-10-7 8 1 10 7Zm2-5q9 0 11-9-9 2-11 9Z" fill="#a6ac79" stroke="#d9c78c" stroke-width=".8"/>${petals}<circle cx="20" cy="19" r="3.6" fill="#d6aa57"/><path d="m18.3 19 .4-1m2.1 1.3.6-1.2" stroke="#816234"/>`, '0 0 40 46');
}
const star = (x,y,r) => `<path d="M${x} ${y-r}q0 ${r} ${r*.7} ${r}q${-r*.7} 0 ${-r*.7} ${r}q0 ${-r} ${-r*.7} ${-r}q${r*.7} 0 ${r*.7} ${-r}Z"/>`;
export function moon() {
  const rand=random(3011);
  const crescent="M82 20C64 20 49 34 49 52c0 20 16 35 35 35 13 0 23-6 29-15-10 5-25 4-36-4-15-11-16-31 5-48Z";
  let marks='';
  for(let i=0;i<150;i++) {
    const x=48+rand()*62, y=18+rand()*72, r=.3+rand()*1.9;
    marks += i%4 ? `<path d="M${x.toFixed(1)} ${y.toFixed(1)}q-1 2 -${r.toFixed(1)} 2.8" stroke="#9d8855" stroke-width=".65" opacity=".65"/>` : `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#a18a58" stroke-width=".8"/>`;
  }
  return svg(`<defs><clipPath id="moon-edge"><path d="${crescent}"/></clipPath><linearGradient id="moon-ink" x2=".8" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#fff3c7"/><stop offset="1" stop-color="#c2a66d"/></linearGradient></defs>
    <g stroke="#af9c73" stroke-width=".65" fill="none"><path d="M38 78a47 47 0 0 1 62-66" opacity=".46"/><path d="M48 88a47 47 0 0 0 60 0" opacity=".4"/><path d="M29 63a58 58 0 0 1 22-54" stroke-dasharray="1 4" opacity=".6"/></g>
    <path d="${crescent}" fill="url(#moon-ink)" stroke="#f1dfad" stroke-width=".9"/><g clip-path="url(#moon-edge)">${marks}</g>
    <g fill="#e3c98b">${star(104,35,4.3)}${star(117,48,2)}${star(32,57,2.3)}${star(83,2,1.7)}</g>`, '0 0 160 104');
}
export function seedButton() {
  return svg(`<defs><radialGradient id="bud-light"><stop stop-color="#5a6043"/><stop offset="1" stop-color="#243c36"/></radialGradient><linearGradient id="bud-petal"><stop stop-color="#988363"/><stop offset=".57" stop-color="#f1dcb0"/><stop offset="1" stop-color="#bca27d"/></linearGradient></defs>
    <circle cx="40" cy="40" r="33" fill="url(#bud-light)" stroke="#b7a06e" stroke-width="1"/>
    <circle cx="40" cy="40" r="37" fill="none" stroke="#aa9868" stroke-width=".65" stroke-dasharray="1 3.5"/>
    <g fill="#dfc38b">${star(40,3,2.8)}${star(77,40,2)}${star(3,40,2)}${star(40,77,2.8)}</g>
    <g class="seed-sprout" stroke-linecap="round" stroke-linejoin="round"><path d="M33 59q9-10 8-27" stroke="#c9c18b" stroke-width="1.25"/><path d="M39 47q-12 0-14-12c8 1 12 5 14 12Zm2-5q2-11 13-13-2 10-13 13Z" fill="#9ca677" stroke="#cacc9b" stroke-width=".7"/><path d="m29 38 9 8m4-5 8-8" stroke="#566444" stroke-width=".85"/>
    <path d="M40 33c-5-3-6-10-2-15 0 4 4 4 4 11 0-7 4-11 7-13 1 7 0 15-7 18Z" fill="url(#bud-petal)" stroke="#efddb7" stroke-width=".75"/><path d="M40 32c-1-5 .5-11 4-15 1 6-1 11-2 15" fill="#e3c9a2" stroke="#a78d68" stroke-width=".7"/><path d="m37 29 4 3 5-3-4 6z" fill="#929c6e"/></g>`, '0 0 80 80');
}
export function corner() {
  return svg(`<g stroke="#bca46c" fill="none" stroke-width=".75"><path d="M1 45V1h45M6 35V6h29M2 23c5-10 15-10 18-21M7 21c4-3 9-4 12-10"/><path d="M8 18q1-6 6-7-1 5-6 7Zm6-7q-2-4 0-6 3 3 0 6Zm4-1q3-4 7-3-2 4-7 3Z" fill="#a99362" stroke-width=".4"/></g><path d="m4 4 1.5-1.5L7 4 5.5 5.5Z" fill="#dfc78f"/>`, '0 0 46 46');
}
