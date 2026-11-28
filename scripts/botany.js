// All marks are drawn in plant-local coordinates. A sprig grows up from (0, 0).
// Geometry is deterministic so a picked flower keeps its botanical character.
export function seeded(seed = 1) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let n = Math.imul(value ^ (value >>> 15), 1 | value);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

const num = n => Number(n.toFixed(2));
const point = (x, y) => `${num(x)} ${num(y)}`;
const paint = (prefix, name) => `url(#${prefix}-${name})`;

export function botanicalDefs(prefix = 'bot', mirror = false) {
  function gradient(name, colors, vertical = false) {
    const stops = colors.map(([position, color]) =>
      `<stop offset="${position}%" stop-color="${color}"/>`).join('');
    if (['daisy','daisy-back','white-lily','pink-lily','lily-back','pink-back'].includes(name)) {
      const direction=mirror?-1:1;
      return `<linearGradient id="${prefix}-${name}" gradientUnits="userSpaceOnUse" x1="${-25*direction}" y1="-31" x2="${32*direction}" y2="28">${stops}</linearGradient>`;
    }
    return `<linearGradient id="${prefix}-${name}" x1="0%" y1="${vertical ? 100 : 15}%" x2="${vertical ? 17 : 100}%" y2="${vertical ? 0 : 75}%">${stops}</linearGradient>`;
  }
  return '<defs>' + [
    gradient('leaf', [[0,'#253e38'],[37,'#446455'],[51,'#607764'],[54,'#3a5548'],[100,'#293f39']]),
    gradient('lance', [[0,'#405c52'],[46,'#82917c'],[49,'#526c5f'],[100,'#263e37']]),
    gradient('fern', [[0,'#314c41'],[57,'#728374'],[100,'#354d44']]),
    gradient('bud', [[0,'#3f5748'],[33,'#84907a'],[60,'#b4af94'],[83,'#78836d'],[100,'#394f45']]),
    gradient('daisy', [[0,'#f2e9cb'],[25,'#e9e2c6'],[49,'#f2e5bf'],[73,'#dfd6b8'],[100,'#c3c2ac']]),
    gradient('daisy-back', [[0,'#c9c9b3'],[35,'#ddd9bd'],[57,'#c3bea1'],[100,'#9d9f8d']]),
    gradient('white-lily', [[0,'#f2ebd8'],[28,'#e5dec8'],[54,'#f1e8cc'],[82,'#d0cbb7'],[100,'#abaf9e']]),
    gradient('pink-lily', [[0,'#efd1c4'],[30,'#deb6b1'],[56,'#d7a8ae'],[78,'#cba1a7'],[100,'#a48d98']]),
    gradient('lily-back', [[0,'#d6d3bd'],[40,'#c1c2af'],[68,'#d5cbb4'],[100,'#989e91']]),
    gradient('pink-back', [[0,'#c4a1a7'],[40,'#ba959c'],[64,'#c6aaa8'],[100,'#99838d']]),
    gradient('throat', [[0,'#888657'],[29,'#c0ac74'],[60,'#e0c896'],[100,'#c3af85']], true),
    gradient('lavender', [[0,'#655b76'],[32,'#8e829d'],[68,'#afa5b4'],[100,'#736d87']]),
    gradient('gold', [[0,'#8e6f33'],[30,'#bd9950'],[64,'#ddbc6b'],[100,'#ad8c48']]),
    `<radialGradient id="${prefix}-disc" cx="${mirror?63:37}%" cy="27%" r="76%"><stop stop-color="#ecd18a"/><stop offset="40%" stop-color="#d7ae60"/><stop offset="79%" stop-color="#b2934d"/><stop offset="100%" stop-color="#83764c"/></radialGradient>`
  ].join('') + '</defs>';
}

function groupAt(x, y, angle, scaleX, scaleY, inside) {
  return `<g transform="translate(${point(x,y)}) rotate(${num(angle)}) scale(${point(scaleX,scaleY)})">${inside}</g>`;
}

