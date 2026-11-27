import { describe, expect, it } from 'vitest';

import { createPerfMonitor, type PerfVerdict } from './perf-monitor';

type RunArgs = {
  displayHz: number;
  fpsCap: number;
  durationMs: number;
  /** display frames each draw blocks; 1 = draws keep up */
  drawCostFrames?: number;
  /** extra gap inserted once at this time, ms */
  pauseAt?: number;
};

// simulates rAF on a display: a slow draw delays the next callbacks by
// whole vsyncs, like a GPU-bound page
const run = ({
  displayHz,
  fpsCap,
  durationMs,
  drawCostFrames = 1,
  pauseAt,
}: RunArgs) => {
  const monitor = createPerfMonitor(fpsCap);
  const period = 1000 / displayHz;
  const verdicts: PerfVerdict[] = [];
  let draws = 0;
  let paused = false;

  for (let now = 0; now < durationMs;) {
    if (pauseAt !== undefined && !paused && now >= pauseAt) {
      paused = true;
      now += 5000;
    }
    if (monitor.tick(now)) {
      draws += 1;
      const verdict = monitor.drawn(now);
      if (verdict) verdicts.push(verdict);
      now += period * drawCostFrames;
    } else {
      now += period;
    }
  }
  return { verdicts, draws, stats: monitor.getStats() };
};

describe('createPerfMonitor', () => {
  it('caps the draw rate to whole display frames', () => {
    const { draws, stats } = run({
      displayHz: 60,
      fpsCap: 30,
      durationMs: 10_000,
    });
    expect(draws).toBeGreaterThan(295);
    expect(draws).toBeLessThan(305);
    expect(stats?.displayHz).toBeCloseTo(60, 0);
    expect(stats?.targetFps).toBeCloseTo(30, 0);
  });

  it.each([30, 60, 120, 144])(
    'keeps a %iHz display that keeps up at full quality',
    (displayHz) => {
      const { verdicts } = run({ displayHz, fpsCap: 30, durationMs: 20_000 });
      expect(verdicts.length).toBeGreaterThan(0);
      expect(verdicts).not.toContain('degrade');
    },
  );

  it('degrades when draws keep missing the target', () => {
    // each draw takes 3 vsyncs at 60Hz: 20fps against a 30fps target
    const { verdicts } = run({
      displayHz: 60,
      fpsCap: 30,
      durationMs: 10_000,
      drawCostFrames: 3,
    });
    expect(verdicts).toContain('degrade');
  });

  it('does not judge the warm-up', () => {
    const { verdicts } = run({
      displayHz: 60,
      fpsCap: 30,
      durationMs: 2900,
      drawCostFrames: 3,
    });
    expect(verdicts).toEqual([]);
  });

  it('treats a long rAF gap as a pause, not jank', () => {
    const { verdicts } = run({
      displayHz: 60,
      fpsCap: 30,
      durationMs: 20_000,
      pauseAt: 6000,
    });
    expect(verdicts).not.toContain('degrade');
  });

  it('runs uncapped at the display rate', () => {
    const { stats } = run({ displayHz: 120, fpsCap: 0, durationMs: 10_000 });
    expect(stats?.targetFps).toBeCloseTo(120, 0);
    expect(stats?.fps).toBeGreaterThan(110);
  });
});
