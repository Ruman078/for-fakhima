import { seeded, sprig } from './botany.js';

const n = v => Number(v.toFixed(2));
const pt = (x,y) => n(x)+' '+n(y);
const use = (id,x,y,s=1,angle=0,flat=s) => `<use href="#ks-${id}" xlink:href="#ks-${id}" transform="translate(${pt(x,y)}) rotate(${n(angle)}) scale(${pt(s,flat)})"/>`;
const line = (d,ink,weight=1,opacity=1) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${n(weight)}" opacity="${n(opacity)}" stroke-linecap="round" stroke-linejoin="round"/>`;

// A strawberry leaf has three toothed leaflets. The vein forks meet its teeth.
function leaflet() {
  const mid=t=>4*Math.sin(t*2.3)-t*1.5;
  const side=(t,sign,depth=1)=>pt(mid(t)+sign*(sign>0?10.9:9.2)*Math.pow(Math.sin(Math.PI*t),.79)*(.78+.4*t)*depth,-32*t);
  let outline='M0 0',veins='';
  for (const sign of [1,-1]) {
    for(let j=0;j<9;j++) {
      const t=sign===1?j:8-j;
      outline+='L'+side((t+(sign===1?.3:.85))/9,sign,.84)+'L'+side((t+(sign===1?.85:.3))/9,sign,1.05);
      if(t>0)veins+=`M${pt(mid(t/9),-32*(t-.6)/9)}Q${side((t+.10)/9,sign,.51)} ${side((t+.82)/9,sign,.95)}`;
    }
    if(sign===1)outline+='L1.8 -32';
  }
  return `<g id="ks-leaflet"><path d="${outline}Z" fill="url(#ks-berry-leaf)" stroke="#233c30" stroke-width=".48"/>${line(veins,'#a2ad7e',.43,.69)}${line('M0 0Q3.9 -15 1.5 -31','#c2bd8b',.64,.73)}</g>`;
}

function fruit() {
  let seeds='', glints='';
  for(let row=0;row<5;row++) {
    const cols=[4,5,4,3,2][row];
    for(let j=0;j<cols;j++){
      const x=(j-(cols-1)/2)*(4.5-row*.1)+(row%2?.35:-.15);
      const y=-5+row*4.25+.8*Math.abs(x)/4;
      seeds+=`M${pt(x,y)}q-.5 .8 -.35 1.55`;
      glints+=`M${pt(x-.25,y+.38)}l.05 .45`;
    }
  }
  const body='M.5 -8.8C4.9 -12.9 13.7 -10.4 13.7 -2.6C14 4.4 7.1 14.8 1.1 18.3C-1.8 19.3 -11.3 8.4 -13.1 2.2C-16 -6.7 -9.6 -13.1 -3.1 -10.4Z';
  return `<g id="ks-ripe"><path d="${body}" fill="url(#ks-fruit)" stroke="#6d423b" stroke-width=".85"/>${line(seeds,'#703d3d',1.3)}${line(glints,'#f2cf8c',.94)}<path d="M-.8 -9.3q-6.6 -5.1 -10.1 -2 4.7 .3 6.1 3.2-5.6 -.5-7.1 4.4 5.1-3 8.9-3-2.5 3.5-.9 6.3 1.9-4.6 5.2-6.4 3.6.1 7.3 2.5-1.1-3.6-5.7-5 3-.9 5.6-1.1-4.6-2.1-7.1-.2" fill="#879565" stroke="#63774f" stroke-width=".65"/>${line('M-.5 -8.5Q-1.7 -14.8 1 -18','#8a9364',1.15)}</g>
  <g id="ks-greenberry"><path d="${body}" fill="url(#ks-unripe)" stroke="#84916a" stroke-width=".8"/>${line(seeds,'#627a56',1)}${line('M-9 -9Q-6 -13 -1 -9Q3 -13 8 -9M-1 -9Q-3 -14 -1 -17','#a7a578',1.5)}</g>`;
}

