import { config } from 'config';
import { QA_KEYS } from 'consts/qa-keys';

import { ManifestEntrySchema } from './validate';
import type { ManifestEntry } from './types';

// The overlay is re-read on every context memo recompute; one warning per
// page load is enough (mock changes require a reload anyway).
let warned = false;
const warnOnce = (...args: unknown[]) => {
  if (warned) return;
  warned = true;
  console.warn(...args);
};

// QA-only manifest-entry overlay (the drawer's "Use mocked manifest").
// Same per-browser power QA already has by intercepting the manifest
// response, but validated with the real entry schema and fail-closed:
// anything invalid falls back to the fetched config.
export const getQaMockManifestEntry = (): ManifestEntry | undefined => {
  if (!config.enableQaHelpers || typeof window === 'undefined')
    return undefined;
  if (localStorage.getItem(QA_KEYS.externalConfigMockEnabled) !== 'true')
    return undefined;

  const raw = localStorage.getItem(QA_KEYS.externalConfigMock);
  if (!raw) return undefined;

  try {
    const parsed = ManifestEntrySchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      warnOnce(
        '[qa-debug] external config manifest entry is MOCKED via localStorage',
      );
      return parsed.data;
    }
    warnOnce(
      '[qa-debug] mocked manifest entry failed schema validation, using real config:',
      parsed.error.message,
    );
  } catch (err) {
    warnOnce(
      '[qa-debug] mocked manifest entry is not valid JSON, using real config:',
      err,
    );
  }
  return undefined;
};
