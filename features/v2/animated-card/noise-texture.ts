// Tileable fbm baked into a texture once per page, so the shader does one
// texture fetch per noise lookup instead of 16 hashes. Periodic by
// construction, so the CPU can wrap the scroll offsets and nothing in the
// shader grows without bound (half-float safe).

export const NOISE_SIZE = 256;
/** noise units across one texture tile */
export const NOISE_PERIOD = 8;
const OCTAVES = 4;

// integer hash, deterministic across engines
const latticeHash = (x: number, y: number) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

const wrap = (value: number, period: number) =>
  ((value % period) + period) % period;

// value noise whose lattice repeats every `period` cells
const valueNoise = (x: number, y: number, period: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const x0 = wrap(xi, period);
  const x1 = wrap(xi + 1, period);
  const y0 = wrap(yi, period);
  const y1 = wrap(yi + 1, period);

  const top = latticeHash(x0, y0) * (1 - ux) + latticeHash(x1, y0) * ux;
  const bottom = latticeHash(x0, y1) * (1 - ux) + latticeHash(x1, y1) * ux;
  return top * (1 - uy) + bottom * uy;
};

// same octave sum as the original in-shader fbm, with frequency doubling
// so every octave tiles with the texture
const fbm = (x: number, y: number) => {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let octave = 0; octave < OCTAVES; octave++) {
    value +=
      amplitude *
      valueNoise(x * frequency, y * frequency, NOISE_PERIOD * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
};

let cached: Uint8Array | null = null;

/** NOISE_SIZE² luminance bytes, sampled at texel centres */
export const getNoiseTexels = () => {
  if (cached) return cached;
  const texels = new Uint8Array(NOISE_SIZE * NOISE_SIZE);
  const step = NOISE_PERIOD / NOISE_SIZE;
  for (let row = 0; row < NOISE_SIZE; row++) {
    for (let column = 0; column < NOISE_SIZE; column++) {
      const value = fbm((column + 0.5) * step, (row + 0.5) * step);
      texels[row * NOISE_SIZE + column] = Math.round(value * 255);
    }
  }
  cached = texels;
  return texels;
};
