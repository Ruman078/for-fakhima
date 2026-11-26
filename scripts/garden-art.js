import { botanicalDefs, flowerHead, seeded, sprig } from './botany.js';

const NS = 'http://www.w3.org/2000/svg';
const round = n => Number(n.toFixed(2));
const xy = (x,y) => round(x)+' '+round(y);
const group = (mark,x,y,angle=0,sx=1,sy=sx) =>
  `<g transform="translate(${xy(x,y)}) rotate(${round(angle)}) scale(${xy(sx,sy)})">${mark}</g>`;
const use = id => `<use href="#${id}" xlink:href="#${id}"/>`;

// A bank is a little illustration in its own coordinate system. Drawing the
// resting layers to SVG images keeps thousands of tiny ink marks out of the DOM.
function imageLayer(mark, viewBox, className, alignment='xMinYMax meet') {
  const image = new Image();
  image.className = className;
  image.alt = '';
  image.draggable = false;
  const svg = `<svg xmlns="${NS}" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${viewBox}" preserveAspectRatio="${alignment}">${mark}</svg>`;
  const url = URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  image.src = url;
  // Keep the blob alive while the image is in use, including Safari repaints.
  return { image, url };
}

function grasses(rng, count, center, baseline, spread, tall, dark) {
  let blades='',ridges='';
  for(let i=0;i<count;i++) {
    const x=center+(rng()-.5)*spread, y=baseline+rng()*36;
    const height=tall*(.18+.82*rng()), bend=(rng()-.48)*height*1.12;
    const tipX=x+bend, tipY=y-height, w=1.6+rng()*3.9;
    blades+=`M${xy(x-w,y)}Q${xy(x+bend*.17,y-height*.68)} ${xy(tipX,tipY)}Q${xy(x+bend*.14+w,y-height*.59)} ${xy(x+w,y)}Z`;
    ridges+=`M${xy(x,y)}Q${xy(x+bend*.12,y-height*.57)} ${xy(tipX,tipY)}`;
  }
  return `<path d="${blades}" fill="${dark?'#233b34':'#516854'}"/><path d="${ridges}" fill="none" stroke="${dark?'#415747':'#a2a185'}" opacity=".65" stroke-width=".5"/>`;
}

function seedGrass(rng) {
  let spike='',ink='';
  const bend=19+rng()*23;
  for(let j=0;j<11;j++) {
    const t=j/11;
    for(const sign of [-1,1]) {
      const x=bend*t*t, y=-130-t*34, dx=sign*(2+(1-t)*3.4), len=5+rng()*6;
      spike+=`M${xy(x,y)}q${xy(dx*1.45,-len*.32)} ${xy(dx,-len)}q${xy(-dx*1.12,len*.22)} ${xy(-dx,len)}Z`;
      ink+=`M${xy(x,y)}l${xy(dx*1.33,-len-3.1)}`;
    }
  }
  return `<path d="M0 0Q-13 -73 0 -130Q2 -146 ${xy(bend,-165)}" fill="none" stroke="#8b9274" stroke-width=".93"/><path d="${spike}" fill="#aaa485"/><path d="${ink}" fill="none" stroke="#c6baa0" stroke-width=".42"/>`;
}

