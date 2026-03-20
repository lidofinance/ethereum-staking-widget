import { useEffect } from 'react';
import { useLocalStorage } from 'shared/hooks/use-local-storage';
import { WHALE_BANNER_AB_STORAGE_KEY } from './consts';
import type { WhaleBannerABVariant } from './types';

export const useWhaleBannerABVariant = (): WhaleBannerABVariant => {
  const [variant, setVariant] = useLocalStorage<WhaleBannerABVariant | null>(
    WHALE_BANNER_AB_STORAGE_KEY,
    null,
  );

  useEffect(() => {
    if (variant !== 'A' && variant !== 'B') {
      const assigned: WhaleBannerABVariant = Math.random() < 0.5 ? 'A' : 'B';
      setVariant(assigned);
    }
  }, [variant, setVariant]);

  // Return 'A' as default while variant is being assigned on the client
  return variant === 'B' ? 'B' : 'A';
};