function strawberryBlossom(){
  return `<g id="ks-berry-flower">${Array.from({length:5},(_,i)=>`<path transform="rotate(${i*72})" d="M0 .3C-4.1 -1.5-5.5 -5.8-4 -7.7Q-2 -10.3 .2 -8.4Q3.4 -10.1 4 -7.4C5.2 -4.9 2.8 -1 .5 .2Z" fill="#f1e8c9" stroke="#bdb89d" stroke-width=".52"/>`).join('')}<circle r="2.6" fill="#d7ae5e"/><path d="m-.9 -.2 .6-.9m1.1 1 .3-.7" stroke="#92764a" stroke-width=".55"/></g>`;
}

export function strawberryGardenDefs(includePlanting=true) {
  const botanical=includePlanting?['fern','foliage','lavender','breath','daisy','wildflower','bud','white-lily','pink-lily']:[];
  const ink=seeded(1011);
  let pale='',dark='';
  for(let i=0;i<228;i++){
    const x=ink()*76,y=ink()*76,span=.28+ink()*2;
    if(i%3)dark+=`M${pt(x,y)}l${pt(span,-span*.32)}`;
    else pale+=`M${pt(x,y)}l${pt(span*.55,-span*.18)}`;
  }
  return `<defs>
    <linearGradient id="ks-berry-leaf" x2="1" y2=".35"><stop stop-color="#365345"/><stop offset=".39" stop-color="#748767"/><stop offset=".54" stop-color="#506e51"/><stop offset=".83" stop-color="#44634a"/><stop offset="1" stop-color="#304d3c"/></linearGradient>
    <radialGradient id="ks-fruit" cx=".31" cy=".23" r=".91"><stop stop-color="#f3aa89"/><stop offset=".36" stop-color="#cd7764"/><stop offset=".72" stop-color="#ad554b"/><stop offset="1" stop-color="#803e3c"/></radialGradient>
    <linearGradient id="ks-unripe" x2="1" y2="1"><stop stop-color="#e7d7ad"/><stop offset=".48" stop-color="#c9c29b"/><stop offset="1" stop-color="#90a078"/></linearGradient>
    <linearGradient id="ks-lawn" x2=".04" y2="1"><stop stop-color="#536b58"/><stop offset=".17" stop-color="#495f4b"/><stop offset=".56" stop-color="#334c3c"/><stop offset="1" stop-color="#233d30"/></linearGradient>
    <linearGradient id="ks-walk" x2=".12" y2="1"><stop stop-color="#7a806a"/><stop offset=".28" stop-color="#777964"/><stop offset=".72" stop-color="#6e6e55"/><stop offset="1" stop-color="#494f3c"/></linearGradient>
    <radialGradient id="ks-horizon-light" cx=".48" cy=".71" r=".51"><stop stop-color="#e2c293" stop-opacity=".30"/><stop offset=".47" stop-color="#bda681" stop-opacity=".16"/><stop offset="1" stop-color="#b09a79" stop-opacity="0"/></radialGradient>
    <radialGradient id="ks-ground-moss"><stop stop-color="#152e27" stop-opacity=".53"/><stop offset="1" stop-color="#263d2f" stop-opacity="0"/></radialGradient>
    <radialGradient id="ks-meadow-brush" cx=".36" cy=".42" r=".63"><stop stop-color="#7d8966" stop-opacity=".42"/><stop offset=".47" stop-color="#687e5a" stop-opacity=".27"/><stop offset="1" stop-color="#647b59" stop-opacity="0"/></radialGradient>
    <pattern id="ks-garden-ink" width="76" height="76" patternUnits="userSpaceOnUse">${line(dark,'#20362d',.58,.38)}${line(pale,'#ded5a9',.59,.56)}</pattern>
    <linearGradient id="ks-footer-shade" x2="0" y2="1"><stop stop-color="#183429" stop-opacity="0"/><stop offset="1" stop-color="#19342c"/></linearGradient>
    ${leaflet()} ${fruit()} ${strawberryBlossom()}
    <g id="ks-leaf-fan">${use('leaflet',1,0,.88,57,.66)}${use('leaflet',-1,0,.94,-47,.79)}${use('leaflet',0,.5,1.04,6,.96)}</g>
    <g id="ks-strawberry-plant">${line('M0 1Q-3 -12 -17 -23M0 1Q13 -9 19 -18M0 1Q1 -22 2 -33','#718160',1.25)}${use('leaf-fan',-17,-23,.62,-61,.47)}${use('leaf-fan',19,-18,.72,64,.57)}${use('leaf-fan',2,-33,.72,-13,.56)}</g>
    ${includePlanting?[0,1,2].map(i=>meadowGrass(i)+treeCrown(i)).join(''):''}
    ${botanical.map((type,i)=>`<g id="ks-border-${type}">${sprig(type,{seed:82+i*7,prefix:'ks-bot',detail:type!=='breath'})}</g>`).join('')}
    </defs>`;
}

