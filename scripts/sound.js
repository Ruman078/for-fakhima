import { rate, score, renderCue, renderAir } from './sound-design.mjs';

async function starting(promise, timeout) {
  let timer;
  try {
    await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('interrupted')), timeout);
    })]);
  } finally { clearTimeout(timer); }
}

function webPlayer(AudioContext, interrupted) {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);
  const cache = new Map();
  const airGain = context.createGain();
  airGain.connect(master);
  let active, air, airBuffer, airStart = 0, airOffset = 0;
  const buffer = samples => {
    const data = context.createBuffer(1, samples.length, rate);
    data.getChannelData(0).set(samples);
    return data;
  };
  const yieldControl = () => globalThis.scheduler?.yield?.() ?? new Promise(resolve => setTimeout(resolve, 0));
  function stopNote(fade = 0) {
    if (!active) return;
    const now = context.currentTime, { source, volume } = active;
    active = null;
    if (fade) {
      volume.gain.setValueAtTime(1, now);
      volume.gain.linearRampToValueAtTime(0, now + fade);
    }
    source.stop(now + fade);
  }
  function play(key) {
    if (context.state !== 'running') throw new Error('interrupted');
    stopNote(.025);
    const source = context.createBufferSource(), volume = context.createGain();
    if (!cache.has(key)) cache.set(key, buffer(renderCue(key)));
    source.buffer = cache.get(key);
    source.connect(volume); volume.connect(master);
    active = {source, volume};
    source.onended = () => {
      source.disconnect(); volume.disconnect();
      if (active?.source === source) active = null;
    };
    source.start();
  }
  context.onstatechange = () => { if (context.state !== 'running') interrupted(); };
  return {
    async start(key, current) {
      if (context.state !== 'running') {
        await starting(context.resume(), 1250);
      }
      if (!current()) return;
      if (context.state !== 'running') throw new Error('interrupted');
      master.gain.value = .90;
      if (key) play(key);
      if (!air) {
        // Let the first cue play immediately, then render the longer bed in
        // small slices so tapping Sound leaves the garden responsive.
        airBuffer ??= renderAir(yieldControl).then(buffer);
        const waveform = await airBuffer;
        if (!current()) return;
        if (context.state !== 'running') throw new Error('interrupted');
        air = context.createBufferSource();
        air.buffer = waveform; air.loop = true;
        const now = context.currentTime;
        airGain.gain.cancelScheduledValues(now);
        airGain.gain.setValueAtTime(0, now);
        airGain.gain.linearRampToValueAtTime(1, now + .55);
        air.connect(airGain); air.start(now, airOffset);
        airStart = now;
      }
    },
    play,
    stop() {
      master.gain.value = 0;
      stopNote();
      if (air) {
        airOffset = (airOffset + context.currentTime - airStart) % air.buffer.duration;
        air.stop(); air.disconnect(); air = null;
      }
      if (context.state !== 'closed') context.suspend().catch(() => {});
    },
    dispose() {
      this.stop(); context.onstatechange = null; context.close().catch(() => {});
    }
  };
}

function mediaPlayer(interrupted) {
  // First-party PCM served over HTTP also works in engines which reject
  // perfectly valid, locally synthesized blob: and data: media.
  const notes = new Audio();
  const air = new Audio(new URL('../audio/garden-air.wav', import.meta.url).href);
  notes.preload = 'auto'; air.preload = 'auto'; air.loop = true;
  notes.volume = air.volume = .90;
  air.addEventListener('pause', () => { if (air.paused) interrupted(); });
  let revision = 0;
  function stopNotes() {
    revision++; notes.pause();
  }
  async function play(key) {
    stopNotes();
    const request = revision;
    // Each cue starts at frame zero, including on static servers that don't
    // support HTTP byte ranges. Reuse the element unlocked by the first tap.
    notes.src = new URL('../audio/cues/' + key + '.wav', import.meta.url).href;
    notes.muted = false;
    // Begin playback inside the gesture, retaining this element for subsequent seeks.
    try { await notes.play(); }
    catch (error) { if (request === revision) throw error; return; }
  }
  return {
    async start(key, current) {
      // Both calls are issued synchronously while the activation is still valid.
      const phrase = key ? play(key) : null;
      air.muted = false;
      await starting(Promise.all([phrase, air.play()]), 6500);
      if (current() && notes.paused && air.paused) throw new Error('interrupted');
    },
    async play(key) {
      await Promise.all([play(key), air.paused && air.play()]);
    },
    stop() {
      notes.muted = true; air.muted = true;
      stopNotes(); air.pause();
    },
    dispose() { this.stop(); }
  };
}

export function gardenSound(onState) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const nativeWave = typeof Audio === 'function' && !!new Audio().canPlayType('audio/wav');
  let player, useWeb = !!AudioContext, wanted = false, state = 'off';
  let ticket = 0, flower = 0, previous = '', lastAt = 0, oldSession;
  const update = next => { state = next; onState(next); };
  function setSession(enabled) {
    // An explicit opt-in is a playback request on iOS. Release the session when muted.
    try {
      const session = navigator.audioSession;
      if (!session) return;
      if (enabled && oldSession === undefined) { oldSession = session.type; session.type = 'playback'; }
      if (!enabled && oldSession !== undefined) { session.type = oldSession; oldSession = undefined; }
    } catch { /* The session hint is optional. */ }
  }
  function interrupted() {
    if (wanted && state === 'on') update('paused');
  }
  async function start(key) {
    if (!wanted || document.hidden) return;
    const id = ++ticket;
    const current = () => wanted && !document.hidden && id === ticket;
    update('starting');
    setSession(true);
    try {
      if (useWeb) {
        try {
          player ??= webPlayer(AudioContext, interrupted);
          await player.start(key, current);
        } catch (error) {
          if (!current()) return;
          if (!nativeWave) throw error;
          player?.dispose(); useWeb = false; player = mediaPlayer(interrupted);
          await player.start(key, current);
        }
      } else {
        player ??= mediaPlayer(interrupted);
        await player.start(key, current);
      }
      if (current()) update('on');
    } catch {
      if (current()) {
        player?.stop(); wanted = false; setSession(false); update('retry');
      }
    }
  }
  function pause() {
    ticket++; player?.stop(); setSession(false);
    update(wanted ? 'paused' : 'off');
  }
  function visibility() {
    if (document.hidden) pause();
    else if (wanted && state === 'paused') start(null);
  }
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', pause);
  window.addEventListener('pageshow', visibility);
  return {
    available: !!AudioContext || nativeWave,
    toggle() {
      if (wanted && state !== 'paused') { wanted = false; pause(); return; }
      wanted = true; start('enable');
    },
    play(name) {
      if (!wanted || document.hidden || state === 'starting') return;
      const now = performance.now();
      if (name === previous && now - lastAt < 60) return;
      previous = name; lastAt = now;
      let key = name;
      if (name === 'flower' || name === 'daisy') key = ['flower','flower2','flower3'][flower++ % 3];
      else if (name === 'lily' || name === 'blush') key = 'bloom';
      if (!Object.prototype.hasOwnProperty.call(score, key)) key = 'flower';
      if (state === 'paused') { start(key); return; }
      const id = ticket;
      const recover = () => { if (id === ticket && wanted && !document.hidden) start(key); };
      try { player.play(key)?.catch(recover); } catch { recover(); }
    }
  };
}
