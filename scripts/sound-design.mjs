// The browser and the WAV exporter play the same original miniature score.
// Pitch values are semitones above D4. Each cue is a short variation on it.
export const rate = 16000;
const tau = Math.PI * 2;
const pitch = step => 293.6648 * 2 ** (step / 12);
const voice = (notes, timbre = 'felt', gap = .09, ring = .36, rustle = 0) =>
  ({ notes, timbre, gap, ring, rustle });

export const score = {
  enable: voice([0, 7, 11, 14], 'glass', .115, .62),
  wake: voice([0, 7, 12, 16], 'glass', .13, .62),
  chapter: voice([4, 7], 'felt', .11, .32),
  menuOpen: voice([0, 4], 'wood', .08, .22),
  menuClose: voice([4, 0], 'wood', .07, .21),
  bloom: voice([7, 11, 14], 'bell', .13, .56),
  birthday: voice([4, 7, 12, 14], 'glass', .15, .66),
  finale: voice([14, 11, 7, 4, 0], 'glass', .17, .70),
  flower: voice([7, 14], 'felt', .095, .31),
  flower2: voice([4, 11], 'felt', .095, .31),
  flower3: voice([2, 9], 'felt', .095, .31),
  undo: voice([7, 4], 'wood', .075, .22),
  arrange: voice([0, 4, 7], 'felt', .075, .33),
  palette: voice([7], 'wood', 0, .19),
  paper: voice([2], 'paper', 0, .30, .68),
  pattern: voice([4, 7], 'wood', .062, .22),
  ribbon: voice([9], 'felt', 0, .36, .31),
  wrap: voice([0, 4, 7], 'paper', .12, .44, .78),
  unwrap: voice([7, 2], 'paper', .10, .36, .81),
  save: voice([4, 11, 14], 'bell', .09, .46),
  letterOpen: voice([0, 7], 'paper', .19, .44, .95),
  letterFold: voice([4, 0], 'paper', .10, .36, .9),
  bug: voice([2, 7], 'wood', .11, .19),
  butterfly: voice([9, 14, 16], 'bell', .095, .38),
  stars: voice([12, 16, 19], 'glass', .14, .45),
  chain: voice([11, 14, 11], 'bell', .055, .34),
  strawberry: voice([0, 7], 'wood', .10, .34),
  lavender: voice([4, 11], 'felt', .15, .35, .22),
  fern: voice([2, 7], 'felt', .1, .36, .32),
  gift: voice([4, 11, 16], 'glass', .12, .42),
};

function noiseGenerator(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2147483648 - 1;
  };
}
const lengthOf = cue => Math.ceil((cue.ring + cue.gap * (cue.notes.length - 1)) * rate);
const timbres = {
  felt:  { attack: .011, decay: 4.5, second: .32, overtone: .14, ratio: 3.01, level: .26 },
  glass: { attack: .018, decay: 3.9, second: .16, overtone: .19, ratio: 2.74, level: .24 },
  bell:  { attack: .009, decay: 4.2, second: .23, overtone: .21, ratio: 3.54, level: .23 },
  wood:  { attack: .006, decay: 5.7, second: .33, overtone: .21, ratio: 2.22, level: .30 },
  paper: { attack: .024, decay: 4.1, second: .18, overtone: .08, ratio: 3.00, level: .19 },
};
export function renderCue(key) {
  const cue = score[key], instrument = timbres[cue.timbre];
  const samples = new Float32Array(lengthOf(cue));
  const length = Math.ceil(cue.ring * rate);
  for (const [i, step] of cue.notes.entries()) {
    const start = Math.round(i * cue.gap * rate), frequency = pitch(step);
    for (let j = 0; j < length && start + j < samples.length; j++) {
      const t = j / rate, phase = tau * frequency * t;
      const attack = Math.min(t / instrument.attack, 1);
      const damping = Math.exp(-instrument.decay * t / cue.ring);
      const fade = Math.min(1, (length - 1 - j) / (rate * .023));
      const partials = Math.sin(phase) + damping * (
        instrument.second * Math.sin(phase * 2) + instrument.overtone * Math.sin(phase * instrument.ratio));
      samples[start + j] += instrument.level * attack * damping * fade * partials;
    }
  }
  if (cue.rustle) {
    const noise = noiseGenerator(3417);
    let soft = 0, low = 0;
    for (let j = 0; j < samples.length; j++) {
      const t = j / samples.length;
      soft += .38 * (noise() - soft);
      low += .09 * (soft - low);
      const fold = Math.exp(-95 * (t - .22) ** 2) + .61 * Math.exp(-110 * (t - .58) ** 2);
      samples[j] += (soft - low) * fold * Math.sin(Math.PI * t) * .38 * cue.rustle;
    }
  }
  return samples;
}

// A low, seamless bed of leaves with one distant two-note bird call. Keep the
// detail above 400 Hz so small phone speakers can carry it at a gentle level.
export function renderAir() {
  const seconds = 10, samples = new Float32Array(rate * seconds);
  const noise = noiseGenerator(8844);
  let silk = 0, low = 0;
  const bird = (t, start, frequency, rise) => {
    const age = t - start, length = .21;
    if (age <= 0 || age >= length) return 0;
    const envelope = Math.sin(Math.PI * age / length) ** 2;
    return .013 * envelope * Math.sin(tau * (frequency * age + rise * age * age));
  };
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate;
    silk += .23 * (noise() - silk);
    low += .057 * (silk - low);
    const breeze = (.093 + .032 * Math.sin(tau * t / seconds)) * (silk - low);
    const seam = Math.min(1, t / .12, (seconds - t) / .12);
    samples[i] = seam * (breeze + bird(t, 3.67, 1320, 870) + bird(t, 4.02, 1540, -680));
  }
  return samples;
}
