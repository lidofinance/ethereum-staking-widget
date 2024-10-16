import { FC, useEffect, useState } from 'react';
import { CHAINS } from '@lido-sdk/constants';

import { getConfig } from 'config';
import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { useDappStatus } from 'modules/web3';
import { Fallback } from 'shared/wallet';

import { Wallet } from './wallet';

export const TopCard: FC = () => {
  const { defaultChain } = getConfig();
  const [visible, setVisible] = useState(false);
  const { isSupportedChain } = useDappStatus();

  // fix flash after reload page
  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <>
      {!isSupportedChain ? (
        <Fallback
          error={`Unsupported chain. Please switch to ${CHAINS[defaultChain]} in your wallet.`}
        />
      ) : (
        <Wallet />
      )}

      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
