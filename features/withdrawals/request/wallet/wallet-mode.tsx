import { CardBalance } from 'shared/wallet';
import { Status } from 'features/withdrawals/shared';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

import { WalletQueueTooltip } from './wallet-queue-tooltip';

export const WalletMode = () => {
  const {
    withdrawalsStatus,
    isBunker,
    isTurbo,
    isWithdrawalsStatusLoading,
    isPaused,
  } = useWithdrawals();

  const modeLabel = (() => {
    if (isPaused) return 'Paused';
    if (isBunker) return 'Bunker';
    if (isTurbo) return 'Turbo';
    return '-';
  })();

  const content = <Status variant={withdrawalsStatus}>{modeLabel}</Status>;
  const timeTitle = <>Withdrawals mode {<WalletQueueTooltip />}</>;

  return (
    <CardBalance
      small
      data-testid="withdrawalsMode"
      title={timeTitle}
      loading={isWithdrawalsStatusLoading}
      value={content}
    />
  );
};
