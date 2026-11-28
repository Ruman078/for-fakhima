// Cue descriptions are surface, length in seconds, and strongest 32 ms RMS.
// Only the chapter milestones have sustained pitch. The working sounds come
// from friction and the short resonance of paper, leaves, wood and silk.
export const rate = 16000;
const tau = Math.PI * 2;
const cue = (surface, seconds, level, seed, frequency = 0, companion = 0) =>
  ({ surface, seconds, level, seed, frequency, companion });

export const score = {
  enable:    cue('felt', 1.50, .059, 11, 220, 329.63),
  wake:      cue('felt', 1.55, .059, 21, 196, 293.66),
  chapter:   cue('silk', .47, .040, 32),
  menuOpen:  cue('paper', .38, .042, 41),
  menuClose: cue('silk', .31, .039, 54),
  bloom:     cue('felt', 1.35, .051, 65, 293.66),
  birthday:  cue('felt', 1.90, .063, 74, 196, 246.94),
  finale:    cue('felt', 2.10, .061, 86, 146.83, 220),
  flower:    cue('leaf', .43, .044, 97),
  flower2:   cue('leaf', .48, .044, 101),
  flower3:   cue('leaf', .40, .044, 113),
  undo:      cue('wood', .27, .042, 125, 242),
  arrange:   cue('leaf', .66, .046, 137),
  palette:   cue('wood', .21, .038, 142, 254),
  paper:     cue('paper', .47, .045, 153),
  pattern:   cue('wood', .24, .038, 163, 227),
  ribbon:    cue('silk', .51, .041, 179),
  wrap:      cue('paper', .88, .048, 181),
  unwrap:    cue('paper', .78, .045, 194),
  save:      cue('felt', .92, .047, 204, 246.94),
  letterOpen:cue('paper', .89, .049, 215),
  letterFold:cue('paper', .62, .045, 227),
  bug:       cue('wood', .23, .038, 231, 334),
  butterfly: cue('silk', .50, .041, 245),
  stars:     cue('felt', 1.15, .047, 251, 329.63),
  chain:     cue('leaf', .49, .042, 266),
  strawberry:cue('wood', .33, .044, 270, 212),
  lavender:  cue('leaf', .58, .043, 288),
  fern:      cue('leaf', .61, .043, 294),
  gift:      cue('paper', .76, .046, 307),
};

function noise(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2147483648 - 1;
  };
}
const pole = hz => 1 - Math.exp(-tau * hz / rate);
const ease = x => x * x * (3 - 2 * x);
function brush(x, centre, span) {
  const d = Math.abs(x - centre) / span;
  return d < 1 ? ease(1 - d) : 0;
}

// Broad, overlapping friction bands avoid the whistle of a narrow resonance.
// The seed varies the pressure and the timing of each pass across a surface.
const surfaces = {
  paper: { low:230, high:2100, body:560, second:.64, grain:.62 },
  leaf:  { low:170, high:1450, body:430, second:.26, grain:.52 },
  silk:  { low:190, high:1000, body:380, second:.15, grain:.20 },
  wood:  { low:210, high:1600, body:620, second:.00, grain:.35 },
  felt:  { low:160, high:940,  body:390, second:.00, grain:.18 }
};

function levelCue(data, target) {
  let peak = 0, sum = 0;
  const block = 512;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
    if (i % block === block - 1) {
      peak = Math.max(peak, sum);
      sum = 0;
    }
  }
  const gain = target / Math.sqrt(Math.max(peak, 1e-10) / block);
  for (let i = 0; i < data.length; i++) data[i] *= gain;
}

