import { FC } from 'react';

import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { Fallback } from 'shared/wallet';

import { Wallet } from './wallet';
import { useDappStatus } from 'modules/web3';

export const TopCard: FC = () => {
  const { isSupportedChain } = useDappStatus();

  // client-only to avoid a flash after reload, renders at once on client navigation
  // We allow unconnected wallet and don't show multichain for rewards
  return (
    <NoSSRWrapper>
      {!isSupportedChain ? (
        <Fallback showMultichainBanner={false} />
      ) : (
        <Wallet />
      )}

      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </NoSSRWrapper>
  );
};
