// A quiet glass-like arpeggio. Every tone is synthesized after a user gesture.
export function gardenSound() {
  let context, enabled=false;
  function notes(frequencies) {
    if(!enabled || document.hidden || context?.state!=='running') return;
    frequencies.forEach((frequency,i)=>{
      const tone=context.createOscillator(), gain=context.createGain(),start=context.currentTime+i*.18;
      tone.type='sine';tone.frequency.value=frequency;
      gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.04/(1+i*.25),start+.05);
      gain.gain.exponentialRampToValueAtTime(.0001,start+1.55);
      tone.connect(gain);gain.connect(context.destination);
      tone.start(start);tone.stop(start+1.6);
      tone.onended=()=>{tone.disconnect();gain.disconnect();};
    });
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden) context?.suspend().catch(()=>{});else if(enabled) context?.resume().catch(()=>{});});
  return {
    async toggle(){
      try {
        const Audio=window.AudioContext||window.webkitAudioContext;
        if(!Audio) return false;
        context??=new Audio();
        enabled=!enabled;
        if(enabled){await context.resume();notes([392,493.88,587.33]);}
        else await context.suspend();
      } catch {enabled=false;}
      return enabled;
    },
    bloom(){notes([440,554.37,659.25]);},
    turn(){notes([392,523.25]);}
  };
}
