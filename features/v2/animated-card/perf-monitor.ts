// Frame-rate monitor for the liquid renderer. Pure and allocation-free in
// the hot path: fed rAF timestamps, it caps the draw rate and says when
// the device cannot keep up, so the renderer can step down a quality
// level.
//
// It judges frames against the display's own rate (30/60/90/120/144Hz,
// snapped from rAF deltas) so a 30Hz display, e.g. iOS Low Power Mode,
// is a baseline rather than a failure.

export type PerfStats = {
  displayHz: number;
  targetFps: number;
  fps: number;
  missRate: number;
  badWindows: number;
};

export type PerfVerdict = 'ok' | 'degrade';

export type PerfMonitor = {
  /** call on every rAF; `false` means skip drawing this frame (fps cap) */
  tick: (now: number) => boolean;
  /** call after a draw; returns a verdict when a window closes */
  drawn: (now: number) => PerfVerdict | null;
  /** ignore frames for a while, e.g. after a quality change */
  settle: (now: number, ms?: number) => void;
  /** max draws per second; 0 or Infinity for uncapped */
  setFpsCap: (fps: number) => void;
  getStats: () => PerfStats | null;
};

const DISPLAY_PERIODS_MS = [
  1000 / 144,
  1000 / 120,
  1000 / 90,
  1000 / 60,
  1000 / 30,
];
const PERIOD_SAMPLES = 32;
const PERIOD_MIN_SAMPLES = 8;
const WINDOW_MS = 2000;
// first frames after mount or resume carry compile, upload and layout work
export const WARMUP_MS = 3000;
// a rAF gap this long is a pause (hidden tab, off-screen), not jank
const PAUSE_GAP_MS = 250;
const BAD_WINDOWS_TO_DEGRADE = 2;
const MISS_RATE_LIMIT = 0.2;
const FPS_RATIO_LIMIT = 0.8;
// rAF timestamps jitter; a frame due "now" may arrive a hair early
const FRAME_SLACK_MS = 2;

const snapPeriod = (ms: number) =>
  DISPLAY_PERIODS_MS.reduce((best, period) =>
    Math.abs(period - ms) < Math.abs(best - ms) ? period : best,
  );

export const createPerfMonitor = (fpsCap: number): PerfMonitor => {
  const deltas = new Float64Array(PERIOD_SAMPLES);
  const scratch = new Float64Array(PERIOD_SAMPLES);
  let deltaCount = 0;
  let deltaIndex = 0;

  let period = 1000 / 60;
  let cap = fpsCap;
  let lastTick: number | null = null;
  let lastDraw: number | null = null;
  let ignoreUntil = -Infinity;

  let windowStart: number | null = null;
  let frames = 0;
  let misses = 0;
  let badWindows = 0;
  let stats: PerfStats | null = null;

  // draw interval: the cap rounded up to whole display frames
  const target = () => {
    const capInterval = cap > 0 && Number.isFinite(cap) ? 1000 / cap : 0;
    const frames = Math.ceil((capInterval - FRAME_SLACK_MS) / period);
    return Math.max(1, frames) * period;
  };

  const updatePeriod = () => {
    const count = Math.min(deltaCount, PERIOD_SAMPLES);
    if (count < PERIOD_MIN_SAMPLES) return;
    const sorted = scratch.subarray(0, count);
    sorted.set(deltas.subarray(0, count));
    sorted.sort();
    period = snapPeriod(sorted[count >> 1]);
  };

  const settle = (now: number, ms = WARMUP_MS) => {
    ignoreUntil = now + ms;
    windowStart = null;
    badWindows = 0;
  };

  return {
    tick: (now) => {
      if (lastTick === null) {
        settle(now);
      } else {
        const delta = now - lastTick;
        if (delta > PAUSE_GAP_MS) {
          settle(now);
          lastDraw = null;
        } else if (delta > 0) {
          deltas[deltaIndex] = delta;
          deltaIndex = (deltaIndex + 1) % PERIOD_SAMPLES;
          deltaCount += 1;
          if (deltaCount === PERIOD_MIN_SAMPLES) updatePeriod();
        }
      }
      lastTick = now;
      return lastDraw === null || now - lastDraw >= target() - FRAME_SLACK_MS;
    },

    drawn: (now) => {
      const previous = lastDraw;
      lastDraw = now;
      if (previous === null || now < ignoreUntil) {
        windowStart = null;
        return null;
      }

      if (windowStart === null) {
        windowStart = previous;
        frames = 0;
        misses = 0;
      }
      frames += 1;
      if (now - previous > target() + period / 2) misses += 1;

      const elapsed = now - windowStart;
      if (elapsed < WINDOW_MS) return null;

      updatePeriod();
      const targetFps = 1000 / target();
      const fps = (frames * 1000) / elapsed;
      const missRate = misses / frames;
      const isBad =
        missRate > MISS_RATE_LIMIT || fps < targetFps * FPS_RATIO_LIMIT;
      badWindows = isBad ? badWindows + 1 : 0;
      stats = {
        displayHz: 1000 / period,
        targetFps,
        fps,
        missRate,
        badWindows,
      };

      windowStart = now;
      frames = 0;
      misses = 0;
      if (badWindows < BAD_WINDOWS_TO_DEGRADE) return 'ok';
      badWindows = 0;
      return 'degrade';
    },

    settle,
    setFpsCap: (fps) => {
      cap = fps;
    },
    getStats: () => stats,
  };
};
