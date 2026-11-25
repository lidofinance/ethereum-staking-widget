// Snow drifts on top edges of UI surfaces.
// A pile is a height map: one cell per PILE_COL px of the surface width.
// Pure functions, no DOM: the canvas layer feeds in coordinates.

export const PILE_COL = 3;

export type SnowPileKind = 'card' | 'block' | 'button';

export type SnowPile = {
  n: number;
  max: number;
  edge: number;
  h: Float32Array;
};

type PileShape = { max: number; edge: number; inset: number };

export const PILE_SHAPES: Record<SnowPileKind, PileShape> = {
  // `inset` keeps the drift off the rounded corners of the surface
  card: { max: 22, edge: 12, inset: 16 },
  block: { max: 13, edge: 12, inset: 16 },
  button: { max: 8, edge: 5, inset: 6 },
};

export const isPileKind = (value: unknown): value is SnowPileKind =>
  value === 'card' || value === 'block' || value === 'button';

export const getPileCellCount = (width: number) =>
  Math.max(4, Math.ceil(width / PILE_COL));

export const createPile = (width: number, kind: SnowPileKind): SnowPile => {
  const { max, edge } = PILE_SHAPES[kind];
  const n = getPileCellCount(width);
  return { n, max, edge, h: new Float32Array(n) };
};

// Max height of a cell: full in the middle, eased to zero at both ends
export const pileCap = (pile: SnowPile, j: number) => {
  const t = Math.max(
    0,
    Math.min(1, j / pile.edge, (pile.n - 1 - j) / pile.edge),
  );
  return pile.max * Math.sin((t * Math.PI) / 2);
};

// A drift that already lies there on the first paint
export const prefillPile = (pile: SnowPile) => {
  const { n } = pile;
  for (let j = 0; j < n; j++) {
    const wave =
      0.72 +
      0.16 * Math.sin(j * 0.05 + n * 0.3) +
      0.07 * Math.sin(j * 0.17 + 1);
    pile.h[j] = pileCap(pile, j) * wave;
  }
};

// A flake landed on cell j
export const depositOnPile = (pile: SnowPile, j: number) => {
  const add = (k: number, amount: number) => {
    if (k < 0 || k >= pile.n) return;
    pile.h[k] = Math.min(pileCap(pile, k), pile.h[k] + amount);
  };
  add(j, 1.1);
  add(j - 1, 0.35);
  add(j + 1, 0.35);
};

const REPOSE = 0.8;
const SLIDE = 0.3;
const SETTLE = 0.05;

// Steep steps slide down to the neighbour; total snow is conserved.
// Returns whether anything moved, so a settled drift is not redrawn.
export const relaxPile = (pile: SnowPile): boolean => {
  const { h } = pile;
  let moved = false;
  for (let j = 0; j < pile.n - 1; j++) {
    const d = h[j] - h[j + 1];
    // the small margin lets a drift settle instead of creeping forever
    if (Math.abs(d) <= REPOSE + SETTLE) continue;
    const m = (Math.abs(d) - REPOSE) * SLIDE;
    const [from, to] = d > 0 ? [j, j + 1] : [j + 1, j];
    if (h[to] + m > pileCap(pile, to)) continue;
    h[from] -= m;
    h[to] += m;
    moved = true;
  }
  return moved;
};

export const getPileVolume = (pile: SnowPile) =>
  pile.h.reduce((sum, v) => sum + v, 0);

export type SweptCell = { j: number; amount: number };

// The pointer moved through the drift: take snow from the cells under it.
// `x` is relative to the pile start, `depth` is how far below the drift top
// the pointer is (negative means above it).
export const sweepPile = (
  pile: SnowPile,
  x: number,
  pointerY: number,
  baseY: number,
  speed: number,
  radius = 16,
): SweptCell[] => {
  if (speed < 1.5) return [];
  const swept: SweptCell[] = [];
  const j0 = Math.max(0, Math.floor((x - radius) / PILE_COL));
  const j1 = Math.min(pile.n - 1, Math.ceil((x + radius) / PILE_COL));
  const force = Math.min(1, speed / 14);
  for (let j = j0; j <= j1; j++) {
    const top = baseY - pile.h[j];
    if (pile.h[j] < 0.5 || pointerY < top - 8 || pointerY > baseY + 4) continue;
    const cx = j * PILE_COL + PILE_COL / 2;
    const falloff = 1 - Math.abs(cx - x) / radius;
    if (falloff <= 0) continue;
    const amount = Math.min(pile.h[j], pile.h[j] * falloff * force);
    pile.h[j] -= amount;
    swept.push({ j, amount });
  }
  return swept;
};

// Knock the whole drift off (click)
export const clearPile = (pile: SnowPile) => {
  const knocked: SweptCell[] = [];
  for (let j = 0; j < pile.n; j++) {
    if (pile.h[j] >= 2) knocked.push({ j, amount: pile.h[j] * 0.85 });
    pile.h[j] *= 0.15;
  }
  return knocked;
};
