import { useWithdrawalDex } from 'features/dex-withdrawals';

export const DexDisclaimer = () => {
  const { enabled, label } = useWithdrawalDex();

  if (!enabled) return null;

  return <p>Withdrawals performed by swaps are powered by {label}.</p>;
};
