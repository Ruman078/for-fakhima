import { flowerHead, seeded } from './botany.js';

export const cutFlowers = [
  ['daisy', 'Daisy'], ['white-lily', 'Ivory lily'], ['pink-lily', 'Pink lily'],
  ['rose', 'Garden rose'], ['peony', 'Peony'], ['tulip', 'Tulip'],
  ['poppy', 'Poppy'], ['cosmos', 'Cosmos'], ['cornflower', 'Cornflower'],
  ['sweet-pea', 'Sweet pea'], ['lavender', 'Lavender'], ['breath', 'Baby’s breath']
].map(([type, name]) => ({type, name}));

const round = value => Number(value.toFixed(2));
const paint = (prefix, color) => 'url(#' + prefix + '-' + color + ')';
const view = (art, x, y, angle, scale = 1) =>
  `<g transform="translate(${round(x)} ${round(y)}) rotate(${round(angle)}) scale(${round(scale)})">${art}</g>`;
export const useArt = id => `<use href="#${id}" xlink:href="#${id}"/>`;
export const flowerId = (prefix, type, variant = 0) => `${prefix}-cut-${type}-${variant}`;

function rose(prefix, random) {
  let petals = '';
  for (const [ring, count, scale] of [[0,6,1],[1,5,.72],[2,4,.46],[3,3,.265]]) {
    for (let i = 0; i < count; i++) {
      const scallop = round(2 + random() * 2.5);
      const petal = `<path d="M-3 -2C-13 1-28-12-25-22Q-28-32-18-35Q-10-38-4-34Q2-37 10-34Q21-31 22-24C20-15 10-6-3-2Z" fill="${paint(prefix,ring%2?'rose-cup':'rose-rim')}" stroke="#894f51" stroke-width=".7"/>
        <path d="M-25-23Q-21-37-5-31Q8-37 19-27Q8-32-2-27Q-15-31-25-23Z" fill="#e4a49b" opacity=".74"/>
        <path d="M-20-26Q-14-13 -${scallop}-7M-10-29Q-8-18-5-13" fill="none" stroke="#8f5759" stroke-width=".6" opacity=".63"/>`;
      petals += view(petal,0,0,i*360/count+ring*39+random()*9,scale);
    }
  }
  return `<g transform="scale(1 .89)">${petals}<path d="M-3.5 -1q4-5 7 0-2 3-5.5 2.6" fill="none" stroke="#723f44" stroke-width="1.4"/></g>`;
}

function peony(prefix, random) {
  let flower = '';
  for (const [count, scale] of [[11,1],[10,.79],[9,.55],[7,.36],[5,.21]]) {
    for (let i = 0; i < count; i++) {
      const width = round(.87+random()*.22);
      const petal = `<g transform="scale(${width} 1)">
        <path d="M-1 2C-10-3-21-18-18-27Q-21-35-15-35Q-13-42-8-36Q-4-42 0-37Q8-43 9-35Q18-38 16-29C21-18 9-5-1 2Z" fill="${paint(prefix,'peony')}" stroke="#b78880" stroke-width=".65"/>
        <path d="M-11-29Q-11-20-3-6M2-33Q-1-21 0-13M10-29Q8-18 3-10" fill="none" stroke="#ca9e92" stroke-width=".61"/></g>`;
      flower += view(petal,0,0,i*360/count+scale*169+random()*8,scale);
    }
  }
  return `<g transform="scale(1 .89)">${flower}</g>`;
}

function tulip(prefix) {
  const cup = paint(prefix,'tulip');
  return `<g transform="translate(0 10)"><path d="M0 6C-27 6-35-19-26-40Q-10-31-2-8C-9-25-6-41 3-50Q13-41 10-21Q20-40 29-41C30-12 23 7 0 6Z" fill="${paint(prefix,'tulip-back')}" stroke="#a16d5d" stroke-width=".85"/>
    <path d="M-1 9C-21 7-30-13-27-42Q-13-37 3-17Q18-34 28-44C31-11 17 7-1 9Z" fill="${cup}" stroke="#b88369" stroke-width=".8"/>
    <path d="M-1 8C-14-2-14-21-10-36Q1-35 8-26Q9-9-1 8Z" fill="${paint(prefix,'tulip-front')}" stroke="#b68472" stroke-width=".7"/>
    <path d="M-24-34Q-22-7-4 4M26-36Q17-14 4 4M-7-30Q-5-12-1 2M-16-22Q-13-11-10-7" fill="none" stroke="#bd8f76" stroke-width=".72"/></g>`;
}

