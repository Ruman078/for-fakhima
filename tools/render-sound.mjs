// Run with node tools/render-sound.mjs after changing the score. The static
// PCM files are the same score for browsers with only native media playback.
import { mkdir, writeFile } from 'node:fs/promises';
import { score, rate, renderCue, renderAir } from '../scripts/sound-design.mjs';

function wav(samples) {
  // The cue partials fit below 4 kHz. Native-media playback uses 8 kHz
  // mono PCM so the opt-in transfer stays small on mobile data.
  const frames = Math.ceil(samples.length / 2);
  const file = Buffer.alloc(44 + frames * 2);
  file.write('RIFF', 0);
  file.writeUInt32LE(file.length - 8, 4);
  file.write('WAVEfmt ', 8);
  file.writeUInt32LE(16, 16);
  file.writeUInt16LE(1, 20);
  file.writeUInt16LE(1, 22);
  file.writeUInt32LE(rate / 2, 24);
  file.writeUInt32LE(rate, 28);
  file.writeUInt16LE(2, 32);
  file.writeUInt16LE(16, 34);
  file.write('data', 36);
  file.writeUInt32LE(file.length - 44, 40);
  for (let i = 0; i < frames; i++) {
    const pair = .5 * (samples[2 * i] + (samples[2 * i + 1] || 0));
    file.writeInt16LE(Math.round(32767 * Math.max(-1, Math.min(1, pair))), 44 + 2 * i);
  }
  return file;
}
const directory = new URL('../audio/', import.meta.url);
await mkdir(new URL('cues/', directory), { recursive: true });
for (const key of Object.keys(score)) {
  await writeFile(new URL('cues/' + key + '.wav', directory), wav(renderCue(key)));
}
await writeFile(new URL('garden-air.wav', directory), wav(renderAir()));
