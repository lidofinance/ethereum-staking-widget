import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from 'react';

import { useConfig } from 'config';
import { useIsIframe } from 'shared/hooks/use-is-iframe';
import { useLocalStorage } from 'shared/hooks/use-local-storage';

import { LIGHTS_MODES, WINTER_STORAGE_KEY, type LightsMode } from './constants';

type WinterSettings = {
  snow: boolean;
  lights: LightsMode;
};

const DEFAULT_SETTINGS: WinterSettings = { snow: true, lights: 'twinkle' };

export type WinterThemeValue = {
  // the whole theme: manifest flag, and never inside Ledger Live / Safe
  enabled: boolean;
  reducedMotion: boolean;
  snow: boolean;
  lights: LightsMode;
  toggleSnow: () => void;
  cycleLights: () => void;
};

const DISABLED: WinterThemeValue = {
  enabled: false,
  reducedMotion: false,
  snow: false,
  lights: 'off',
  toggleSnow: () => {},
  cycleLights: () => {},
};

const WinterThemeContext = createContext<WinterThemeValue>(DISABLED);

const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
};

const isLightsMode = (value: unknown): value is LightsMode =>
  LIGHTS_MODES.includes(value as LightsMode);

export const WinterThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { featureFlags } = useConfig().externalConfig;
  const isIframe = useIsIframe();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [stored, setStored] = useLocalStorage<WinterSettings>(
    WINTER_STORAGE_KEY,
    DEFAULT_SETTINGS,
  );

  // the theme depends on window (iframe, storage): render it on the client only
  useEffect(() => setMounted(true), []);

  const enabled = mounted && !!featureFlags.holidayDecorEnabled && !isIframe;
  const snow = stored?.snow !== false;
  const lights = isLightsMode(stored?.lights) ? stored.lights : 'twinkle';

  const toggleSnow = useCallback(
    () => setStored((s) => ({ ...DEFAULT_SETTINGS, ...s, snow: !snow })),
    [setStored, snow],
  );

  const cycleLights = useCallback(() => {
    const next =
      LIGHTS_MODES[(LIGHTS_MODES.indexOf(lights) + 1) % LIGHTS_MODES.length];
    setStored((s) => ({ ...DEFAULT_SETTINGS, ...s, lights: next }));
  }, [setStored, lights]);

  const value = useMemo<WinterThemeValue>(
    () =>
      enabled
        ? {
            enabled,
            reducedMotion,
            snow,
            // reduced motion: lights glow steady unless switched off
            lights: reducedMotion && lights !== 'off' ? 'steady' : lights,
            toggleSnow,
            cycleLights,
          }
        : DISABLED,
    [enabled, reducedMotion, snow, lights, toggleSnow, cycleLights],
  );

  return (
    <WinterThemeContext.Provider value={value}>
      {children}
    </WinterThemeContext.Provider>
  );
};

export const useWinterTheme = (): WinterThemeValue =>
  useContext(WinterThemeContext);