// Curved leaf surface with two fields of engraved veins. The leaf's central
// ridge follows a quadratic curve instead of cutting across its silhouette.
function leaf(length, width, bend, prefix, shape = 'leaf', detail = true) {
  const at = (t, side) => {
    const daisy=shape==='daisy-leaf';
    const notch=daisy?1+.12*Math.sin(t*34+.7*side):1;
    const w=width*Math.pow(Math.max(0,Math.sin(Math.PI*t)),daisy?1.08:.91)*(daisy?.52+1.39*t:1.23-.48*t)*notch;
    const sweep=bend*(1.64*t*t-.64*t*t*t);
    return [sweep+side*w*(side>0?1.05:.9),-length*t+side*w*.17+Math.abs(bend)*t*t*t*.19];
  };
  const curve = (t,s) => point(...at(t,s));
  let d = 'M0 0';
  for (let i=1;i<=14;i++) d += 'L'+curve(i/14,1);
  for (let i=13;i>=0;i--) d += 'L'+curve(i/14,-1);
  let veins = `M0 0Q${curve(.42,0)} ${curve(1,0)}`;
  if (detail) {
    const count = shape === 'lance' ? 5 : 6;
    for (let k=1; k<count; k++) {
      const t = k / (count+1);
      for (const side of [-1,1]) veins += `M${curve(t,0)}Q${curve(t+.055,side*.52)} ${curve(Math.min(.98,t+.13),side*.86)}`;
    }
  }
  return `<path d="${d}Z" fill="${paint(prefix,shape==='daisy-leaf'?'leaf':shape)}" stroke="#293f38" stroke-width=".57" stroke-linejoin="round"/><path d="${veins}" fill="none" stroke="#b9c199" opacity=".37" stroke-width=".48" stroke-linecap="round"/>`;
}

function animatedPart(mark, grow, className, delay) {
  return grow ? `<g class="${className}" style="--unfold:${Math.round(delay)}ms">${mark}</g>` : mark;
}

// Project a cupped flower into the plane of the page. The last coordinate is
// height above the flower's face; a raised rim and a reflexed tip can overlap
// even when their radial distance is the same.
function surface(angle, tilt) {
  const sin = Math.sin(angle), cos = Math.cos(angle);
  const lift = Math.sqrt(1 - tilt*tilt);
  return (radius, across, rise) => [
    radius*cos - across*sin,
    (radius*sin + across*cos)*tilt - lift*rise
  ];
}

function daisy(rng, prefix, detail, grow) {
  const tilt=.62+rng()*.18, twist=rng()*.26;
  const count=24+Math.floor(rng()*4), rays=[];
  for(let i=0;i<count;i++){
    const a=twist+(i+.56*(rng()-.5))*Math.PI*2/count;
    const project=surface(a,tilt);
    const outer=i%2===0, length=(outer?32:29)+rng()*8;
    const width=2.7+rng()*1.4, bend=(rng()-.5)*6.5, rock=(rng()-.5)*3;
    const arch=4+rng()*3.6, droop=(outer?4.8:2.3)+rng()*5;
    const p=(t,w=0,lip=0)=>point(...project(
      4+length*t, bend*t*t+w*width,
      Math.sin(Math.PI*t)*arch - t*t*droop + w*rock*t + lip
    ));
    const edge=`M${p(0,-.18)}C${p(.21,-.55)} ${p(.62,-1.19)} ${p(.82,-1)}
      C${p(.903,-1.04)} ${p(.977,-.66)} ${p(.993,-.41)}
      Q${p(1.016,-.14)} ${p(.98,.025)}Q${p(1.027,.22)} ${p(.987,.48)}
      C${p(.965,.73)} ${p(.91,.99)} ${p(.82,1)}
      C${p(.54,1.04)} ${p(.16,.31)} ${p(0,.16)}Z`;
    const raised=!outer || Math.sin(a)<-.15;
    let mark=`<path d="${edge}" fill="${paint(prefix,raised?'daisy':'daisy-back')}" stroke="#777c68" stroke-opacity=".44" stroke-width=".39"/>`;
    if(detail){
      const trough=`M${p(.01,.04)}Q${p(.34,-.2)} ${p(.66,-.14)}T${p(.9,.01)}Q${p(.55,-.04,.6)} ${p(.02,.22)}Z`;
      const lip=`M${p(.12,.28)}C${p(.29,.56)} ${p(.65,.93)} ${p(.82,.98)}Q${p(.92,.96)} ${p(.975,.51)}Q${p(.8,.76)} ${p(.54,.58)}Z`;
      mark+=`<path d="${lip}" fill="#849183" opacity=".19"/><path d="${trough}" fill="#8d927c" opacity=".28"/><path d="M${p(.14,-.27)}Q${p(.43,-.65,.4)} ${p(.88,-.5)}" fill="none" stroke="#faf1d5" stroke-width=".43" opacity=".73"/>`;
    }
    rays.push({depth:Math.sin(a)*.48+(outer?-.72:.18), art:animatedPart(mark,grow,'b-petal',(outer?0:260)+270*(1+Math.sin(a))/2+rng()*220)});
  }
  rays.sort((a,b)=>a.depth-b.depth);
  const radius=8.2, ry=radius*tilt;
  let dark='',light='';
  const florets=detail?105:37;
  for(let i=0;i<florets;i++){
    const a=i*2.39996,r=Math.sqrt(i/florets)*radius*.94;
    const crown=2.8*Math.sqrt(1-r*r/(radius*radius));
    const x=Math.cos(a)*r,y=Math.sin(a)*r*tilt-crown;
    dark+=`M${point(x-.47,y+.25)}q.3 .55 .85 .16`;
    if(detail && i%2)light+=`M${point(x-.55,y-.27)}l.43 -.24`;
  }
  const bowl=`M${point(-radius,0)}C${point(-radius,-ry*1.57)} ${point(radius,-ry*1.54)} ${point(radius,0)}C${point(radius,ry*1.08)} ${point(-radius,ry*1.04)} ${point(-radius,0)}Z`;
  const disc=`<ellipse cy="1.35" rx="9" ry="${num(ry+.7)}" fill="#665c40" opacity=".42"/><path d="${bowl}" fill="${paint(prefix,'disc')}"/><path d="${dark}" fill="none" stroke="#836736" opacity=".70" stroke-width=".54"/><path d="${light}" fill="none" stroke="#f7d885" opacity=".76" stroke-linecap="round" stroke-width=".57"/>`;
  return rays.map(ray=>ray.art).join('')+animatedPart(disc,grow,'b-disc',630);
}

