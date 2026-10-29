import type { Address } from 'viem';

import { useLocalStorage } from 'shared/hooks/use-local-storage';

import { SMART_SUGGEST_OPEN_STORAGE_KEY } from '../consts';

// Each account keeps its own state. The block is collapsed by default.
export const useSmartSuggestOpen = (address: Address) =>
  useLocalStorage<boolean>(
    `${SMART_SUGGEST_OPEN_STORAGE_KEY}:${address.toLowerCase()}`,
    false,
  );
