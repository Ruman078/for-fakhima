import { clamp, random, oscillate, reducedMotion, settle } from './motion.js';

const f = n => n.toFixed(1);
function makeHills(w,h) {
  const rand=random(3282), pieces=[];
  const ridge = (x,layer) => {
    const t=x/w;
    const relief = Math.min(h,w*.86);
    return h*(.746 + layer*.055) + relief*(-.085*Math.pow(Math.abs(t-.49)*2,1.25) + .025*Math.sin(t*14.5+layer*2.1) + .020*Math.sin(t*5-layer*1.7) + .009*Math.sin(t*29+layer));
  };
  const tones=['#315153','#29494b','#204144','#183638','#122f30'];
  for(let layer=0;layer<tones.length;layer++){
    const line = Array.from({length:111},(_,i)=>`${f(w*i/110)},${f(ridge(w*i/110,layer))}`).join(' ');
    pieces.push(`<polygon points="0,${h} ${line} ${w},${h}" fill="${tones[layer]}"/>`);
    if(layer<4) {
      pieces.push(`<polyline points="${line}" fill="none" stroke="#93a38a" opacity=".21" stroke-width=".7"/>`);
      // Short broken contour lines give the distant land its copperplate texture.
      for(let j=0;j<w/3;j++){
        const x=rand()*w,y=ridge(x,layer)+1+rand()*h*.085, len=2+rand()*19;
        pieces.push(`<path d="M${f(x)} ${f(y)}q${f(len*.48)} ${f(ridge(x+len/2,layer)-ridge(x,layer)-.8)} ${f(len)} ${f(ridge(x+len,layer)-ridge(x,layer))}" stroke="${j%3?'#abb09a':'#0c292e'}" opacity="${f(j%3?.1:.2)}" stroke-width=".65"/>`);
      }
    }
    if(layer===1 || layer===3) {
      const trees=[];
      for(let x=0;x<w;x+=2.2+rand()*3) {
        const y=ridge(x,layer)+1, height=(3+rand()*11)*(1+Math.cos(x/w*13)*.7);
        const half=height*.18;
        trees.push(`M${f(x-half)} ${f(y)}l${f(half*.65)} ${f(-height*.6)}h${f(-half*.2)}l${f(half*.55)} ${f(-height*.4)}l${f(half*.55)} ${f(height*.43)}h${f(-half*.22)}l${f(half*.67)} ${f(height*.57)}Z`);
      }
      pieces.push(`<path fill="${tones[layer]}" d="${trees.join('')}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${pieces.join('')}</svg>`;
}
function stars(w,h) {
  const rand=random(8611), marks=[];
  for(let i=0;i<Math.round(Math.min(185,w*.17));i++){
    const x=f(rand()*w),y=f(rand()*h*.78),r=.3+rand()*.86;
    if(i%13===0) marks.push(`<path d="M${x} ${y}m0 -3.1q.4 2.8 2.4 3.1-2 .25-2.4 3.1-.3-2.8-2.4-3.1 2-.3 2.4-3.1Z" fill="#e3cfa1" opacity=".77"/>`);
    else marks.push(`<circle cx="${x}" cy="${y}" r="${f(r)}" fill="#e8d7b6" opacity="${f(.14+rand()*.52)}"/>`);
  }
  [[.12,.145,.12], [.76,.20,.11]].forEach(([x,y,width],i)=>{
    const points = [[0,.11],[.22,.29],[.50,.10],[.72,.22],[1,0]].map(([px,py])=>[w*(x+px*width),h*y+(i?1:-1)*py*width*w]);
    marks.push(`<polyline points="${points.map(p=>p.map(f).join(',')).join(' ')}" fill="none" stroke="#cdbd91" stroke-width=".65" opacity=".24"/>`);
    points.forEach(([cx,cy],j)=>marks.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${j%2?1.55:1}" fill="#e6d6b2" opacity=".68"/>`));
  });
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${marks.join('')}</svg>`;
}
function paperGrain() {
  const tile=document.createElement('canvas');
  tile.width=tile.height=128;
  const ctx=tile.getContext('2d');
  if (!ctx) return;
  const noise=ctx.createImageData(128,128), rand=random(901);
  for(let p=0;p<noise.data.length;p+=4) {
    const tone=rand()>.5?240:10;
    noise.data.set([tone,tone,tone,Math.floor(rand()*25)],p);
  }
  ctx.putImageData(noise,0,0);
  document.documentElement.style.setProperty('--grain',`url("${tile.toDataURL()}")`);
}
export function landscape(plate,quality) {
  paperGrain();
  const canvas=document.querySelector('#motes'), ctx=canvas.getContext('2d'), rand=random(11030);
  const lights=Array.from({length:quality.particles},()=>({x:rand(),y:.22+rand()*.71,phase:rand()*7,size:.65+rand()*1.05,speed:.12+rand()*.32}));
  let stage=0,w=0,h=0,frame=0,last=0,elapsed=0,slow=0,compact=false,paused=false,targetX=0,targetY=0;
  const driftX={value:0,velocity:0},driftY={value:0,velocity:0};
  let landURL,artWidth=0,artHeight=0,hasPainted=false;
  let low=(navigator.hardwareConcurrency||4)<4;
  const glow=document.createElement('canvas');
  glow.width=glow.height=32;
  const glowContext=glow.getContext('2d');
  if(glowContext){
    const halo=glowContext.createRadialGradient(16,16,0,16,16,16);
    halo.addColorStop(0,'#f3dc97');halo.addColorStop(.2,'rgba(222,207,145,.65)');halo.addColorStop(1,'rgba(210,196,113,0)');
    glowContext.fillStyle=halo;glowContext.fillRect(0,0,32,32);
  }
  function paint(time) {
    frame=0;
    if(!ctx || document.hidden || paused) { last=0; return; }
    const delta=last?time-last:16; last=time;
    elapsed+=Math.min(delta,50)*.001;
    if(delta>quality.slowFrame) slow++; else slow=Math.max(0,slow-1);
    if(slow>22) low=true;
    if(!reducedMotion.matches && (Math.abs(driftX.value-targetX)>.006 || Math.abs(driftY.value-targetY)>.006)){
      const dt=clamp(delta*.001,0,.05);
      settle(driftX,targetX,dt);settle(driftY,targetY,dt);
      plate.style.setProperty('--parallax',driftX.value.toFixed(2)+'px');
    }
    if(!reducedMotion.matches || !hasPainted) {
      ctx.clearRect(0,0,w,h);
      const count=low||compact?quality.lowParticles:lights.length;
      for(let i=0;i<count;i++){
        const m=lights[i],t=elapsed*m.speed+m.phase;
        const x=m.x*w+oscillate(t,m.phase)*12+driftX.value*(i%3+1),y=m.y*h+Math.sin(t*.68)*11+driftY.value;
        const alpha=.11+.56*(.5+.5*Math.sin(t*2.4));
        const radius=i%4===0?m.size*6:m.size*3;
        ctx.globalAlpha=alpha;
        ctx.drawImage(glow,x-radius,y-radius,radius*2,radius*2);
      }
      hasPainted=true;
    }
    if(!reducedMotion.matches && (stage<4 || stage===7)) frame=requestAnimationFrame(paint);
  }
  function refresh(){cancelAnimationFrame(frame);last=0;hasPainted=false;paint(performance.now());}
  const size=()=>{
    const newW=plate.clientWidth,newH=plate.clientHeight;
    if(!newW || !newH || (newW===w && newH===h)) return;
    const redraw=!artWidth || Math.abs(newW-artWidth)>32 || Math.abs(newH-artHeight)>95;
    w=newW;h=newH;compact=w<580;
    const dpr=Math.min(devicePixelRatio||1,quality.maxDpr);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    if(ctx) ctx.setTransform(dpr,0,0,dpr,0,0);
    if(redraw){
      // The hills contain fixed engraving lines. Keep that drawing in a single
      // image so its individual strokes never enter layout or hit testing.
      const oldURL=landURL, image=new Image();
      landURL=URL.createObjectURL(new Blob([makeHills(w,h)],{type:'image/svg+xml'}));
      image.alt='';image.src=landURL;
      document.querySelector('#hills').replaceChildren(image);
      if(oldURL)URL.revokeObjectURL(oldURL);
      document.querySelector('#stars').innerHTML=stars(w,h);
      artWidth=w;artHeight=h;
    }
    refresh();
  };
  if('ResizeObserver' in window) new ResizeObserver(size).observe(plate);
  else window.addEventListener('resize',size);
  size();
  document.addEventListener('visibilitychange',()=>{
    document.body.classList.toggle('hidden-tab',document.hidden); refresh();
  });
  reducedMotion.addEventListener?.('change',refresh);
  plate.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse' || reducedMotion.matches || stage>3) return;
    targetX=(e.clientX/window.innerWidth-.5)*4;
    targetY=(e.clientY/window.innerHeight-.5)*3;
  },{passive:true});
  plate.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
  return {setStage(next){stage=next;refresh();},pause(flag){paused=flag;refresh();}};
}
