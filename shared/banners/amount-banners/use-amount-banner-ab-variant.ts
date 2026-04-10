import { useEffect } from 'react';
import { useLocalStorage } from 'shared/hooks/use-local-storage';
import { AMOUNT_BANNER_AB_STORAGE_KEY } from './consts';
import type { AmountBannerABVariant } from './types';

export const useAmountBannerABVariant = (): AmountBannerABVariant => {
  const [variant, setVariant] = useLocalStorage<AmountBannerABVariant | null>(
    AMOUNT_BANNER_AB_STORAGE_KEY,
    null,
  );

  useEffect(() => {
    if (variant !== 'A' && variant !== 'B') {
      const assigned: AmountBannerABVariant = Math.random() < 0.5 ? 'A' : 'B';
      setVariant(assigned);
    }
  }, [variant, setVariant]);

  // Return 'A' as default while variant is being assigned on the client
  return variant === 'B' ? 'B' : 'A';
};