function bank(side) {
  const rng=seeded(side==='left'?601:854);
  const p='g';
  const symbols=new Map();
  function specimen(type, n=0) {
    const id=type+n;
    if(!symbols.has(id)) symbols.set(id,sprig(type,{seed:37+n*173,prefix:p,detail:true}));
    return use(id);
  }
  function head(type,n=0){
    const id='head-'+type+n;
    if(!symbols.has(id)) symbols.set(id,flowerHead(type,{seed:93+n*73,prefix:p}));
    return use(id);
  }
  function forms(items) {
    return items.map(([type,x,y,angle,scale,n=0])=>group(specimen(type,n),x,y,angle,scale)).join('');
  }
  const left=side==='left';
  let art=grasses(rng,43,83,574,344,257,true);
  art+='<g opacity=".54">'+forms([
    ['fern',-10,512,9,2.35],['foliage',45,541,-13,1.98,1],['fern',40,550,38,1.59,1],
    ['foliage',4,510,29,1.7],['fern',160,575,38,1.27],['fern',255,581,45,.91,1]
  ])+'</g>';
  art+='<g opacity=".79">'+forms([
    ['foliage',-12,441,8,1.58,1],['lavender',12,474,28,1.20,1],
    ['fern',-19,494,32,1.62],['bud',3,457,20,1.10,1],['breath',131,568,32,1.32],
    ['foliage',78,574,28,1.38],['lavender',144,554,29,1.10],['bud',125,536,38,.97]
  ])+'</g>';
  art+=group(seedGrass(rng),23,408,5,1.25)+group(seedGrass(rng),65,518,25,1.42)+group(seedGrass(rng),173,561,43,1.1);
  art+=forms(left ? [
    ['lavender',10,439,17,1.10],['breath',12,449,23,1.1,1],
    ['foliage',-19,468,31,1.49],['bud',5,433,18,1.21],
    ['fern',5,523,43,1.38],['lavender',73,526,33,1.20,1],
    ['bud',116,542,34,.97,1],['fern',152,571,50,1.08],
  ]:[
    ['bud',-3,437,12,1.13,1],['breath',16,492,28,1.3],
    ['lavender',34,496,18,1.20,1],['fern',-12,457,25,1.43,1],
    ['bud',64,479,23,1.0],['foliage',97,542,33,1.26,1],
    ['lavender',167,563,42,1.12],['fern',102,551,51,1.17]
  ]);
  // Long, branched flower stems take sweeping paths through the surrounding
  // plants. This lets two neighboring flowers belong to the same plant.
  function stalk(path, thickness=2.2) {
    return `<g fill="none" stroke-linecap="round"><path d="${path}" stroke="#294838" stroke-width="${thickness+.95}"/><path d="${path}" stroke="#899782" stroke-width="${thickness}"/><path d="${path}" stroke="#c0bfa3" stroke-width=".55"/></g>`;
  }
  if(left) {
    art+='<g opacity=".80">'+stalk('M5 471C18 392 21 343 35 286Q49 225 82 174M40 270Q55 235 87 219',1.45)+group(head('bud',2),82,174,29,.48)+group(head('bud'),87,219,54,.39)+'</g>';
    art+=stalk('M47 568C54 492 100 402 115 347C128 295 126 265 115 236M80 444C109 388 152 377 174 334M105 383Q93 339 66 318');
    art+=group(head('daisy',2),115,234,-17,.93,.76)+group(head('daisy',1),174,332,17,.62,.46)+group(head('bud'),66,317,-48,.53);
    art+=stalk('M140 574C145 511 206 467 229 421',1.75);
    art+=group(head('daisy'),229,419,33,.65,.55);
  } else {
    art+='<g opacity=".77">'+stalk('M7 473C21 392 11 311 30 242Q42 193 73 166M38 216Q50 196 68 191',1.45)+group(head('bud'),73,166,37,.49)+group(head('bud',1),68,191,66,.36)+'</g>';
    art+=stalk('M38 569C55 484 109 378 106 303Q106 260 96 233M83 399Q102 335 153 305M102 334Q82 295 53 280',2.85);
    art+=group(head('white-lily',2),96,232,-28,1.02,.83)+group(head('bud',1),153,305,49,.71)+group(head('bud'),53,281,-48,.56);
    art+=stalk('M125 572C144 507 191 469 212 412M176 467Q198 440 244 438',1.75);
    art+=group(head('daisy',1),212,411,-4,.59,.47)+group(head('daisy'),244,437,35,.38,.27);
  }
  art+=forms([
    ['foliage',-13,531,28,1.32,1],['fern',-7,552,12,1.35],
    ['foliage',30,565,36,1.24],['foliage',74,570,58,1.1,1],
    ['fern',107,578,55,1.10,1],['fern',183,580,58,.95],['foliage',210,585,68,.84]
  ]);
  art+=grasses(rng,42,111,580,310,132,false);
  art+=forms([['fern',-8,577,58,1.06,1],['foliage',17,579,64,1.0],['foliage',80,590,70,.9,1]]);
  const defs=Array.from(symbols,([id,geometry])=>`<g id="${id}">${geometry}</g>`).join('');
  return botanicalDefs(p)+'<defs>'+defs+'</defs>'+art;
}