export function berryCluster(){
  let art=line('M-33 65C-39 43-24 9-12-14S8-29 5-7M-25 32Q-10 -3 19 -4M-15 1Q-28 -25-43 -27','#394f3a',2.8);
  art+=line('M-33 64C-37 41-22 7-12-14S8-27 5-7M-25 32Q-10 -4 19 -4M-16 2Q-28 -25-43 -27','#a0a47b',1.25);
  art+=use('leaf-fan',-33,34,.94,-42)+use('leaf-fan',-11,-16,.78,27)+use('berry-flower',-40,-25,.74,-12);
  art+=`<g class="ks-berries">${use('greenberry',-16,-5,.61,-16)}${use('ripe',18,3,.81,-15)}${use('ripe',-.6,7,1.03,12)}</g>`;
  return art;
}

const pathCenter = t => .525 + .079*Math.sin(t*Math.PI*1.49) - .044*t;
const halfPath = t => .009 + .097*Math.pow(t,1.52);
const walkY = t => .272+t*.728;

function meadowGrass(kind) {
  const rng=seeded(1959+kind*52);
  let blades='',awn='';
  for(let i=0;i<16;i++){
    const x=(rng()-.5)*8,lean=(rng()-.49)*65,len=18+rng()*54;
    const baseX=x+lean*.17,bend=x+lean*.37,tipX=x+lean;
    blades+=`<path d="M${pt(x,0)}Q${pt(baseX,-len*.56)} ${pt(tipX,-len)}Q${pt(bend,-len*.58)} ${pt(x+1.4+rng(),0)}Z" fill="${['#324e3e','#557151','#768464','#617d5c'][i%4]}"/>`;
    if(i%5!==0)continue;
    let seeds='';
    for(let j=0;j<5;j++){
      const run=j*1.65,yy=-j*2.4;
      seeds+=`M${pt(tipX+run,-len+yy)}q-2 -2.8 -2.9 -6q2.7 2.5 2.9 6q1.8 -4.1 4.2 -5.2q-.8 2.4 -4.2 5.2`;
    }
    awn+=line(`M${pt(tipX,-len)}q3 -5 7 -11`,'#969977',.55)+`<path d="${seeds}" fill="#b2ab82" opacity=".77"/>`;
  }
  return `<g id="ks-grass-${kind}">${blades+awn}</g>`;
}

function treeCrown(kind) {
  const rng=seeded(441+kind);
  const crown=[];
  let flecks='';
  for(let j=0;j<30;j++){
    const theta=j*Math.PI*2/30,r=10*(1+.09*Math.sin(j*2.7+kind)+.13*rng());
    crown.push(pt(Math.cos(theta)*r,Math.sin(theta)*r*.85));
  }
  for(let j=0;j<11;j++){
    flecks+=`M${pt((rng()-.58)*13,-1-rng()*5)}q1 -.9 2.1 -.6`;
  }
  return `<g id="ks-crown-${kind}"><path d="M${crown.join('L')}Z" fill="currentColor"/>${line(flecks,'#98a589',.48,.19)}</g>`;
}