function disc(random, n, r, colors) {
  let specks = '';
  for (let i=0;i<n;i++) {
    const a=i*2.39996, radius=r*Math.sqrt(i/n);
    const x=round(Math.cos(a)*radius),y=round(Math.sin(a)*radius);
    specks += `M${x} ${y}l${round(.3+random()*.45)} -.62`;
  }
  return `<circle r="${r}" fill="${colors[0]}"/><path d="${specks}" fill="none" stroke="${colors[1]}" stroke-linecap="round" stroke-width=".95"/>`;
}

function poppy(prefix, random) {
  let petals = '';
  for (let i=0;i<5;i++) {
    const petal = `<path d="M0 2C-9-2-20-8-25-19Q-32-27-26-32Q-26-38-20-36Q-15-42-9-37Q1-42 7-36Q16-38 21-32Q29-33 28-25C27-16 10-6 0 2Z" fill="${paint(prefix,i%2?'poppy-back':'poppy')}" stroke="#984f47" stroke-width=".8"/>
      <path d="M0-2Q-16-11-22-26M-1-4Q-12-20-12-32M1-5Q0-19 6-33M3-5Q13-13 21-25" fill="none" stroke="#ad5f52" stroke-width=".72" opacity=".9"/><path d="M-3-2q-2-8-7-12 8 1 11 7 7-7 11-7-2 9-9 13Z" fill="#5d4748"/>`;
    petals += view(petal,0,0,i*72+random()*12,.96+random()*.08);
  }
  return `<g transform="scale(1 .82)">${petals}${disc(random,52,7,['#544445','#ceb796'])}<ellipse rx="4.3" ry="3.4" fill="#849077" stroke="#5c6756"/></g>`;
}

function cosmos(prefix, random) {
  let petals='';
  for(let i=0;i<8;i++) {
    const petal=`<path d="M0 1Q-14-13-14-31Q-15-37-9-34Q-6-43-1-36Q5-43 8-35Q15-39 14-31Q14-13 0 1Z" fill="${paint(prefix,'cosmos')}" stroke="#ad8549" stroke-width=".7"/>
      <path d="M0-4Q-7-15-10-29M0-4Q-2-20-1-32M1-4Q8-18 8-29" fill="none" stroke="#bd9857" stroke-width=".72"/>`;
    petals+=view(petal,0,0,i*45+random()*6,.93+random()*.12);
  }
  return `<g transform="scale(1 .93)">${petals}${disc(random,65,7.4,['#b18441','#eed099'])}</g>`;
}

function cornflower(prefix, random) {
  let florets='';
  for(const [count,scale] of [[14,1],[11,.72],[9,.46]]){
    for(let i=0;i<count;i++){
      const floret=`<path d="M0-3Q-2-15-4-21L-10-29-7-31-6-36-2-30 0-40 3-32 6-38 7-30 11-32 8-23Q3-12 0-3Z" fill="${paint(prefix,'cornflower')}" stroke="#565f89" stroke-width=".55"/>
        <path d="M0-9Q0-21 0-30M1-13L5-27" fill="none" stroke="#b5bfd5" stroke-width=".62"/>`;
      florets+=view(floret,0,0,i*360/count+scale*39+random()*10,scale);
    }
  }
  return `<g transform="scale(1 .90)">${florets}${disc(random,31,4.8,['#676384','#b4a4bf'])}</g>`;
}

function sweetPea(prefix) {
  const bloom=`<path d="M0 4C-13 6-22-.5-22-8Q-27-21-17-22Q-10-26-4-17Q0-24 7-21Q18-16 11-4Z" fill="${paint(prefix,'pea')}" stroke="#997d9c" stroke-width=".8"/>
    <path d="M-2 3Q-11-11-20-15Q-9-16 1-5Q9-13 15-10Q21-7 15-1Q11 5 1 5Z" fill="#cfacca" stroke="#92768d" stroke-width=".75"/>
    <path d="M0 5q-9-6-10-9Q1-4 6 1L4 5Z" fill="#ebd7e0"/><path d="M0 5q6-8 13-9-3 7-9 10Z" fill="#839177"/>
    <path d="M-17-18Q-11-17-6-12M-14-21Q-7-17-5-14" fill="none" stroke="#b297b1" stroke-width=".5"/>`;
  return '<path d="M0 28Q-4 4 4-30M-2 11Q-11 5-13-2M-.3-1Q11-8 14-15M1-14Q-5-21-5-26" fill="none" stroke="#7b8b72" stroke-width="1.3"/>'
    +view(bloom,-13,-4,-21,1.02)+view(bloom,15,-14,36,.88)+view(bloom,-4,-28,-13,.72)
    +'<path d="M4-29q6-13 10-8 3 6-2 5" fill="none" stroke="#8c9b7d" stroke-width=".9"/>';
}

