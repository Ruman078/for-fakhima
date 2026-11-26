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

export function botanicalDefs(prefix = 'bot') {
  function gradient(name, colors, vertical = false) {
    const stops = colors.map(([position, color]) =>
      `<stop offset="${position}%" stop-color="${color}"/>`).join('');
    return `<linearGradient id="${prefix}-${name}" x1="0%" y1="${vertical ? 100 : 15}%" x2="${vertical ? 17 : 100}%" y2="${vertical ? 0 : 75}%">${stops}</linearGradient>`;
  }
  return '<defs>' + [
    gradient('leaf', [[0,'#253e38'],[37,'#446455'],[51,'#607764'],[54,'#3a5548'],[100,'#293f39']]),
    gradient('lance', [[0,'#405c52'],[46,'#82917c'],[49,'#526c5f'],[100,'#263e37']]),
    gradient('fern', [[0,'#314c41'],[57,'#728374'],[100,'#354d44']]),
    gradient('bud', [[0,'#3f5748'],[33,'#84907a'],[60,'#b4af94'],[83,'#78836d'],[100,'#394f45']]),
    gradient('daisy', [[0,'#b0a68d'],[17,'#d6cfb2'],[47,'#f3ecd0'],[72,'#e8e2c6'],[100,'#a49985']]),
    gradient('daisy-back', [[0,'#8a8879'],[41,'#c3c0a9'],[64,'#dad6bb'],[100,'#9c9886']]),
    gradient('white-lily', [[0,'#a49a88'],[27,'#dfd8c2'],[45,'#f2ebd8'],[60,'#d8cfbc'],[78,'#dfdac8'],[100,'#afa797']]),
    gradient('pink-lily', [[0,'#a1767f'],[30,'#d6b0ac'],[46,'#e6c6bd'],[56,'#b98896'],[80,'#d8b9ae'],[100,'#a6848a']]),
    gradient('lily-back', [[0,'#938d80'],[38,'#c2baa9'],[61,'#d3c9b6'],[100,'#a3988b']]),
    gradient('pink-back', [[0,'#8d6972'],[42,'#bc9496'],[65,'#d0aaa6'],[100,'#967480']]),
    gradient('throat', [[0,'#888657'],[29,'#c0ac74'],[60,'#e0c896'],[100,'#c3af85']], true),
    gradient('lavender', [[0,'#655b76'],[32,'#8e829d'],[68,'#afa5b4'],[100,'#736d87']]),
    gradient('gold', [[0,'#8e6f33'],[30,'#bd9950'],[64,'#ddbc6b'],[100,'#ad8c48']]),
    `<radialGradient id="${prefix}-disc" cx="38%" cy="30%" r="75%"><stop stop-color="#e7c97d"/><stop offset="48%" stop-color="#c7a65e"/><stop offset="85%" stop-color="#a38c4d"/><stop offset="100%" stop-color="#7b744f"/></radialGradient>`
  ].join('') + '</defs>';
}

function groupAt(x, y, angle, scaleX, scaleY, inside) {
  return `<g transform="translate(${point(x,y)}) rotate(${num(angle)}) scale(${point(scaleX,scaleY)})">${inside}</g>`;
}

// Curved leaf surface with two fields of engraved veins. The leaf's central
// ridge follows a quadratic curve instead of cutting across its silhouette.
function leaf(length, width, bend, prefix, shape = 'leaf', detail = true) {
  const at = (t, side) => {
    const w = width * Math.pow(Math.max(0, Math.sin(Math.PI*t)), .89) * (1.28-.48*t);
    return [bend*t*t + side*w, -length*t + side*w*.12];
  };
  const curve = (t,s) => point(...at(t,s));
  let d = 'M0 0';
  for (let i=1;i<=14;i++) d += 'L'+curve(i/14,1);
  for (let i=13;i>=0;i--) d += 'L'+curve(i/14,-1);
  let veins = `M0 0Q0 ${num(-length*.5)} ${curve(1,0)}`;
  if (detail) {
    const count = shape === 'lance' ? 6 : 9;
    for (let k=1; k<count; k++) {
      const t = k / (count+1);
      for (const side of [-1,1]) veins += `M${curve(t,0)}Q${curve(t+.055,side*.52)} ${curve(Math.min(.98,t+.13),side*.86)}`;
    }
  }
  return `<path d="${d}Z" fill="${paint(prefix,shape)}" stroke="#293f38" stroke-width=".6" stroke-linejoin="round"/><path d="${veins}" fill="none" stroke="#bec2a0" opacity=".48" stroke-width=".48" stroke-linecap="round"/>`;
}

