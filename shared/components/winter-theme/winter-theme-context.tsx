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
import { useAppFlag } from 'providers/app-flag';
import { useIsIframe } from 'shared/hooks/use-is-iframe';
import { useLocalStorage } from 'shared/hooks/use-local-storage';

import {
  LIGHTS_MODES,
  WINTER_STORAGE_KEY,
  isWinterThemeAllowed,
  isWinterThemeRequested,
  type LightsMode,
} from './constants';

type WinterSettings = {
  snow: boolean;
  lights: LightsMode;
};

const DEFAULT_SETTINGS: WinterSettings = { snow: true, lights: 'twinkle' };

export type WinterThemeValue = {
  // the flag asks for the theme; known on the server, used to reserve space
  requested: boolean;
  // the theme is on: client only, never inside Ledger Live or Safe
  enabled: boolean;
  reducedMotion: boolean;
  snow: boolean;
  lights: LightsMode;
  toggleSnow: () => void;
  cycleLights: () => void;
};

const DISABLED: WinterThemeValue = {
  requested: false,
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
  const appFlag = useAppFlag();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [stored, setStored] = useLocalStorage<WinterSettings>(
    WINTER_STORAGE_KEY,
    DEFAULT_SETTINGS,
  );

  // the theme depends on window (iframe, storage): render it on the client only
  useEffect(() => setMounted(true), []);

  const requested = isWinterThemeRequested(featureFlags.holidayDecorEnabled);
  const enabled =
    mounted && isWinterThemeAllowed({ requested, isIframe, appFlag });
  const snow = stored?.snow !== false;
  const lights = isLightsMode(stored?.lights) ? stored.lights : 'twinkle';

  // read the stored value, not the render closure: other tabs may have changed it
  const toggleSnow = useCallback(
    () =>
      setStored((s) => ({
        ...DEFAULT_SETTINGS,
        ...s,
        snow: s?.snow === false,
      })),
    [setStored],
  );

  const cycleLights = useCallback(
    () =>
      setStored((s) => {
        const current = isLightsMode(s?.lights) ? s.lights : 'twinkle';
        const next =
          LIGHTS_MODES[
            (LIGHTS_MODES.indexOf(current) + 1) % LIGHTS_MODES.length
          ];
        return { ...DEFAULT_SETTINGS, ...s, lights: next };
      }),
    [setStored],
  );

  const value = useMemo<WinterThemeValue>(
    () =>
      enabled
        ? {
            requested,
            enabled,
            reducedMotion,
            snow,
            // reduced motion: lights glow steady unless switched off
            lights: reducedMotion && lights !== 'off' ? 'steady' : lights,
            toggleSnow,
            cycleLights,
          }
        : { ...DISABLED, requested },
    [requested, enabled, reducedMotion, snow, lights, toggleSnow, cycleLights],
  );

  return (
    <WinterThemeContext.Provider value={value}>
      {children}
    </WinterThemeContext.Provider>
  );
};

export const useWinterTheme = (): WinterThemeValue =>
  useContext(WinterThemeContext);
