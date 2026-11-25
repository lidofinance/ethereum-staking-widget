import { FC } from 'react';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { Fallback } from 'shared/wallet';

import { Wallet } from './wallet';
import { useDappStatus } from 'modules/web3';

export const TopCard: FC = () => {
  const { isSupportedChain } = useDappStatus();

  // We allow unconnected wallet and don't show multichain for rewards
  return (
    <>
      {!isSupportedChain ? (
        <Fallback showMultichainBanner={false} />
      ) : (
        <Wallet />
      )}

      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
