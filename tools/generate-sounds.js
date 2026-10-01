#!/usr/bin/env node
/**
 * Synthesises the game's sound effects into assets/sounds/*.wav (16-bit mono PCM).
 * Run with `pnpm sounds`. Tweak the recipes below and re-run; never hand-edit the WAVs.
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

const note = (name) => {
  const semis = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  const octave = Number(name.slice(-1));
  return 440 * 2 ** ((semis[name[0]] + (octave - 4) * 12) / 12);
};

/** Soft square: odd harmonics rolled off, reads as "arcade" without being harsh. */
const softSquare = (phase) => Math.sin(phase) + Math.sin(3 * phase) / 5 + Math.sin(5 * phase) / 12;

/**
 * Renders one voice. `from`/`to` sweep the frequency; the envelope is a short attack and an
 * exponential decay controlled by `decay` (bigger = shorter).
 */
const tone = ({ from, to = from, ms, gain = 0.5, decay = 6, noise = 0, wave = softSquare }) => {
  const length = Math.round((SAMPLE_RATE * ms) / 1000);
  const out = new Float32Array(length);
  let phase = 0;
  for (let i = 0; i < length; i += 1) {
    const t = i / length;
    const freq = from * (to / from) ** t;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const attack = Math.min(1, i / (SAMPLE_RATE * 0.003));
    const env = attack * Math.exp(-decay * t);
    const n = noise ? (Math.random() * 2 - 1) * noise : 0;
    out[i] = (wave(phase) * (1 - noise) + n) * env * gain;
  }
  return out;
};

const concat = (...parts) => {
  const out = new Float32Array(parts.reduce((sum, p) => sum + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

const mix = (...parts) => {
  const out = new Float32Array(Math.max(...parts.map((p) => p.length)));
  for (const part of parts) part.forEach((v, i) => (out[i] += v));
  return out;
};

const arpeggio = (notes, ms, gain = 0.4) =>
  concat(...notes.map((n) => tone({ from: note(n), ms, gain, decay: 3 })));

const RECIPES = {
  move: () => tone({ from: 1400, ms: 22, gain: 0.25, decay: 8 }),
  rotate: () => tone({ from: 1500, to: 2100, ms: 40, gain: 0.3, decay: 6 }),
  hold: () => tone({ from: 520, to: 980, ms: 90, gain: 0.35, decay: 4, wave: Math.sin }),
  lock: () =>
    mix(
      tone({ from: 190, to: 120, ms: 70, gain: 0.55, decay: 7, wave: Math.sin }),
      tone({ from: 2000, ms: 12, gain: 0.25, noise: 0.8, decay: 10 }),
    ),
  'hard-drop': () =>
    mix(
      tone({ from: 160, to: 55, ms: 140, gain: 0.7, decay: 5, wave: Math.sin }),
      tone({ from: 900, ms: 60, gain: 0.35, noise: 0.9, decay: 9 }),
    ),
  clear: () => arpeggio(['C6', 'E6', 'G6'], 55),
  tetris: () =>
    concat(
      arpeggio(['C5', 'E5', 'G5', 'C6', 'E6'], 50),
      tone({ from: note('G6'), ms: 260, gain: 0.4, decay: 4 }),
    ),
  'level-up': () =>
    concat(
      arpeggio(['G5', 'C6', 'E6', 'G6'], 60),
      tone({ from: note('C7'), ms: 200, decay: 4, gain: 0.35 }),
    ),
  // Zone: a slow downward sweep, like time thickening.
  'zone-start': () =>
    mix(
      tone({ from: 880, to: 110, ms: 520, gain: 0.45, decay: 2, wave: Math.sin }),
      tone({ from: 220, to: 55, ms: 520, gain: 0.3, decay: 2 }),
    ),
  // Zone burst: a heavy hit, then a bright rising run.
  'zone-end': () =>
    concat(
      mix(
        tone({ from: 140, to: 40, ms: 220, gain: 0.8, decay: 4, wave: Math.sin }),
        tone({ from: 1200, ms: 120, gain: 0.4, noise: 0.9, decay: 6 }),
      ),
      arpeggio(['C5', 'G5', 'C6', 'E6', 'G6', 'C7'], 45, 0.35),
    ),
  chain: () => arpeggio(['E6', 'B6'], 50, 0.35),
  // Mutator: a short detuned glitch.
  mutator: () =>
    concat(
      tone({ from: 300, to: 1800, ms: 60, gain: 0.35, decay: 3 }),
      tone({ from: 1700, to: 240, ms: 80, gain: 0.3, noise: 0.4, decay: 3 }),
    ),
  complete: () =>
    concat(
      arpeggio(['C5', 'E5', 'G5', 'C6'], 70, 0.4),
      tone({ from: note('E6'), ms: 140, gain: 0.35, decay: 3 }),
      tone({ from: note('G6'), ms: 420, gain: 0.4, decay: 2.5 }),
    ),
  'game-over': () =>
    concat(
      ...['G4', 'E4', 'C4'].map((n) => tone({ from: note(n), ms: 160, gain: 0.45, decay: 2.5 })),
      tone({ from: note('G3'), to: note('G3') * 0.9, ms: 480, gain: 0.45, decay: 3 }),
    ),
};

const toWav = (samples) => {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) =>
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2),
  );
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
};

// Deterministic noise so re-running the script produces identical files.
let seed = 1;
Math.random = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [name, recipe] of Object.entries(RECIPES)) {
  const file = path.join(OUT_DIR, `${name}.wav`);
  fs.writeFileSync(file, toWav(recipe()));
  console.log(`wrote ${path.relative(process.cwd(), file)}`);
}