function animatedPart(mark, grow, className, delay) {
  return grow ? `<g class="${className}" style="--unfold:${Math.round(delay)}ms">${mark}</g>` : mark;
}

function daisy(rng, prefix, detail, grow) {
  let corolla = '';
  for (let tier=0; tier<2; tier++) {
    const count = tier === 0 ? 16 : 15;
    for (let i=0;i<count;i++) {
      const angle = i*360/count + (tier ? 10 : 0) + rng()*6;
      const length = (tier === 0 ? 30 : 33) + rng()*8;
      const width = (tier === 0 ? 3.6 : 3.3) + rng()*1.8;
      const bend = (rng()-.5)*9;
      const tip = -length;
      const d = `M-1.1 -3C${point(-width*.7,-length*.32)} ${point(bend-width*1.2,-length*.69)} ${point(bend-width*.9,tip+3)}Q${point(bend-width*.5,tip-.65)} ${point(bend-.75,tip+.6)}Q${point(bend+width*.3,tip-1.2)} ${point(bend+width*.83,tip+2)}C${point(bend+width*1.5,-length*.65)} ${point(width*.36,-length*.24)} 1.1 -3Z`;
      let mark = `<path d="${d}" fill="${paint(prefix,tier ? 'daisy':'daisy-back')}" stroke="#706e5f" stroke-width=".43"/>`;
      if (detail) mark += `<path d="M0 -6Q${point(bend+1,-length*.62)} ${point(bend,tip+3)}M-1 -8Q${point(bend-width*.55,-length*.63)} ${point(bend-width*.58,tip+4)}" fill="none" stroke="#8a8774" opacity=".47" stroke-width=".39"/>`;
      corolla += `<g transform="rotate(${num(angle)})">${animatedPart(mark,grow,'b-petal',tier*330+i*28+rng()*145)}</g>`;
    }
  }
  let specks = '';
  // The golden-angle spiral describes the florets at the daisy's centre.
  for(let i=0;i<(detail ? 96 : 32);i++){
    const a=i*2.39996, r=7.1*Math.sqrt(i/(detail ? 96:32));
    const x=Math.cos(a)*r,y=Math.sin(a)*r;
    specks += `M${point(x-.33,y+.23)}q.08 -.86 .68 -.59`;
  }
  const disc = `<ellipse rx="8.3" ry="7.7" fill="${paint(prefix,'disc')}" stroke="#847647" stroke-width=".65"/><path d="${specks}" fill="none" stroke="#78693e" opacity=".8" stroke-width=".55"/>`;
  return `<g transform="scale(1 .91)">${corolla}${animatedPart(disc,grow,'b-disc',800)}</g>`;
}