function woodland(w,h,rng) {
  const horizon=h*.29,treeScale=Math.min(h,w*.86);
  let trees='';
  // A low gap in the trees behind the gate carries the horizon light through it.
  for(let tier=0;tier<2;tier++){
    const count=tier?12:19;
    for(let i=0;i<count;i++){
      const u=(i+(rng()-.5)*.64)/(count-1);
      const edge=Math.min(1,Math.abs(u-.525)*2.1);
      const tall=treeScale*(tier?.096:.069)*(.65+rng()*.53)*(.46+edge*1.1);
      const x=u*w,y=horizon+(tier?4:-2),radius=tall*(.31+rng()*.2);
      const colors=tier?['#3c5448','#40574b','#465d50']:['#495f55','#51665a','#566d5f'];
      const stem=tier?'#32483d':'#526459';
      let branches='',crowns='';
      for(let k=0;k<9;k++){
        const a=k*2.4,rad=radius*Math.sqrt(k/9);
        const cx=x+Math.cos(a)*rad,cy=y-tall*.70+Math.sin(a)*rad*.69;
        const r=radius*(.42+rng()*.33);
        branches+=`M${pt(x,y-tall*(.13+rng()*.28))}Q${pt((x+cx)*.5,y-tall*.51)} ${pt(cx,cy)}`;
        crowns+=`<g color="${colors[k%3]}">${use('crown-'+(k%3),cx,cy,r*.1,(rng()-.5)*30)}</g>`;
      }
      trees+=line(`M${pt(x,y)}q${pt(-tall*.035,-tall*.24)} ${pt(tall*.018,-tall*.6)}`,stem,tall*.042)
        +line(branches,stem,tall*.017)+crowns;
    }
  }
  return `<ellipse cx="${n(w*.53)}" cy="${n(h*.19)}" rx="${n(w*.63)}" ry="${n(h*.29)}" fill="url(#ks-horizon-light)"/>${trees}`;
}

