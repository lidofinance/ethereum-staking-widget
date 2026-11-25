// Fairy lights on the horizon forest: a few of the trees get small lights
// wound around them. Positions come from the generated forest outline, in
// the hills' viewBox coordinates.

export type TreeLight = {
  x: number;
  y: number;
  // animation offset and period, s
  delay: number;
  duration: number;
};

const LIGHTS_PER_TREE = 6;

// the outline lists each tree as `M tip L ... L baseRight L baseLeft ... Z`
const parseTrees = (forest: string) =>
  forest
    .split('M')
    .slice(1)
    .map((tree) => {
      const n = (tree.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
      return {
        tipX: n[0],
        tipY: n[1],
        baseHalf: n[10] - n[0],
        baseY: n[11],
      };
    })
    .filter(
      (t) => Number.isFinite(t.baseY) && t.baseY > t.tipY && t.baseHalf > 0,
    );

// Lights zigzag down every `every`-th tree, widening with the crown
export const buildTreeLights = (forest: string, every = 4): TreeLight[] => {
  const lights: TreeLight[] = [];
  parseTrees(forest).forEach((tree, i) => {
    if (i % every !== 1) return;
    const height = tree.baseY - tree.tipY;
    for (let k = 0; k < LIGHTS_PER_TREE; k++) {
      const t = 0.2 + (k * 0.72) / (LIGHTS_PER_TREE - 1);
      const side = k % 2 ? 1 : -1;
      const spread = 0.35 + 0.45 * (((i + k) * 0.618) % 1);
      const id = i * LIGHTS_PER_TREE + k;
      lights.push({
        x: tree.tipX + side * tree.baseHalf * t * spread,
        y: tree.tipY + height * t,
        delay: -((id * 0.73) % 4),
        duration: 2.2 + ((id * 7919) % 23) / 10,
      });
    }
  });
  return lights;
};
