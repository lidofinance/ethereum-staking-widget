import { useConfig } from 'config';

export const DexDisclaimer = () => {
  const isDexEnabled = useConfig().externalConfig.withdrawalDex.enabled;

  if (!isDexEnabled) return null;

  return <p>Withdrawals performed by swaps are powered by CowSwap.</p>;
};