function ground(w,h,rng){
  const bankY=.266*h;
  let silhouette=`M0 ${n(bankY)}`,back='',walk='',stones='',soil='',shadow='',edges='',moss='';
  for(let i=1;i<=52;i++){
    const t=i/52;
    silhouette+=`L${pt(w*t,bankY+h*.013*Math.sin(t*15)+h*.015*Math.cos(t*5))}`;
  }
  silhouette+=`L${pt(w,h)}H0Z`;
  // Irregular clipped shrubbery and clipped box hedges put the gate in the distance.
  for(let tier=0;tier<2;tier++){
    let ridge='',hedgeInk='';
    const dx=Math.max(2.8,w/190);
    for(let x=-4;x<=w+dx;x+=dx) {
      const u=x/w;
      const crown=bankY-h*(.028+.016*Math.sin(19*u+tier)+.009*Math.sin(53*u+1))*(tier?.51:1);
      const y=crown+(rng()-.5)*2.8;
      ridge+=(ridge?'L':'M')+pt(x,y);
      hedgeInk+=`M${pt(x+1,y+2.4)}q-1 -.8 -2.3 .6m.3 2.5 1.9 -.5`;
    }
    back+=`<path d="${ridge}L${pt(w,h*.35)}H-4Z" fill="${tier?'#485f4c':'#3e584d'}"/>`+line(hedgeInk,'#9ea88a',.55,.31);
  }
  for(const side of [-1,1]){
    const points=[];
    for(let i=0;i<=55;i++){
      const t=i/55;
      points.push(pt(w*(pathCenter(t)+side*halfPath(t)),h*walkY(t)));
    }
    if(side===-1) walk='M'+points.join('L');
    else walk+='L'+points.reverse().join('L')+'Z';
    edges+=line('M'+points.join('L'),'#3c513d',Math.min(4,w/185),.84);
  }
  for(let i=0;i<Math.round(w*2.3);i++){
    const x=rng()*w,t=rng(),y=h*walkY(t);
    if(Math.abs(x/w-pathCenter(t))<halfPath(t)*1.06)continue;
    const len=(1.8+5*t)*(.5+rng());
    if(i%4)soil+=`M${pt(x,y)}q${pt(len*.32,-.9-t)} ${pt(len,-1.2-t)}`;
    else shadow+=`M${pt(x,y)}l${pt(-len*.22,-len*.49)}m${pt(len*.22,len*.49)}q${pt(len*.1,-len*.47)} ${pt(len*.64,-len*.56)}`;
  }
  for(let i=0;i<31;i++){
    const x=rng(),t=rng();
    if(Math.abs(x-pathCenter(t))<halfPath(t)+.025)continue;
    moss+=`<ellipse cx="${n(w*x)}" cy="${n(h*walkY(t))}" rx="${n(w*(.03+rng()*.077))}" ry="${n(h*(.009+t*.027))}" fill="url(#ks-ground-moss)"/>`;
  }
  for(let i=0;i<39;i++){
    const u=rng(),t=rng()*.86;
    if(Math.abs(u-pathCenter(t))<halfPath(t)+.035)continue;
    const x=w*u,y=h*walkY(t);
    moss+=`<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(w*(.019+rng()*.058))}" ry="${n(h*(.004+t*.022))}" transform="rotate(${n(-3-rng()*11)} ${pt(x,y)})" fill="url(#ks-meadow-brush)"/>`;
  }
  // Distant and near courses share the same perspective projection. Broken
  // flagstones grow in depth and split across the path as it approaches us.
  for(let i=1;i<=26;i++){
    const near=Math.pow(i/26,1.69),far=Math.pow((i-1)/26,1.69);
    const t=(far+near)/2, y=h*walkY(t),depth=(near-far)*h*.728;
    const half=w*halfPath(t)*.93,center=w*pathCenter(t);
    const cuts=i%3===1?[-1,(rng()-.5)*.49,1]:[-1,-.34+(rng()-.5)*.43,.30+(rng()-.5)*.43,1];
    for(let j=0;j<cuts.length-1;j++){
      const x=center+half*(cuts[j]+cuts[j+1])*.5,rx=half*(cuts[j+1]-cuts[j])*(.39+rng()*.07);
      const skew=(rng()-.5)*.17,dy=(rng()-.5)*depth*.13;
      const shape=[[-.94,-.11],[-.61,-.37],[.37,-.43],[.90,-.24],[1,.21],[.43,.40],[-.66,.42],[-.99,.17]];
      const d=shape.map(([u,v],k)=>(k?'L':'M')+pt(x+rx*(u+(rng()-.5)*.19),y+dy+depth*(v+skew*u+(rng()-.5)*.18))).join('')+'Z';
      stones+=`<path d="${d}" fill="${['#94947c','#848875','#a29e86','#949682','#7e856f'][Math.floor(rng()*5)]}" stroke="#505d4b" stroke-width="${n(.33+t*.53)}"/>`;
      stones+=line(`M${pt(x-rx*.82,y+dy-depth*(.13+skew))}l${pt(rx*.28,-depth*.16)}l${pt(rx*.91,-depth*.045)}`,'#c2bd9c',.4+t*.44,.57);
      if(i>16&&j===i%3)stones+=line(`M${pt(x+rx*.82,y+dy+depth*.18)}q${pt(-rx*.18,-depth*.06)} ${pt(-rx*.24,-depth*.2)}l${pt(-rx*.16,depth*.02)}`,'#596451',.48+t*.28,.72);
    }
  }
  return woodland(w,h,rng)+back+`<path d="${silhouette}" fill="url(#ks-lawn)"/>`+moss+line(soil,'#a4ae83',.56,.36)+line(shadow,'#314d3d',.75,.68)
    +`<path d="${walk}" fill="url(#ks-walk)"/>`+edges+stones+`<path d="${silhouette}" fill="url(#ks-garden-ink)"/>`;
}

