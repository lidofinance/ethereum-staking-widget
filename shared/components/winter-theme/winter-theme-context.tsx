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
  WINTER_STORAGE_KEY,
  isWinterThemeAllowed,
  isWinterThemeRequested,
} from './constants';

// lights used to be a mode ('twinkle' | 'chase' | 'steady' | 'off'): an old
// stored mode still reads as on, unless it was 'off'
type WinterSettings = {
  snow: boolean;
  lights: boolean | string;
};

const DEFAULT_SETTINGS: WinterSettings = { snow: true, lights: true };

const lightsOn = (value: unknown): boolean =>
  value !== false && value !== 'off';

export type WinterThemeValue = {
  // the flag asks for the theme; known on the server, used to reserve space
  requested: boolean;
  // the theme is on: client only, never inside Ledger Live or Safe
  enabled: boolean;
  reducedMotion: boolean;
  snow: boolean;
  lights: boolean;
  toggleSnow: () => void;
  toggleLights: () => void;
};

const DISABLED: WinterThemeValue = {
  requested: false,
  enabled: false,
  reducedMotion: false,
  snow: false,
  lights: false,
  toggleSnow: () => {},
  toggleLights: () => {},
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
  const lights = lightsOn(stored?.lights);

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

  const toggleLights = useCallback(
    () =>
      setStored((s) => ({
        ...DEFAULT_SETTINGS,
        ...s,
        lights: !lightsOn(s?.lights),
      })),
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
            // under reduced motion the lights glow without twinkling (CSS)
            lights,
            toggleSnow,
            toggleLights,
          }
        : { ...DISABLED, requested },
    [requested, enabled, reducedMotion, snow, lights, toggleSnow, toggleLights],
  );

  return (
    <WinterThemeContext.Provider value={value}>
      {children}
    </WinterThemeContext.Provider>
  );
};

export const useWinterTheme = (): WinterThemeValue =>
  useContext(WinterThemeContext);