function lily(rng, prefix, detail, grow, pink) {
  const tilt=.54+rng()*.19, twist=(rng()-.5)*.58;
  const petals=[];
  for(let i=0;i<6;i++){
    const broad=i%2===1;
    const a=twist+(i*60-85+(rng()-.5)*11)*Math.PI/180, project=surface(a,tilt);
    const reach=35+rng()*6+(broad?0:2.4), breadth=(broad?12:9)+rng()*2;
    const curl=5+rng()*8, bend=(rng()-.5)*12, roll=(rng()-.5)*8;
    // The tepal opens into a trumpet before its tip curls back underneath.
    const p=(t,w=0)=>{
      const width=Math.pow(Math.max(0,Math.sin(Math.PI*t)),.88)*breadth;
      const reflex=Math.max(0,(t-.7)/.3);
      const radius=reach*t+4*t*t - reflex*reflex*(2+curl*.27);
      const rise=14*Math.sin(Math.PI*t*.83)-reflex*reflex*curl;
      return point(...project(radius,bend*t*t+w*width,rise+w*w*3.2*Math.sin(Math.PI*t)+w*roll*t));
    };
    const edge=`M${p(0)}C${p(.12,-.6)} ${p(.36,-1.12)} ${p(.56,-1)}
      S${p(.87,-1)} ${p(1)}Q${p(.97,.55)} ${p(.88,.78)}
      C${p(.71,1.17)} ${p(.45,1.06)} ${p(.32,.87)}S${p(.08,.53)} ${p(0)}Z`;
    const fill=pink?(broad?'pink-lily':'pink-back'):(broad?'white-lily':'lily-back');
    let mark=`<path d="${edge}" fill="${paint(prefix,fill)}" stroke="${pink?'#846674':'#878776'}" stroke-opacity=".68" stroke-width=".50"/>`;
    mark+=`<path d="M${p(.018)}Q${p(.28,-.58)} ${p(.56,-.81)}Q${p(.84,-.82)} ${p(.99)}Q${p(.76,-.47)} ${p(.55,-.34)}Q${p(.26,-.18)} ${p(.018)}Z" fill="${pink?'#9f7584':'#9b9d88'}" opacity=".21"/>
      <path d="M${p(.008)}Q${p(.3,-.18)} ${p(.6,-.03)}Q${p(.28,.21)} ${p(.008)}Z" fill="${paint(prefix,'throat')}" opacity=".79"/>
      <path d="M${p(.76,-.91)}Q${p(.94,-.55)} ${p(1)}Q${p(.96,-.07)} ${p(.86,-.46)}Z" fill="${pink?'#ac7d8a':'#a4a091'}" opacity=".71"/>`;
    if(detail){
      let veins='', freckles='';
      for(const fraction of [-.65,-.3,.32,.67])
        veins+=`M${p(.08,fraction*.42)}Q${p(.34,fraction*1.11)} ${p(.58,fraction)}T${p(.89,fraction*.82)}`;
      for(let j=0;j<14;j++){
        const t=.12+rng()*.38,w=(rng()-.5)*(t*1.32+.45);
        freckles+=`M${p(t,w)}L${p(t+.012,w)}`;
      }
      mark+=`<path d="${veins}" fill="none" stroke="${pink?'#a97584':'#9c9886'}" opacity=".49" stroke-width=".43"/>
        <path d="${freckles}" fill="none" stroke="${pink?'#985f70':'#a19675'}" stroke-linecap="round" stroke-width=".74"/>`;
    }
    const depth=Math.sin(a)+(broad?.33:0);
    petals.push({depth,art:animatedPart(mark,grow,'b-petal',(broad?430:130)+190*(1+depth)+rng()*140)});
  }
  petals.sort((x,y)=>x.depth-y.depth);
  let stamens='';
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3+twist,dx=Math.cos(a)*(10+rng()*4),dy=Math.sin(a)*(6.8+rng()*3)-12;
    stamens+=`<path d="M0 0Q${point(dx*.47,dy*.37+1)} ${point(dx,dy)}" fill="none" stroke="#bdb686" stroke-width="1.05"/><ellipse transform="translate(${point(dx,dy)}) rotate(${num(-66+Math.sin(a)*41)})" rx="1.24" ry="3.18" fill="#9a794e" stroke="#786544" stroke-width=".43"/>`;
  }
  stamens+='<path d="M0 0Q1 -10 -2 -20" fill="none" stroke="#a7ad78" stroke-width="1.32"/><path d="M-1.8 -19.7q-2.3 .4-2.3-1.3-.1-1.5 1.6-1.4.8-1.7 2.1-.7 1.5.6.9 2-.5 1.3-2.3 1.4Z" fill="#b2b58a"/>';
  return petals.map(petal=>petal.art).join('')+animatedPart(stamens,grow,'b-disc',920);
}

