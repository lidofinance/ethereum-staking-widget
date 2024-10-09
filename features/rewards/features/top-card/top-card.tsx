import { FC, useEffect, useState } from 'react';
import { CHAINS } from '@lido-sdk/constants';

import { getConfig } from 'config';
import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { Fallback } from 'shared/wallet';

import { Wallet } from './wallet';

export const TopCard: FC = () => {
  const { defaultChain } = getConfig();
  const [visible, setVisible] = useState(false);
  const { isWalletConnected, isSupportedChain, isAccountActiveOnL2 } =
    useDappStatus();

  // fix flash after reload page
  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <>
      {isWalletConnected && !isSupportedChain ? (
        <Fallback
          error={`Unsupported chain. Please switch to ${CHAINS[defaultChain]} in your wallet.`}
        />
      ) : isAccountActiveOnL2 ? (
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