export function renderCue(key) {
  const c = score[key], material = surfaces[c.surface], rng = noise(c.seed);
  const samples = new Float32Array(Math.ceil(c.seconds * rate));
  const cut = pole(material.high), floor = pole(material.low), body = pole(material.body);
  const variation = rng(), first = .24 + variation * .055, second = .64 + .055 * rng();
  const pitch = c.frequency * (1 + variation * .002);
  const felt = c.surface === 'felt', wood = c.surface === 'wood';
  let upper = 0, lower = 0, middle = 0, pressure = .75, nextPressure = .75;
  for (let i = 0; i < samples.length; i++) {
    const x = i / (samples.length - 1), t = i / rate;
    if (i % 341 === 0) nextPressure = 1 + material.grain * rng();
    pressure += .009 * (nextPressure - pressure);
    upper += cut * (rng() - upper);
    middle += body * (upper - middle);
    lower += floor * (middle - lower);
    const stroke = brush(x, first, first) + material.second * brush(x, second, .92 - second);
    let value = ((upper - middle) * .7 + middle - lower) * stroke * pressure;
    if (felt || wood) {
      // A felt-covered tine flexes slightly at contact. The quieter string
      // resonates sympathetically at the same instant, without a note sequence.
      const phase = tau * pitch * (t + .00013 * (1 - Math.exp(-18 * t)));
      const strike = 1 - Math.exp(-t / (wood ? .009 : .065));
      const ring = Math.exp(-x * (wood ? 8 : 4.2));
      let voice = Math.sin(phase) + .27 * ring * Math.sin(2 * phase + .12);
      voice += (wood ? .20 : .08) * ring * ring * Math.sin(phase * (wood ? 2.72 : 3.004));
      if (c.companion) voice += .39 * Math.sin(tau * c.companion * t + .04);
      value = value * (wood ? 1.7 : .19) + voice * strike * ring;
    }
    if (x > .82) value *= ease((1 - x) / .18);
    samples[i] = value;
  }
  if (felt) {
    // Faint scattered reflections round the resonant cues without a long tail.
    for (const [delay, gain] of [[.027,.09],[.043,.055],[.071,.032]]) {
      const lag = Math.round(delay * rate);
      for (let i = samples.length - 1; i >= lag; i--) samples[i] += gain * samples[i-lag];
    }
    const tail = Math.floor(.06 * rate);
    for (let j = 0; j < tail; j++) samples[samples.length - 1 - j] *= ease(j / tail);
  }
  levelCue(samples, c.level);
  return samples;
}

// A long, still D/A sonority under a sheltered breeze. Slow changes of bow
// pressure and air give it movement without a pulse or recurring melody.
// Block-rate control changes keep the initial opt-in inexpensive on phones.
export async function renderAir(yieldControl) {
  const length = 24 * rate, overlap = rate, block = 128;
  const raw = new Float32Array(length + overlap), rng = noise(113011);
  const voices = [
    {hz:146.83, level:.0082, phase:.42, speed:.154},
    {hz:220, level:.0094, phase:2.10, speed:.191},
    {hz:293.66, level:.0058, phase:4.78, speed:.247},
    {hz:329.63, level:.0040, phase:1.40, speed:.138}
  ].map(v => ({ ...v, y:Math.sin(v.phase), z:Math.cos(v.phase), gain:0 }));
  let leaf = 0, shadow = 0, silk = 0, drift = 0;
  for (let start = 0; start < raw.length; start += block) {
    if (yieldControl && start && start % 24576 === 0) await yieldControl();
    const t = start / rate, stop = Math.min(start + block, raw.length);
    const swell = .65 + .18 * Math.sin(t * .463 + .9) + .17 * Math.sin(t * .731);
    const breath = .073 * swell;
    const rustle = .022 * (1 + .5 * Math.sin(t * .581 + .6));
    for (const v of voices) {
      const wander = .0004 * Math.sin(v.speed * t + v.phase);
      const step = tau * v.hz * (1 + wander) / rate;
      v.s = Math.sin(step); v.c = Math.cos(step);
      const arc = .58 + .30 * Math.sin(v.speed*t + v.phase) + .12 * Math.sin(.33*t - v.phase);
      v.increment = (v.level * arc - v.gain) / (stop - start);
    }
    for (let i = start; i < stop; i++) {
      const random = rng();
      leaf += .17 * (random - leaf);
      silk += .07 * (leaf - silk);
      shadow += .022 * (silk - shadow);
      drift += .003 * (shadow - drift);
      let value = breath * (silk - shadow) + rustle * (leaf - silk) + .025 * (shadow - drift);
      for (let j = 0; j < voices.length; j++) {
        const v = voices[j], next = v.y * v.c + v.z * v.s;
        v.z = v.z * v.c - v.y * v.s; v.y = next; v.gain += v.increment;
        // A little breath in the upper partials softens the pure oscillator
        // sound. The body of each voice remains steady underneath the breeze.
        const octave = 2 * next * v.z, twelfth = next * (3 - 4 * next * next);
        value += v.gain * (next + (.13 + .28 * shadow) * octave + .047 * twelfth);
      }
      raw[i] = value;
    }
  }
  // Continue the existing waveform across the loop boundary. The raised-cosine
  // splice is one second long and keeps its first and last derivatives smooth.
  for (let i = 0; i < overlap; i++) {
    const blend = .5 - .5 * Math.cos(Math.PI * i / overlap);
    raw[i] = raw[length + i] * (1 - blend) + raw[i] * blend;
  }
  return raw.subarray(0, length);
}