function flowerBud(prefix) {
  return `<path d="M0 1C-7 -7 -11 -16 -7 -29Q-1 -40 3 -43C6 -30 14 -21 9 -12Q6 -4 0 1Z" fill="${paint(prefix,'bud')}" stroke="#596856" stroke-width=".74"/><path d="M0 1Q-4 -13 3 -43M0 1Q8 -15 4 -34M-1 -2Q-9 -17 -3 -31" fill="none" stroke="#526652" stroke-width=".65"/><path d="M0 1Q-10 -6 -10 -15Q-4 -11 0 -3Q6 -6 11 -18Q11 -6 0 1Z" fill="${paint(prefix,'lance')}"/>`;
}

function daisyBud(prefix) {
  return `<path d="M-6.6 -2Q-11 -9.2 -6.4 -14.2Q-2.1 -18.4 3.4 -16Q9.7 -13.9 7.4 -6.7L2 .7Z" fill="${paint(prefix,'daisy-back')}" stroke="#7e8774" stroke-width=".55"/><path d="M-5.2 -11.6q-.7-3 1-4.2m2.7 3.1q-.1-2.7 1.5-4.1m1.2 4.8q.9-3 2-3.5" fill="none" stroke="#929a80" stroke-width=".69"/><path d="M0 2.5Q-8.9 .2 -8.5 -9.1Q-6.5 -6.5 -5 -4.8Q-8 -13.3 -6.9 -13.7Q-2.9 -11 -2.3 -5.9Q-2.5 -12.5 -.7 -13.5Q2.3 -9.6 1.4 -5.4Q4.5 -11.3 7.6 -11.4Q6.2 -.4 0 2.5Z" fill="${paint(prefix,'lance')}" stroke="#526955" stroke-width=".54"/>`;
}

