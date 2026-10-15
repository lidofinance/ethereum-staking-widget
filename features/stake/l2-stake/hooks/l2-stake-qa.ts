import { useEffect, useState } from 'react';
import { config } from 'config';
import {
  ManifestConfigL2StakeModes,
  type ManifestConfigL2StakeMode,
} from 'config/external-config';

const QA_MODE_KEY = 'mock-qa-helpers-l2-stake-mode';

const isL2StakeMode = (value: unknown): value is ManifestConfigL2StakeMode =>
  typeof value === 'string' && value in ManifestConfigL2StakeModes;

// Pins the lane mode per browser, over the remote config's, to walk the
// fast-only and slow-only states on a stand whose manifest cannot be
// changed. Usage: `setMockL2StakeMode('slowLaneOnly')`, no argument clears it
if (config.enableQaHelpers && typeof window !== 'undefined') {
  (window as any).setMockL2StakeMode = (mode?: string) => {
    if (mode === undefined) localStorage.removeItem(QA_MODE_KEY);
    else if (isL2StakeMode(mode)) localStorage.setItem(QA_MODE_KEY, mode);
    else {
      console.warn(
        `[qa] unknown L2 stake mode "${mode}", expected one of: ${Object.keys(ManifestConfigL2StakeModes).join(', ')}`,
      );
      return;
    }
    window.location.reload();
  };
}

// A typo is ignored rather than applied
export const getMockedL2StakeMode = (): ManifestConfigL2StakeMode | null => {
  if (!config.enableQaHelpers || typeof window === 'undefined') return null;
  const mode = localStorage.getItem(QA_MODE_KEY);
  return isL2StakeMode(mode) ? mode : null;
};

// Read after mount: the first client render then matches the server's
export const useMockedL2StakeMode = () => {
  const [mode, setMode] = useState<ManifestConfigL2StakeMode | null>(null);
  useEffect(() => {
    setMode(getMockedL2StakeMode());
  }, []);
  return mode;
};