function lily(rng, prefix, detail, grow, pink) {
  let petals='';
  // Each tepal has a swept inner ridge, spotted throat, and a curling edge
  // whose underside is visible at the tip.
  for(let ring=0;ring<2;ring++) {
    for(let i=0;i<3;i++) {
      const length=39+rng()*10+(ring?0:3), w=(ring?12.6:10.7)+rng()*3;
      const side = (rng()<.5?-1:1);
      const curl = (5+rng()*9)*side;
      const pos = (x,y)=>point(x*w,y*length);
      const tip = point(curl,-length);
      const d = `M-2 2C${pos(-.16,-.15)} ${pos(-.96,-.34)} ${pos(-.96,-.54)}C${pos(-1.05,-.75)} ${point(curl-w*.48,-length+5)} ${tip}Q${point(curl+3.8,-length-2.2)} ${point(curl+5.1,-length+3.4)}C${point(curl+.8,-length+1.7)} ${pos(.76,-.82)} ${pos(.91,-.63)}C${pos(1.1,-.39)} ${pos(.33,-.17)} 2.2 1.7Z`;
      const fill = pink ? (ring?'pink-lily':'pink-back') : (ring?'white-lily':'lily-back');
      let mark=`<path d="${d}" fill="${paint(prefix,fill)}" stroke="${pink?'#846b72':'#888577'}" stroke-width=".52" stroke-linejoin="round"/><path d="M-1.5 0Q${pos(-.1,-.4)} ${pos(.04,-.60)}Q${pos(.23,-.34)} 1.7 0Z" fill="${paint(prefix,'throat')}" opacity=".86"/><path d="M${tip}q3.8 -2.2 5.1 3.4q-2.8 -1.5 -5.1 -3.4Z" fill="${pink?'#ae868e':'#baada1'}"/>`;
      if(detail) {
        let veins='';
        for (let v=-3;v<=3;v++) {
          const offset=v/3;
          veins += `M${pos(offset*.06,-.10)}Q${pos(offset*1.37,-.76)} ${point(curl+offset*2,-length+3+Math.abs(v)*1.3)}`;
        }
        mark+=`<path d="${veins}" fill="none" stroke="${pink?'#99767d':'#9c9888'}" stroke-width=".4" opacity=".64"/>`;
        let spots='';
        for(let k=0;k<13;k++) {
          const yy=.22+rng()*.38,xx=(rng()-.5)*w*(yy+.12);
          spots+=`M${point(xx,-yy*length)}l.07 -.46`;
        }
        mark+=`<path d="${spots}" fill="none" stroke-linecap="round" stroke="${pink?'#885e68':'#a29572'}" stroke-width=".77"/>`;
      }
      const angle= (ring ? 26: -33)+i*120 + (rng()-.5)*14;
      petals+=`<g transform="rotate(${num(angle)})">${animatedPart(mark,grow,'b-petal',ring*440+i*184+rng()*140)}</g>`;
    }
  }
  let stamens='';
  for(let i=0;i<6;i++) {
    const a=(-140+i*52+rng()*15)*Math.PI/180;
    const x=Math.cos(a)*(12+rng()*6), y=Math.sin(a)*(10+rng()*4)-4.5;
    stamens += `<path d="M0 .5Q${point(x*.75,y*.22-2)} ${point(x,y)}" fill="none" stroke="#a69868" stroke-width="1.05"/><path d="M0 -.2Q${point(x*.76,y*.23-2.45)} ${point(x,y-.58)}" fill="none" stroke="#efe3bd" stroke-width=".42"/><ellipse transform="translate(${point(x,y)}) rotate(${num(24+i*25)})" rx="1.45" ry="3.48" fill="#a38359" stroke="#695c45" stroke-width=".52"/>`;
  }
  stamens+='<path d="M0 .5Q-2 -7 3 -15" fill="none" stroke="#a9ab77" stroke-width="1.55"/><path d="M1.7 -15q-1.4 -2 1 -2.2q1.9 -1.4 2.4 .7q2 1.7 .2 2.2q-2 .9 -3.6 -.7Z" fill="#bbc098" stroke="#808759" stroke-width=".48"/>';
  return `<g transform="scale(1 .86)">${petals}${animatedPart(stamens,grow,'b-disc',1040)}</g>`;
}

function flowerBud(prefix) {
  return `<path d="M0 1C-7 -7 -11 -16 -7 -29Q-1 -40 3 -43C6 -30 14 -21 9 -12Q6 -4 0 1Z" fill="${paint(prefix,'bud')}" stroke="#596856" stroke-width=".74"/><path d="M0 1Q-4 -13 3 -43M0 1Q8 -15 4 -34M-1 -2Q-9 -17 -3 -31" fill="none" stroke="#526652" stroke-width=".65"/><path d="M0 1Q-10 -6 -10 -15Q-4 -11 0 -3Q6 -6 11 -18Q11 -6 0 1Z" fill="${paint(prefix,'lance')}"/>`;
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
  const tipX=(rng()-.5)*18, tipY=-158+(rng()-.5)*11, swing=(rng()-.5)*25;
  const lilyType=type.includes('lily')||type==='bud';
  const angular=type==='foliage', lavender=type==='lavender';
  const count=angular?10:lilyType?7:lavender?5:4;
  let body=stemPath(tipX,tipY,swing,lilyType?2.8:2.05,grow);
  for(let i=0;i<count;i++) {
    const t=.13+(i/count)*.67;
    const x=3*(1-t)*(1-t)*t*swing+3*(1-t)*t*t*(tipX-swing)+t*t*t*tipX;
    const y=3*(1-t)*(1-t)*t*(-52)+3*(1-t)*t*t*(-105)+t*t*t*tipY;
    const sign=i%2===0?-1:1, angle=sign*(34+rng()*28);
    const length=(angular?53:lilyType?52:lavender?29:37)*(1-t*.63)*(.8+rng()*.4);
    const width=length*(angular?.24:lilyType?.10:lavender?.068:.155);
    const mark=leaf(length,width,sign*length*(.16+rng()*.28),prefix,lilyType||lavender?'lance':'leaf',detail);
    body+=groupAt(x,y,angle,1,1,animatedPart(mark,grow,'b-leaf',t*640));
  }
  if(angular) {
    return body+groupAt(tipX,tipY,9,1,1,leaf(23,5,4,prefix,'leaf',detail));
  }
  const tilt=(rng()-.5)*(lilyType?38:32);
  const head=flowerHead(type,{prefix, seed:seed+73,detail,grow});
  if(grow) body+=groupAt(tipX,tipY,tilt,.55,.55,`<g class="b-bud">${flowerBud(prefix)}</g>`);
  return body+groupAt(tipX,tipY,tilt,1,1,head);
}