function florets(rng, prefix, detail, lavender) {
  if(lavender) {
    let out='<path d="M0 1Q3 -12 1 -34" fill="none" stroke="#64765d" stroke-width="1.05"/>';
    for(let j=0;j<7;j++) for(const s of [-1,1]) {
      const t=j/7, x=(1-t)*s*1.3+1, y=-j*4.5, a=s*(28+rng()*19);
      const flower=`<path d="M0 2C-1.9 -1 -3.2 -3.9 -2.7 -6.1Q-3.5 -7.4 -2.1 -7.3Q-2.3 -9 -.9 -8.1Q.4 -10.1 1 -8.5Q3 -8.6 2.3 -6Q3 -2 .2 1.6Z" fill="${paint(prefix,'lavender')}" stroke="#6c6675" stroke-width=".44"/><path d="M0 1Q-1 -2.1 -1.2 -5.8" stroke="#c3b6c6" stroke-width=".42" fill="none"/>`;
      out+=groupAt(x,y,a,1-t*.5,1-t*.4,flower);
    }
    return out;
  }
  const count=5;
  let petals='';
  for(let i=0;i<count;i++) {
    petals+=`<path transform="rotate(${num(i*72+rng()*13)})" d="M0 0C-1 -1.1 -4.9 -1.7 -4 -4.6Q-4 -6.8 -1.5 -6Q-.7 -8.2 1.3 -6.9Q4.5 -5.8 3.5 -3.9Q2.8 -1.4 0 0Z" fill="#e8e2c7" stroke="#a7a78e" stroke-width=".35"/>`;
  }
  return petals+`<circle r="1.4" fill="${paint(prefix,'gold')}"/>`;
}

export function flowerHead(type, options={}) {
  const {seed=1,prefix='bot',detail=true,grow=false}=options;
  const rng=seeded(seed);
  if(type==='white-lily'||type==='pink-lily') return lily(rng,prefix,detail,grow,type==='pink-lily');
  if(type==='bud') return flowerBud(prefix);
  if(type==='daisy-bud') return daisyBud(prefix);
  if(type==='lavender'||type==='breath'||type==='wildflower') return florets(rng,prefix,detail,type==='lavender');
  if(type==='fern'||type==='foliage') return leaf(40,11,12,prefix,'leaf',detail);
  return daisy(rng,prefix,detail,grow);
}

function stemPath(tipX, tipY, swing, thickness, grow) {
  const d=`M0 0C${point(swing,-52)} ${point(tipX-swing,-105)} ${point(tipX,tipY)}`;
  const attrs=grow?' class="b-stem" pathLength="1"':'';
  return `<g fill="none" stroke-linecap="round"><path${attrs} d="${d}" stroke="#304d40" stroke-width="${thickness}"/><path${attrs} d="${d}" stroke="#8d9b7c" stroke-width="${num(thickness*.57)}"/><path${attrs} d="${d}" stroke="#bec0a0" stroke-width="${num(thickness*.2)}"/></g>`;
}

function fern(rng,prefix,detail) {
  const bend=(rng()-.5)*57;
  const yLen=135+rng()*30;
  const pos=t=>[bend*t*t,-yLen*t];
  let leaves='',veins='';
  for(let k=0;k<15;k++) {
    const t=.12+k*.057, [x,y]=pos(t);
    for(const side of [-1,1]) {
      const span=(11+Math.sin(t*Math.PI)*23)*(1-t*.8)*(1+rng()*.15);
      const tipX=x+side*span,tipY=y-span*(.41+t*.32);
      let d=`M${point(x,y)}`;
      // Pinnae have a serrated edge tapering progressively to the tip.
      const p=(q,w)=>point(x+side*span*q, y+(tipY-y)*q-Math.sin(q*Math.PI)*w);
      for(let n=1;n<=7;n++) d+=`L${p((n-.63)/7,span*.21)}L${p((n-.28)/7,span*.12)}`;
      d+='L'+point(tipX,tipY);
      for(let n=6;n>=1;n--) d+=`L${p((n+.14)/7,-span*.13)}L${p((n-.25)/7,-span*.075)}`;
      leaves+=d+'Z';
      veins+=`M${point(x,y)}Q${point(x+side*span*.52,y+(tipY-y)*.37)} ${point(tipX,tipY)}`;
      if(detail) for(let j=1;j<6;j++) {
        const t2=j/7;
        veins+=`M${p(t2,.45)}L${p(Math.min(.99,t2+.045),span*.16)}`;
      }
    }
  }
  return `<path d="${leaves}" fill="${paint(prefix,'fern')}" stroke="#395246" stroke-width=".48" stroke-linejoin="round"/><path d="${veins}" fill="none" stroke="#a8af89" stroke-width=".44" opacity=".68"/><path d="M0 0Q0 ${num(-yLen*.5)} ${point(bend,-yLen)}" fill="none" stroke="#829379" stroke-width="1.16"/>`;
}

