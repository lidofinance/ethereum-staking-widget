import { CardBalance } from 'shared/wallet';
import { Status } from 'features/withdrawals/shared';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

import { WalletQueueTooltip } from './wallet-queue-tooltip';

export const WalletMode = () => {
  const { withdrawalsStatus, isBunker, isTurbo, isWithdrawalsStatusLoading } =
    useWithdrawals();

  const modeLabel = isBunker ? 'Bunker' : isTurbo ? 'Turbo' : 'Paused';

  const content = <Status variant={withdrawalsStatus}>{modeLabel}</Status>;
  const timeTitle = <>Withdrawals mode {<WalletQueueTooltip />}</>;

  return (
    <CardBalance
      small
      title={timeTitle}
      loading={isWithdrawalsStatusLoading}
      value={content}
    />
  );
};
