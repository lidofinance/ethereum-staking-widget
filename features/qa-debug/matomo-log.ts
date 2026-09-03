import { config } from 'config';
import { QA_KEYS } from 'consts/qa-keys';
import { overrideWithQAMockBoolean } from 'utils/qa';

// QA logging of Matomo events — to the console and to an in-memory buffer
// shown in the QA debug drawer. Active only when `config.enableQaHelpers`
// is true AND the QA_KEYS.matomoLogging flag is on (toggled live from the
// drawer), so production sessions keep zero state.
// Lives outside qa-drawer/ so tracking call sites can import it without
// pulling the lazy-loaded drawer chunk into the entry bundle.

export type MatomoLogEntry = {
  id: number;
  time: number;
  label: string;
  event: readonly (string | number)[];
};

const MAX_LOG_ENTRIES = 200;

let entries: MatomoLogEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export const logMatomoEventForQA = (
  label: string,
  event: readonly (string | number)[],
): void => {
  if (!config.enableQaHelpers || typeof window === 'undefined') return;
  if (!overrideWithQAMockBoolean(false, QA_KEYS.matomoLogging)) return;

  console.info(
    '%cTracking Matomo event:',
    'background:#3152A0;color:#fff;padding:2px 4px;border-radius:2px',
    event.join(', '),
  );

  // newest first; new array reference on every change for useSyncExternalStore
  entries = [
    { id: nextId++, time: Date.now(), label, event },
    ...entries,
  ].slice(0, MAX_LOG_ENTRIES);
  emit();
};

export const clearMatomoEventLog = (): void => {
  entries = [];
  emit();
};

export const subscribeToMatomoEventLog = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getMatomoEventLog = (): MatomoLogEntry[] => entries;

const EMPTY_LOG: MatomoLogEntry[] = [];
export const getMatomoEventLogServerSnapshot = (): MatomoLogEntry[] =>
  EMPTY_LOG;