function blossomBranches(rng,prefix,detail,wild) {
  let twigs='', heads='';
  const total=wild?7:13;
  for(let j=0;j<total;j++){
    const branchY=-40-(j/total)*95, sign=j%2?-1:1;
    const run=sign*(7+Math.sin(Math.PI*j/total)*21+rng()*8);
    const endY=branchY-14-rng()*18;
    twigs+=`M0 ${num(branchY)}Q${point(run*.8,branchY-8)} ${point(run,endY)}`;
    const cluster=wild?1:3;
    for(let b=0;b<cluster;b++) {
      const xx=run+(b-1)*(5+rng()*3), yy=endY-4-rng()*8;
      twigs+=`M${point(run,endY)}Q${point(xx,endY-3)} ${point(xx,yy)}`;
      const size=wild?.75+rng()*.37:.25+rng()*.24;
      heads+=groupAt(xx,yy,rng()*72,size,size*.88,florets(rng,prefix,detail,false));
    }
  }
  const tipSize=wild?.82:.39;
  heads+=groupAt(0,-150,-13,tipSize,tipSize,florets(rng,prefix,detail,false));
  return `<path d="M0 0Q1 -75 0 -150${twigs}" fill="none" stroke="#8d9c80" stroke-width=".95"/>${heads}`;
}

export function sprig(type, options={}) {
  const {seed=1,prefix='bot',detail=true,grow=false}=options;
  const rng=seeded(seed);
  if(type==='fern') return fern(rng,prefix,detail);
  if(type==='breath'||type==='wildflower') return blossomBranches(rng,prefix,detail,type==='wildflower');
  const tipX=(rng()-.5)*28, tipY=-158+(rng()-.5)*11, swing=(rng()-.5)*38;
  const lilyType=type.includes('lily')||type==='bud';
  const angular=type==='foliage', lavender=type==='lavender';
  const count=angular?8:lilyType?6:lavender?5:4;
  let body=stemPath(tipX,tipY,swing,lilyType?2.8:2.05,grow);
  for(let i=0;i<count;i++) {
    const t=.13+(i/count)*.67;
    const x=3*(1-t)*(1-t)*t*swing+3*(1-t)*t*t*(tipX-swing)+t*t*t*tipX;
    const y=3*(1-t)*(1-t)*t*(-52)+3*(1-t)*t*t*(-105)+t*t*t*tipY;
    const sign=i%2===0?-1:1, angle=sign*(25+rng()*29);
    const length=(angular?53:lilyType?52:lavender?29:37)*(1-t*.63)*(.8+rng()*.4);
    const width=length*(angular?.24:lilyType?.10:lavender?.068:.155);
    const shape=type==='daisy'?'daisy-leaf':lilyType||lavender?'lance':'leaf';
    const mark=leaf(length,width,sign*length*(.18+rng()*.42),prefix,shape,detail);
    body+=groupAt(x,y,angle,.62+rng()*.49,1,animatedPart(mark,grow,'b-leaf',t*640));
  }
  if(angular) {
    return body+groupAt(tipX,tipY,9,1,1,leaf(23,5,4,prefix,'leaf',detail));
  }
  const tilt=(rng()-.5)*(lilyType?38:32);
  const head=flowerHead(type,{prefix, seed:seed+73,detail,grow});
  if(grow) body+=groupAt(tipX,tipY,tilt,.86,.86,`<g class="b-bud">${type==='daisy'?daisyBud(prefix):flowerBud(prefix)}</g>`);
  return body+groupAt(tipX,tipY,tilt,1,1,grow?`<g class="b-nod">${head}</g>`:head);
}