// A sparse overhanging branch brackets the sky. It is deliberately a different
// silhouette from the fern banks at ground level.
function canopy(right) {
  const rng=seeded(right?55:19);
  let branches='',leaves='',ribs='';
  function shoot(x0,y0,dx,dy,scale) {
    const path=(t)=>[x0+dx*t,y0+dy*(.42*t+.58*t*t)];
    branches+=`M${xy(x0,y0)}Q${xy(x0+dx*.5,y0+dy*.21)} ${xy(x0+dx,y0+dy)}`;
    for(let j=1;j<=9;j++) {
      const t=j/10, [x,y]=path(t);
      const sign=j%2?1:-1, run=(11+rng()*13)*scale*sign, fall=(12+rng()*14)*scale;
      leaves+=`M${xy(x,y)}q${xy(run*.72,fall*.2)} ${xy(run,fall)}q${xy(-run*.92,-fall*.28)} ${xy(-run,-fall)}Z`;
      ribs+=`M${xy(x,y)}q${xy(run*.4,fall*.5)} ${xy(run*.89,fall*.89)}`;
    }
  }
  shoot(-20,-17,188,64,1);shoot(29,1,71,89,.93);shoot(14,1,23,126,1.05);shoot(72,8,65,41,.7);
  if(right) shoot(3,-9,13,150,.95);
  return `<path d="${branches}" fill="none" stroke="#6e806c" stroke-width="1.15"/><path d="${leaves}" fill="#354f44" stroke="#5b7160" stroke-width=".55"/><path d="${ribs}" fill="none" stroke="#879480" stroke-width=".45"/>`;
}

function insect() {
  const wing = '<path d="M0 0Q-3 -8 -11 -11Q-18 -14 -16 -7Q-15 -1 -9 1Q-14 0 -11 6Q-8 10 -3 6L0 0Z" fill="#d2b17a" stroke="#81704f" stroke-width=".9"/><path d="M-1 0Q-9 -3 -15 -9M-2 -.1L-12 -6M-2 .5Q-9 2 -10 6" fill="none" stroke="#8e7956" stroke-width=".63"/><path d="M-14 -8l1 .8m-1.5 1l1 .6m3 10 .8 -.4" stroke="#f2dfb6" stroke-linecap="round" stroke-width="1.35"/>';
  return `<svg viewBox="-22 -17 44 34" aria-hidden="true"><g class="b-wing wing-a">${wing}</g><g transform="scale(-1 1)"><g class="b-wing wing-b">${wing}</g></g><path d="M0 -5Q-1 0 .1 6M0 -4q-1 -4 -3 -4M0 -4q1 -4 3 -4" fill="none" stroke="#534c39" stroke-width="1.1"/></svg>`;
}

function beetle() {
  return '<svg viewBox="-9 -9 18 18" aria-hidden="true"><path d="M-3 -1l-3 -2m3 4 -3 2m9 -4 3 -2m-3 4 3 2" stroke="#263a2f" stroke-width="1.1"/><ellipse cy="-3.5" rx="2.9" ry="2.3" fill="#314038"/><ellipse rx="4" ry="4.7" fill="#a76755" stroke="#384238" stroke-width=".75"/><path d="M-.3 -4Q1 0 -.2 4.7" stroke="#574b3d" stroke-width=".6" fill="none"/><path d="M-2 -1h.01m3.8 0h.01m-3.2 3h.01m3 0h.01" stroke="#394036" stroke-width="1.5" stroke-linecap="round"/></svg>';
}

function liveSvg(viewBox, art, className) {
  const node=document.createElementNS(NS,'svg');
  node.setAttribute('viewBox',viewBox);
  node.setAttribute('class',className);
  node.setAttribute('aria-hidden','true');
  node.innerHTML=art;
  return node;
}

function bloomOverlay(side) {
  const left=side==='left', p='live-'+side;
  const stems=left?[
    ['pink-lily',82,568,19,1.49,83],['white-lily',70,574,47,1.26,183],['daisy',184,574,45,.87,89]
  ]:[
    ['pink-lily',83,579,30,1.41,99],['daisy',67,578,47,1.24,72],['white-lily',191,576,48,.81,244]
  ];
  const flowers=stems.map(([type,x,y,angle,scale,seed],i)=>
    `<g style="--plant-delay:${i*305}ms">${group(sprig(type,{seed,prefix:p,grow:true}),x,y,angle,scale)}</g>`).join('');
  return liveSvg('0 0 480 568',botanicalDefs(p)+flowers,'g-growing');
}

