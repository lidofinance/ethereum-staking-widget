import { useSyncExternalStore } from 'react';

import type { PerfStats } from './perf-monitor';

// Quality ladder. The shader steps down one level at a time when the
// device cannot hold the frame rate; past the last level the card falls
// back to the SVG.
export const QUALITY_LEVELS = [
  { name: 'high', resolutionScale: 1, fpsCap: Infinity },
  { name: 'medium', resolutionScale: 0.7, fpsCap: Infinity },
  { name: 'low', resolutionScale: 0.5, fpsCap: 20 },
] as const;

export type QualityLevel = 0 | 1 | 2;
/** `svg` is the level past the ladder */
export type PerfLevel = QualityLevel | 'svg';
export const LOWEST_LEVEL: QualityLevel = 2;

// bump when the shader changes cost, so remembered levels are re-measured
const SHADER_VERSION = 2;
const STORAGE_KEY = 'v2-liquid-perf-level';
const REMEMBER_MS = 7 * 24 * 60 * 60 * 1000;

type StoredLevel = { level: PerfLevel; version: number; ts: number };

/** last level this browser settled on, so slow devices skip re-measuring */
export const loadRememberedLevel = (): PerfLevel => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const stored: StoredLevel = JSON.parse(raw);
    const isFresh =
      stored.version === SHADER_VERSION && Date.now() - stored.ts < REMEMBER_MS;
    return isFresh ? stored.level : 0;
  } catch {
    return 0;
  }
};

export const rememberLevel = (level: PerfLevel) => {
  try {
    if (level === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const stored: StoredLevel = {
      level,
      version: SHADER_VERSION,
      ts: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // re-measured next visit
  }
};

// Live status for the controls panel

export type LiquidStatus = {
  /** what is on screen and why */
  state: string;
  level: PerfLevel | null;
  gpu: string | null;
  perf: PerfStats | null;
};

const INITIAL_STATUS: LiquidStatus = {
  state: 'starting',
  level: null,
  gpu: null,
  perf: null,
};

let status = INITIAL_STATUS;
const listeners = new Set<() => void>();

export const setLiquidStatus = (patch: Partial<LiquidStatus>) => {
  status = { ...status, ...patch };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useLiquidStatus = () =>
  useSyncExternalStore(
    subscribe,
    () => status,
    () => INITIAL_STATUS,
  );
