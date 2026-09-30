#!/usr/bin/env node
/**
 * Renders the placeholder app icon, Android adaptive icon layers, splash mark and favicon from
 * one block layout. Run with `pnpm assets`. Change MARK below and re-run; never hand-edit PNGs.
 *
 * Opaque outputs (icon.png, android background, favicon) are written as RGB with no alpha
 * channel, because App Store review rejects icons that carry one.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ASSETS = path.join(__dirname, '..', 'assets');

const hex = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
const BG = hex('#080A12');
const GLOW_A = hex('#22D3EE');
const GLOW_B = hex('#A78BFA');

/** A T piece dropping into the slot of a small stack, on a 5 x 4 grid. */
const MARK = [
  {
    color: '#A78BFA',
    cells: [
      [1, 0],
      [2, 0],
      [3, 0],
      [2, 1],
    ],
  },
  {
    color: '#22D3EE',
    cells: [
      [0, 2],
      [1, 2],
      [0, 3],
      [1, 3],
    ],
  },
  {
    color: '#FACC15',
    cells: [
      [3, 2],
      [4, 2],
      [3, 3],
      [4, 3],
    ],
  },
  { color: '#FB923C', cells: [[2, 3]] },
];
const GRID_W = 5;
const GRID_H = 4;

// ---- PNG encoding -------------------------------------------------------------------------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/** `pixels` is Float32 RGBA in 0..1 (premultiplied is not used). */
const encodePng = (size, pixels, withAlpha) => {
  const channels = withAlpha ? 4 : 3;
  const raw = Buffer.alloc(size * (size * channels + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * channels + 1)] = 0;
    for (let x = 0; x < size; x += 1) {
      for (let c = 0; c < channels; c += 1) {
        const v = pixels[(y * size + x) * 4 + c];
        raw[y * (size * channels + 1) + 1 + x * channels + c] = Math.round(
          Math.max(0, Math.min(1, v)) * 255,
        );
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = withAlpha ? 6 : 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

// ---- Rasterising --------------------------------------------------------------------------

const createCanvas = (size) => ({ size, px: new Float32Array(size * size * 4) });

/** Source-over blend of a straight-alpha colour. */
const blend = (canvas, x, y, rgb, alpha) => {
  if (alpha <= 0) return;
  const i = (y * canvas.size + x) * 4;
  const p = canvas.px;
  const outA = alpha + p[i + 3] * (1 - alpha);
  for (let c = 0; c < 3; c += 1) {
    p[i + c] = outA ? ((rgb[c] / 255) * alpha + p[i + c] * p[i + 3] * (1 - alpha)) / outA : 0;
  }
  p[i + 3] = outA;
};

/** Signed distance to a rounded rectangle centred at (cx, cy). */
const roundedRectSdf = (px, py, cx, cy, hw, hh, r) => {
  const qx = Math.abs(px - cx) - hw + r;
  const qy = Math.abs(py - cy) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};

const fillRoundedRect = (canvas, { x, y, w, h, r, rgb, alpha = 1, feather = 1 }) => {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const pad = Math.ceil(feather) + 1;
  for (
    let py = Math.max(0, Math.floor(y - pad));
    py < Math.min(canvas.size, y + h + pad);
    py += 1
  ) {
    for (
      let px = Math.max(0, Math.floor(x - pad));
      px < Math.min(canvas.size, x + w + pad);
      px += 1
    ) {
      const d = roundedRectSdf(px + 0.5, py + 0.5, cx, cy, w / 2, h / 2, r);
      const coverage = Math.max(0, Math.min(1, 0.5 - d / feather));
      blend(canvas, px, py, rgb, coverage * alpha);
    }
  }
};

const fillBackground = (canvas, glow) => {
  const { size } = canvas;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const dx = x / size - 0.5;
      const dy = y / size - 0.45;
      const g = glow ? Math.max(0, 1 - Math.hypot(dx, dy) / 0.55) ** 2 * 0.22 : 0;
      const mixT = x / size;
      for (let c = 0; c < 3; c += 1) {
        const tint = GLOW_A[c] * (1 - mixT) + GLOW_B[c] * mixT;
        canvas.px[i + c] = (BG[c] + (tint - BG[c]) * g) / 255;
      }
      canvas.px[i + 3] = 1;
    }
  }
};

/**
 * Draws the block mark so its grid spans `extent` of the canvas width, centred.
 * `mono` draws every block in white, for the Android themed-icon layer.
 */
const drawMark = (canvas, extent, { mono = false, glow = true } = {}) => {
  const { size } = canvas;
  const cell = (size * extent) / GRID_W;
  const originX = (size - cell * GRID_W) / 2;
  const originY = (size - cell * GRID_H) / 2;
  const inset = cell * 0.06;
  const r = cell * 0.2;

  for (const piece of MARK) {
    const rgb = mono ? [255, 255, 255] : hex(piece.color);
    for (const [cx, cy] of piece.cells) {
      const x = originX + cx * cell + inset;
      const y = originY + cy * cell + inset;
      const w = cell - inset * 2;
      if (glow && !mono) {
        fillRoundedRect(canvas, {
          x: x - cell * 0.1,
          y: y - cell * 0.1,
          w: w + cell * 0.2,
          h: w + cell * 0.2,
          r: r * 1.6,
          rgb,
          alpha: 0.18,
          feather: cell * 0.25,
        });
      }
      fillRoundedRect(canvas, { x, y, w, h: w, r, rgb });
      if (!mono) {
        // Glossy highlight band across the top of each block.
        fillRoundedRect(canvas, {
          x: x + w * 0.14,
          y: y + w * 0.12,
          w: w * 0.72,
          h: w * 0.18,
          r: w * 0.09,
          rgb: [255, 255, 255],
          alpha: 0.35,
        });
      }
    }
  }
};

const write = (name, canvas, withAlpha) => {
  const file = path.join(ASSETS, name);
  fs.writeFileSync(file, encodePng(canvas.size, canvas.px, withAlpha));
  console.log(
    `wrote ${path.relative(process.cwd(), file)} (${canvas.size}px, ${withAlpha ? 'RGBA' : 'RGB'})`,
  );
};

const render = (size, draw) => {
  const canvas = createCanvas(size);
  draw(canvas);
  return canvas;
};

write(
  'icon.png',
  render(1024, (c) => {
    fillBackground(c, true);
    drawMark(c, 0.66);
  }),
  false,
);
write(
  'favicon.png',
  render(48, (c) => {
    fillBackground(c, false);
    drawMark(c, 0.8, { glow: false });
  }),
  false,
);
write(
  'android-icon-background.png',
  render(1024, (c) => fillBackground(c, true)),
  false,
);
// Adaptive icons are masked to roughly the centre 66%; keep the mark well inside that.
write(
  'android-icon-foreground.png',
  render(1024, (c) => drawMark(c, 0.5)),
  true,
);
write(
  'android-icon-monochrome.png',
  render(1024, (c) => drawMark(c, 0.5, { mono: true })),
  true,
);
write(
  'splash-icon.png',
  render(1024, (c) => drawMark(c, 0.9)),
  true,
);