function arbor(w,h) {
  const cx=w*pathCenter(0),y=h*.283;
  const s=Math.min(w/540,h/345)*.99;
  let fence='';
  for(const side of [-1,1]){
    const extent=(side===-1?cx:w-cx)/s;
    const horiz=u=>side*(24+u*(extent-24));
    const base=u=>-2+u*9+Math.sin(u*7)*1.5;
    for(let i=0;i<=extent/16;i++){
      const u=i/Math.ceil(extent/16), x=horiz(u), b=base(u),length=14+u*8;
      fence+=`<path d="M${pt(x-1.3,b)}v${n(-length)}l1.3 -1.3 1.4 1.5v${n(length)}" fill="#899077" stroke="#526455" stroke-width=".6"/>`;
    }
    for(const height of [6,11]) fence+=line(`M${pt(horiz(0),base(0)-height)}Q${pt(horiz(.53),base(.53)-height+1)} ${pt(horiz(1),base(1)-height-1)}`,'#a0a38a',1.35,.87);
  }
  let trellis='';
  for(const side of [-1,1]) {
    for(let i=0;i<5;i++) trellis+=line(`M${pt(side*19,-6-i*7)}l${pt(side*5,-7)}m${pt(-side*5,0)}l${pt(side*5,7)}`,'#a39e79',.8);
  }
  const vine=[];
  for(let i=0;i<36;i++){
    const a=i/35*Math.PI;
    const x=Math.cos(a)*23, yy=-41-22*Math.sin(a);
    const cluster=.24+.12*Math.sin(a*5)**2;
    vine.push(use('leaflet',x+2*Math.sin(5*a),yy+2*Math.cos(a*7),cluster,(i%2?47:-45)+32*Math.cos(a*3)),i%5===0?use('berry-flower',x-2,yy-1,.25,i*8):'');
  }
  const climbing=side=>line(`M${side*24} 0q${side*6} -17 -.5 -30t1 -21`,'#657453',1.9)
    +Array.from({length:11},(_,i)=>use('leaflet',side*(24+Math.sin(i*.7)*2),-4-i*4,.16+(i%3)*.046,side*(i%2?47:-51),.19+(i%4)*.03)).join('');
  return `<g transform="translate(${pt(cx,y)}) scale(${n(s)})" opacity=".85">${fence}
    <path d="M-25 0V-39A25 25 0 0 1 25 -39V0h-5v-39a20 20 0 0 0-40 0v39Z" fill="#929579" stroke="#4b6051" stroke-width=".85"/>
    ${line('M-24 -1v-38a24 24 0 0 1 48 0V-1','#b9b99c',.9)}${trellis}${climbing(-1)}${climbing(1)}${vine.join('')}
    </g>`;
}