function wreath(width, height) {
  const p='w';
  const defs=['foliage','fern','white-lily','pink-lily','daisy','breath','lavender','bud'].map((type,i)=>
    `<g id="w${i}">${type.includes('lily')||type==='daisy'?flowerHead(type,{prefix:p,seed:416+i}):sprig(type,{prefix:p,seed:18+i})}</g>`).join('');
  const unit=Math.min(1, width/650,height/420);
  const rx=width*.5-27*unit,ry=height*.5-40*unit;
  let curves='',sprays='',flowers='';
  for(const sign of [-1,1]) {
    const rng=seeded(sign<0?411:502);
    const arc=v=>Math.sign(v)*Math.pow(Math.abs(v),.79);
    const pos=a=>[width*.5+sign*rx*arc(Math.cos(a)),height*.5+ry*arc(Math.sin(a))];
    for(let k=0;k<=60;k++) {
      const a=Math.PI*.50-k*Math.PI/60;
      curves+=(k===0?'M':'L')+xy(...pos(a));
    }
    const count=Math.round((width+height)/(49*unit));
    for(let i=0;i<count;i++) {
      const a=1.52-i*3.0/count,[x,y]=pos(a), [nx,ny]=pos(a-.014);
      const tangent=Math.atan2(nx-x,y-ny)*180/Math.PI;
      const flourish=(i%3?1:-1)*(9+rng()*20)*sign;
      const id=i%7===0?6:i%5===2?5:i%4===1?1:i%9===3?7:0;
      sprays+=group(use('w'+id),x,y,tangent+flourish,unit*(.18+rng()*.12));
    }
    for(const [angle,id,sc] of [[1.32,2,.48],[1.12,4,.53],[.85,3,.38],[.66,4,.24],[-.20,4,.27],[-.69,4,.29],[-1.02,2,.4],[-1.26,4,.4],[-1.43,3,.24]]) {
      const a=angle+(rng()-.5)*.09;
      const [x,y]=pos(a);
      flowers+=group(use('w'+id),x,y,sign*a*84,sc*unit,sc*unit*.9);
    }
  }
  return botanicalDefs(p)+'<defs>'+defs+'</defs><path d="'+curves+'" fill="none" stroke="#959e77" stroke-width="'+round(unit*1.53)+'"/>'+sprays+flowers;
}

export function mountGarden(host) {
  const layers=[];
  const sides=[];
  let hero, crown, crownSize='', stage=-1;
  host.classList.add('g-art');
  function insertImage(parent, mark, viewBox, klass, alignment) {
    const item=imageLayer(mark,viewBox,klass,alignment);
    layers.push(item);
    parent.appendChild(item.image);
    return item;
  }
  for(const side of ['left','right']) {
    const edge=document.createElement('div');
    edge.className='g-bank g-'+side;
    insertImage(edge,bank(side),'0 0 480 568','g-print');
    host.appendChild(edge);
    sides.push({side,edge,live:null});
    insertImage(host,canopy(side==='right'),'0 0 200 176','g-canopy g-canopy-'+side,'xMinYMin meet');
  }
  function sizeWreath() {
    if(stage!==7 || !host.clientWidth || !host.clientHeight)return;
    const portrait=host.clientWidth<600;
    const width=Math.round(Math.min(host.clientWidth*(portrait?.98:.89),900));
    const height=Math.round(Math.min(host.clientHeight*(portrait?.94:.95),portrait?612:770));
    const box='0 0 '+width+' '+height;
    if(box===crownSize)return;
    crownSize=box;
    const item=insertImage(host,wreath(width,height),box,'g-wreath','xMidYMid meet');
    item.image.style.width=width+'px';
    item.image.style.height=height+'px';
    if(crown) {
      crown.image.remove(); URL.revokeObjectURL(crown.url);
      layers.splice(layers.indexOf(crown),1);
    }
    crown=item;
  }
  const observer='ResizeObserver' in window ? new ResizeObserver(sizeWreath):null;
  if(observer)observer.observe(host);
  else window.addEventListener('resize',sizeWreath);
  function setStage(index) {
    if(index===stage)return;
    stage=index;
    host.dataset.botany=String(index);
    if(index>=1&&index<=3&&!hero) {
      const p='solitary';
      hero=liveSvg('-67 -217 134 219',botanicalDefs(p)+sprig('daisy',{seed:93,prefix:p,grow:true}),'g-hero');
      host.appendChild(hero);
    }
    if(index>=2) {
      for(const entry of sides) if(!entry.live) {
        entry.live = bloomOverlay(entry.side);
        entry.edge.appendChild(entry.live);
      }
      if(!host.querySelector('.g-flight')) {
        const visitor=document.createElement('div');
        visitor.className='g-flight'; visitor.innerHTML=insect(); host.appendChild(visitor);
        const second=visitor.cloneNode(true);second.classList.add('g-second');host.appendChild(second);
        const lady=document.createElement('div'); lady.className='g-lady'; lady.innerHTML=beetle();
        sides[0].edge.appendChild(lady);
      }
    }
    if(index===7)sizeWreath();
  }
  setStage(0);
  return {setStage, destroy() {
    observer?.disconnect();
    if(!observer)window.removeEventListener('resize',sizeWreath);
    host.replaceChildren();
    layers.forEach(({url})=>URL.revokeObjectURL(url));
    host.classList.remove('g-art');
    delete host.dataset.botany;
  }};
}
