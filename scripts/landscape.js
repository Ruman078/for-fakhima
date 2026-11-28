import { clamp, random, oscillate, reducedMotion, settle } from './motion.js';

const f = n => n.toFixed(1);
function makeHills(w,h) {
  const rand=random(3282), distant=[], near=[];
  const ridge = (x,layer) => {
    const t=x/w;
    const relief = Math.min(h,w*.86);
    return h*(.746 + layer*.055) + relief*(-.085*Math.pow(Math.abs(t-.49)*2,1.25) + .025*Math.sin(t*14.5+layer*2.1) + .020*Math.sin(t*5-layer*1.7) + .009*Math.sin(t*29+layer));
  };
  const tones=['#547070','#425e60','#345253','#264548','#193936'];
  const shade=['#3c595c','#324f53','#28474a','#1e3b40','#102e2e'];
  for(let layer=0;layer<tones.length;layer++){
    const pieces=layer<3?distant:near;
    const crest=h*(.68+layer*.053);
    pieces.push(`<defs><linearGradient id="ridge${layer}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(crest)}" x2="0" y2="${f(crest+h*.16)}"><stop stop-color="${tones[layer]}"/><stop offset=".82" stop-color="${shade[layer]}"/></linearGradient></defs>`);
    const line = Array.from({length:111},(_,i)=>`${f(w*i/110)},${f(ridge(w*i/110,layer))}`).join(' ');
    pieces.push(`<polygon points="0,${h} ${line} ${w},${h}" fill="url(#ridge${layer})"/>`);
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
  return [distant,near].map(pieces=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${pieces.join('')}</svg>`);
}
// Bake the irregular density of the mountain air once. Only its position
// changes while the garden is open, including on high-density displays.
function makeMist() {
  const tile=document.createElement('canvas');
  tile.width=384;tile.height=96;
  const ctx=tile.getContext('2d');
  if(!ctx)return '';
  const rand=random(93), grid=Array.from({length:64*32},()=>rand());
  function noise(x,y) {
    const i=Math.floor(x),j=Math.floor(y);
    let u=x-i,v=y-j;
    u=u*u*(3-2*u);v=v*v*(3-2*v);
    const at=(dx,dy)=>grid[((j+dy)%32)*64+(i+dx)%64];
    return (at(0,0)*(1-u)+at(1,0)*u)*(1-v)+(at(0,1)*(1-u)+at(1,1)*u)*v;
  }
  const pixels=ctx.createImageData(tile.width,tile.height);
  for(let y=0;y<tile.height;y++)for(let x=0;x<tile.width;x++){
    const u=x/tile.width,v=y/tile.height;
    const warp=noise(u*5,v*2)*.21;
    const bank=Math.exp(-Math.pow((v-.41-warp+.07*Math.sin(9*u))/.21,2));
    const wisps=noise(u*7,4*v)*.57+noise(u*16,9*v+1)*.30+noise(u*36,19*v)*.13;
    const p=(y*tile.width+x)*4;
    pixels.data[p]=205;pixels.data[p+1]=210;pixels.data[p+2]=185;
    pixels.data[p+3]=Math.round(255*bank*Math.max(0,wisps-.23));
  }
  ctx.putImageData(pixels,0,0);
  return `url("${tile.toDataURL()}")`;
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
export function landscape(plate,quality,onBrush) {
  paperGrain();
  const canvas=document.querySelector('#motes'), ctx=canvas.getContext('2d'), rand=random(11030);
  const lights=Array.from({length:quality.particles},()=>({x:rand(),y:.29+rand()*.66,phase:rand()*7,size:.65+rand()*1.05,speed:.24+rand()*.48}));
  const mist=makeMist();
  if(mist)plate.style.setProperty('--mountain-air',mist);
  let stage=0,w=0,h=0,frame=0,last=0,lastPaint=0,elapsed=0,slow=0,compact=false,paused=false,targetX=0,targetY=0;
  const driftX={value:0,velocity:0},driftY={value:0,velocity:0};
  let landURLs=[],artWidth=0,artHeight=0,hasPainted=false;
  let brush=null;
  let low=(navigator.hardwareConcurrency||4)<4;
  const glow=document.createElement('canvas');
  glow.width=glow.height=32;
  const glowContext=glow.getContext('2d');
  if(glowContext){
    const halo=glowContext.createRadialGradient(16,16,0,16,16,16);
    halo.addColorStop(0,'#f3dc97');halo.addColorStop(.2,'rgba(222,207,145,.65)');halo.addColorStop(1,'rgba(210,196,113,0)');
    glowContext.fillStyle=halo;glowContext.fillRect(0,0,32,32);
  }
  function fallingPetal(x,y,t,direction,size) {
    const turn=Math.sin(t*8.2+.7), wind=Math.sin(t*5.4);
    ctx.save();
    ctx.translate(x+direction*(t*w*.105+wind*8),y+h*.19*t*t-9*Math.sin(t*Math.PI));
    ctx.rotate(direction*(.2+t*1.7+wind*.51));
    ctx.scale(size*(.18+.82*Math.abs(turn)),size);
    ctx.globalAlpha=Math.min(1,t*8,(1-t)*5)*.70;
    ctx.fillStyle=turn>0?'#e3cfb8':'#a9a48b';
    ctx.beginPath();ctx.moveTo(-.5,3);ctx.bezierCurveTo(-4,1,-3,-4,0,-5);ctx.bezierCurveTo(3,-2,2,1,-.5,3);ctx.fill();
    ctx.restore();
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
    const intimate=stage===4 || stage===5 || stage===6;
    // Slow drifts need fewer repaints than an unfolding flower. The SVG and
    // CSS transitions retain their own native display cadence.
    const interval=intimate||low?1000/20:1000/36;
    if(!hasPainted || (!reducedMotion.matches && time-lastPaint>=interval-1)) {
      lastPaint=time;
      ctx.clearRect(0,0,w,h);
      const count=intimate?5:low||compact?quality.lowParticles:lights.length;
      for(let i=0;i<count;i++){
        const m=lights[i],t=elapsed*m.speed+m.phase;
        const meander=oscillate(t*.62,m.phase);
        const x=m.x*w+meander*(compact?14:27)+driftX.value*(i%3+1);
        const y=m.y*h+Math.sin(t*.49+m.phase)*13+4*Math.sin(t*.87)+driftY.value;
        const pulse=Math.max(0,Math.sin(t*1.32+m.phase));
        const alpha=(.035+.73*pulse*pulse)*(intimate?.45:1);
        const radius=i%4===0?m.size*5.1:m.size*2.65;
        ctx.globalAlpha=alpha;
        ctx.drawImage(glow,x-radius,y-radius,radius*2,radius*2);
        if(i%4===0){
          ctx.fillStyle='#ffe6a5';ctx.beginPath();ctx.ellipse(x,y,m.size*.73,m.size*.53,meander,0,Math.PI*2);ctx.fill();
        }
      }
      if(!reducedMotion.matches && (stage===2||stage===3||stage===7)){
        const cycle=Math.floor(elapsed/24),t=(elapsed%24-4.5)/7.6;
        if(t>0 && t<1) {
          const direction=cycle%2?1:-1;
          fallingPetal(w*(direction>0?.13:.87),h*.55,t,direction,compact?.72:1);
        }
        if(brush){
          const age=elapsed-brush.at;
          if(age>2.6)brush=null;
          else for(let i=0;i<5;i++){
            const a=age*(.84+i*.047), direction=brush.x<w/2?1:-1;
            const x=brush.x+direction*(i-1.3)*5.4*a+7*Math.sin(a*1.9+i*.6);
            const y=brush.y-(10+i*3)*a+a*a*2.9;
            ctx.globalAlpha=.58*Math.max(0,1-age/2.6);
            ctx.fillStyle=i%2?'#d9cb93':'#eee3b9';
            ctx.beginPath();ctx.arc(x,y,.65+.16*(i%3),0,Math.PI*2);ctx.fill();
          }
        }
      }
      hasPainted=true;
    }
    if(!reducedMotion.matches && !intimate) frame=requestAnimationFrame(paint);
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
      // Rasterize each bank of hills together so only the air between them moves.
      const oldURLs=landURLs;
      landURLs=makeHills(w,h).map(svg=>URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})));
      const [far,near]=landURLs.map(url=>{const image=new Image();image.alt='';image.src=url;return image;});
      const air=document.createElement('div');air.className='valley-mist';
      document.querySelector('#hills').replaceChildren(far,air,near);
      oldURLs.forEach(url=>URL.revokeObjectURL(url));
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
  plate.addEventListener('pointerdown',event=>{
    if(![2,3,7].includes(stage)||paused||reducedMotion.matches||event.button!==0)return;
    if(event.target.closest('button,a,[role="button"]'))return;
    const rect=plate.getBoundingClientRect(), x=event.clientX-rect.left,y=event.clientY-rect.top;
    if(y<h*.46 || (x>w*.29 && x<w*.71) || (brush && elapsed-brush.at<.65))return;
    brush={x,y,at:elapsed};onBrush();
  },{passive:true});
  return {setStage(next){stage=next;brush=null;refresh();},pause(flag){paused=flag;refresh();}};
}
