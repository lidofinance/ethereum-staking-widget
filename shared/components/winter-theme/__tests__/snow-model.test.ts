import {
  PILE_COL,
  clearPile,
  createPile,
  depositOnPile,
  getPileVolume,
  isPileKind,
  pileCap,
  prefillPile,
  relaxPile,
  sweepPile,
} from '../snow-model';

describe('snow-model', () => {
  it('sizes the height map to the surface width', () => {
    const pile = createPile(300, 'card');
    expect(pile.n).toBe(100);
    expect(pile.h).toHaveLength(100);
    expect(getPileVolume(pile)).toBe(0);
  });

  it('keeps the ends of a drift empty and the middle full', () => {
    const pile = createPile(300, 'card');
    expect(pileCap(pile, 0)).toBe(0);
    expect(pileCap(pile, pile.n - 1)).toBe(0);
    expect(pileCap(pile, 50)).toBeCloseTo(pile.max);
    // eased, not linear
    expect(pileCap(pile, pile.edge / 2)).toBeGreaterThan(pile.max / 2);
  });

  it('prefills a drift that never exceeds its cap', () => {
    const pile = createPile(400, 'card');
    prefillPile(pile);
    expect(getPileVolume(pile)).toBeGreaterThan(0);
    pile.h.forEach((h, j) => {
      expect(h).toBeLessThanOrEqual(pileCap(pile, j) + 1e-6);
    });
  });

  it('grows where flakes land, up to the cap', () => {
    const pile = createPile(300, 'button');
    for (let i = 0; i < 100; i++) depositOnPile(pile, 50);
    expect(pile.h[50]).toBeCloseTo(pileCap(pile, 50));
    expect(pile.h[49]).toBeGreaterThan(0);
    expect(pile.h[10]).toBe(0);
  });

  it('ignores flakes outside the pile', () => {
    const pile = createPile(30, 'button');
    expect(() => depositOnPile(pile, -1)).not.toThrow();
    expect(() => depositOnPile(pile, pile.n)).not.toThrow();
  });

  it('smooths steep steps without losing snow', () => {
    const pile = createPile(300, 'card');
    pile.h[50] = 20;
    const before = getPileVolume(pile);
    for (let i = 0; i < 50; i++) relaxPile(pile);
    expect(getPileVolume(pile)).toBeCloseTo(before, 4);
    expect(pile.h[50]).toBeLessThan(20);
    expect(pile.h[51]).toBeGreaterThan(0);
  });

  it('reports whether relaxing moved any snow', () => {
    const pile = createPile(300, 'card');
    pile.h[50] = 20;
    expect(relaxPile(pile)).toBe(true);
    for (let i = 0; i < 500; i++) relaxPile(pile);
    // a settled drift stays put, so it is not redrawn
    expect(relaxPile(pile)).toBe(false);
  });

  it('does not drain a prefilled drift over time', () => {
    const pile = createPile(400, 'card');
    prefillPile(pile);
    const before = getPileVolume(pile);
    for (let i = 0; i < 2000; i++) relaxPile(pile);
    expect(getPileVolume(pile)).toBeCloseTo(before, 3);
  });

  describe('sweepPile', () => {
    const filled = () => {
      const pile = createPile(300, 'card');
      prefillPile(pile);
      return pile;
    };
    const baseY = 100;
    const x = 50 * PILE_COL;

    it('takes snow from under a moving pointer', () => {
      const pile = filled();
      const before = pile.h[50];
      const swept = sweepPile(pile, x, baseY - 5, baseY, 20);
      expect(swept.length).toBeGreaterThan(0);
      expect(pile.h[50]).toBeLessThan(before);
      // cells far from the pointer stay
      expect(pile.h[80]).toBeGreaterThan(0);
    });

    it('does nothing for a slow pointer', () => {
      const pile = filled();
      expect(sweepPile(pile, x, baseY - 5, baseY, 1)).toEqual([]);
    });

    it('does nothing when the pointer is well above the drift', () => {
      const pile = filled();
      expect(sweepPile(pile, x, baseY - 80, baseY, 20)).toEqual([]);
    });

    it('reports exactly the snow it removed', () => {
      const pile = filled();
      const before = getPileVolume(pile);
      const swept = sweepPile(pile, x, baseY - 5, baseY, 30);
      const removed = swept.reduce((sum, c) => sum + c.amount, 0);
      expect(before - getPileVolume(pile)).toBeCloseTo(removed, 3);
    });
  });

  it('knocks most of the drift off on click', () => {
    const pile = createPile(300, 'card');
    prefillPile(pile);
    const before = getPileVolume(pile);
    const knocked = clearPile(pile);
    expect(knocked.length).toBeGreaterThan(0);
    expect(getPileVolume(pile)).toBeCloseTo(before * 0.15, 2);
  });

  it('recognises pile kinds from the data attribute', () => {
    expect(isPileKind('card')).toBe(true);
    expect(isPileKind('block')).toBe(true);
    expect(isPileKind('button')).toBe(true);
    expect(isPileKind('banner')).toBe(false);
    expect(isPileKind(null)).toBe(false);
  });
});