function fillers(type, prefix, seed) {
  if (type==='lavender') {
    const spike=flowerHead(type,{prefix,seed});
    return '<path d="M0 22Q-4-3-14-11M0 22Q5 3 13-4M0 18Q2-5 1-16" fill="none" stroke="#85917b" stroke-width="1.25"/>'
      +view(spike,-14,-10,-23,.77)+view(spike,14,-4,27,.76)+view(spike,1,-15,3,.92);
  }
  const random=seeded(seed);
  let branches='', flowers='';
  const tiny='<g fill="#f2edd7" stroke="#a6a08b" stroke-width=".4"><path d="M0-1Q-3-5-4-2q-1 2 3 3-5 1-3 3 2 2 5-1 0 5 3 3 1-2-1-5 5 2 5-1-1-3-5-2 2-4-.5-5Q0-6 0-1Z"/><circle r="1.03" fill="#d3bc78"/></g>';
  for (let i=0;i<8;i++){
    const a=(i/7)*Math.PI*1.12 - Math.PI*.06, x=29*Math.cos(a), y=-22*Math.sin(a)-6;
    branches+=`M0 26Q${round(x*.15)} 7 ${round(x*.7)} ${round(y*.61)}`;
    for(let j=0;j<3;j++){
      const xx=x+(j-1)*5.8+random()*2,yy=y+(j%2)*4+random()*3;
      branches+=`M${round(x*.7)} ${round(y*.61)}Q${round(xx*.89)} ${round(yy+4)} ${round(xx)} ${round(yy)}`;
      flowers+=view(tiny,xx,yy,random()*70,.64+random()*.16);
    }
  }
  return `<path d="${branches}" fill="none" stroke="#8f9a80" stroke-width=".78"/>${flowers}`;
}

const palettes={
  'rose-rim':['#b76e71','#e2a39b','#ad696e'], 'rose-cup':['#ab6268','#d48c86','#a26164'],
  peony:['#d4a297','#f6d7c6','#e4b9aa'], tulip:['#dba181','#f1ca9e','#d49a80'],
  'tulip-back':['#ad7c72','#e6b38e','#be8b7f'], 'tulip-front':['#d59b7e','#f1c9a2','#c58e79'],
  poppy:['#c77868','#e99b7e','#bd6c61'], 'poppy-back':['#b66a61','#d78b73','#ba665e'],
  cosmos:['#d9b06b','#f7de9e','#d9b16b'],cornflower:['#667fa9','#a0b1ce','#7087b1'],
  pea:['#ac8cad','#ecd6e2','#c5a6c0']
};

const specialty={rose,peony,tulip,poppy,cosmos,cornflower,'sweet-pea':sweetPea};
// Variants live in the exported illustration's own defs. A large bouquet can
// repeat a variety without duplicating hundreds of engraved petal paths.
export function floristDefs(prefix, types) {
  let defs=Object.entries(palettes).map(([name,[dark,light,edge]])=>
    `<linearGradient id="${prefix}-${name}" x1="0" y1=".8" x2=".85" y2="0"><stop stop-color="${dark}"/><stop offset=".54" stop-color="${light}"/><stop offset="1" stop-color="${edge}"/></linearGradient>`).join('');
  types.forEach(({type}, i)=>{
    for(let variant=0;variant<2;variant++){
      const seed=83+i*59+variant*37;
      const art=specialty[type]?specialty[type](prefix,seeded(seed)):
        type==='breath'||type==='lavender'?fillers(type,prefix,seed):flowerHead(type,{seed,prefix});
      defs+=`<g id="${flowerId(prefix,type,variant)}">${art}</g>`;
    }
  });
  return '<defs>'+defs+'</defs>';
}