function borders(w,h,rng) {
  const layers=[];
  const size=Math.min(w/500,h/345);
  // Each plant starts at a point on the banks of the path. Distance determines
  // the size and colour of its row, including the foreground strawberry runners.
  const rows=[
    [.025,.14,['grass-1','lavender','grass-2'],.48],
    [.14,.36,['grass-1','wildflower','fern','lavender'],.69],
    [.32,.54,['lavender','grass-0','breath','fern'],.8],
    [.53,.78,['fern','grass-2','wildflower','foliage'],.95],
    [.79,.98,['strawberry-plant','grass-1','fern'],1]
  ];
  for(const [start,end,types,opacity] of rows){
    const count=Math.round(13+w/38);
    for(let i=0;i<count;i++){
      const x=(i+.1+rng()*.8)/count, t=start+rng()*(end-start);
      if(Math.abs(x-pathCenter(t))<halfPath(t)+.008)continue;
      const y=h*walkY(t), kind=types[Math.floor(rng()*types.length)];
      const s=(.105+t*.46)*(.58+rng()*.71)*size;
      const angle=(rng()-.5)*49;
      const field=kind==='strawberry-plant'||kind.startsWith('grass');
      const plant=use(field?kind:'border-'+kind,x*w,y,field?s*1.6:s,angle);
      layers.push({y,art:`<g opacity="${opacity}">${plant}</g>`});
    }
  }
  // Small drifts in the same bed connect the larger specimens to one another.
  // Shade and the earthed stems overlap from back to front within each drift.
  const groups=[[.15,.19,'lavender'],[.72,.23,'daisy'],[.94,.26,'lavender'],[.36,.38,'daisy'],
    [.09,.48,'white-lily'],[.82,.57,'pink-lily'],[.22,.62,'lavender'],[.675,.74,'daisy']];
  for(const [u,t,flower] of groups){
    const base=h*walkY(t),num=flower.includes('lily')?3:5;
    let bloom='',heads='';
    for(let i=0;i<num;i++){
      const x=w*u+(i-(num-1)*.5)*size*(7+rng()*6);
      const y=base+(rng()-.5)*9*size,angle=(i-(num-1)*.5)*(6+rng()*3);
      if(Math.abs(x/w-pathCenter(t))<halfPath(t)+.012)continue;
      const s=(.17+.28*t)*size*(.76+rng()*.54);
      bloom+=use('border-foliage',x-2*size,y+2*size,s*.71,angle-9);
      heads+=use('border-'+flower,x,y,s,angle);
    }
    const art=`<ellipse cx="${n(w*u)}" cy="${n(base)}" rx="${n(size*(18+num*4))}" ry="${n(6*size)}" fill="url(#ks-ground-moss)"/><g opacity="${n(.51+t*.39)}">${bloom+heads}</g>`;
    layers.push({y:base,art});
  }
  // Grasses and matte leaf shadows cross the stone edges where garden and path meet.
  for(const side of [-1,1]){
    for(let i=0;i<27;i++){
      const t=(i+.3+rng()*.49)/27,y=h*walkY(t),offset=(.001+rng()*.011)*side;
      const x=w*(pathCenter(t)+side*halfPath(t)+offset);
      const s=(.04+t*.36)*size;
      const art=use('grass-'+(i%3),x,y,s,rng()*35*side);
      layers.push({y,art});
    }
  }
  // Ragged planting pockets bring the banks into larger masses of light
  // and shade. Grass fans share a crown, while the seed heads lean apart.
  const pockets=[[.04,.18],[.19,.29],[.83,.17],[.69,.38],[.29,.53],[.07,.7],[.89,.73],[.61,.87],[.04,.98],[.92,.99]];
  const pocketScale=Math.min(w/470,h/364)*Math.min(1.42,Math.max(1,h/w));
  for(const [u,t] of pockets){
    const y=h*walkY(t),x=w*u,s=(.14+t*.86)*pocketScale;
    let grass='';
    for(let j=0;j<5;j++){
      const offset=(j-2)*(8+rng()*2.6)*s;
      grass+=use('grass-'+(j%3),x+offset,y+Math.sin(j)*2*s,s*(.45+rng()*.49),offset*.22);
    }
    layers.push({y,art:`<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(s*39)}" ry="${n(s*7)}" fill="url(#ks-ground-moss)"/>${grass}`});
  }
  return layers;
}

function runners(w,h,rng) {
  let paths='',plants='',berries='';
  const size=Math.min(w/540,h/382);
  for(const side of [-1,1]){
    const stop=side<0?.007:.995, start=pathCenter(.9)+side*(halfPath(.9)+.045);
    const px=t=>w*(start+(stop-start)*t);
    const py=t=>h*(.895+.052*Math.sin(t*8.5+side)+.048*t);
    let runner=`M${pt(px(0),py(0))}`;
    for(let i=1;i<=34;i++){const t=i/34;runner+='L'+pt(px(t),py(t));}
    paths+=line(runner,'#223d30',2.3*size)+line(runner,'#8b8a63',.94*size);
    for(let i=0;i<8;i++){
      const t=(i+.08+rng()*.52)/8,x=px(t),y=py(t),s=size*(.61+rng()*.54);
      plants+=use('grass-'+(i%3),x+size*7,y+size*2,s*.72,(rng()-.5)*20)
        +use('strawberry-plant',x,y,s,(rng()-.5)*59);
      if(i%3!==1)continue;
      const fx=x+side*8*s, fy=y+3*s;
      plants+=line(`M${pt(x,y-7*s)}Q${pt(fx+side*2*s,fy-12*s)} ${pt(fx,fy-6*s)}`,'#a1a37a',1);
      berries+=`<g data-fruit="strawberry" class="ks-side-fruit">${use('ripe',fx,fy,.71*s,side*14)}</g>`;
      plants+=use('berry-flower',fx-side*12*s,fy-7*s,.55*s,8*i);
    }
  }
  return {plants:paths+plants, berries};
}

export function strawberryBackdrop(w,h) {
  const rng=seeded(301130);
  const terrain=ground(w,h,rng)+arbor(w,h);
  const bordersByDepth=borders(w,h,rng);
  const patch=runners(w,h,rng);
  return {background:terrain,layers:bordersByDepth,patch};
}
