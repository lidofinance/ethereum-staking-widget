import { buildTreeLights } from '../tree-lights';

const TREE = (x: number) =>
  `M${x} 128.5 L${x + 7.2} 143.7 L${x + 4} 143.7 L${x + 11.5} 156.4 ` +
  `L${x + 7.2} 156.4 L${x + 14.3} 168.4 L${x - 14.3} 168.4 L${x - 7.2} 156.4 ` +
  `L${x - 11.5} 156.4 L${x - 4} 143.7 L${x - 7.2} 143.7 Z`;

describe('buildTreeLights', () => {
  const forest = [10, 60, 110, 160, 210, 260].map(TREE).join(' ');

  it('lights every fourth tree, starting from the second', () => {
    const lights = buildTreeLights(forest);
    // trees 1 and 5, six lights each
    expect(lights).toHaveLength(12);
  });

  it('keeps the lights inside the crown', () => {
    for (const { x, y } of buildTreeLights(forest)) {
      const tip = [60, 260].find((t) => Math.abs(x - t) < 15);
      expect(tip).toBeDefined();
      expect(y).toBeGreaterThan(128.5);
      expect(y).toBeLessThan(168.4);
      // half-width grows linearly from the tip to 14.3 at the base
      const half = ((y - 128.5) / (168.4 - 128.5)) * 14.3;
      expect(Math.abs(x - (tip as number))).toBeLessThanOrEqual(half + 1e-6);
    }
  });

  it('ignores garbage', () => {
    expect(buildTreeLights('')).toEqual([]);
    expect(buildTreeLights('M1 2 Z M3')).toEqual([]);
  });
});
